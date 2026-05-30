import Link from "next/link"
import { notFound } from "next/navigation"
import { Camera } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { ParticipantsClient } from "@/components/ParticipantsClient"

export const dynamic = "force-dynamic"

type ParticipantsPageProps = {
  params: Promise<{ id: string }>
}

export default async function ParticipantsPage({ params }: ParticipantsPageProps) {
  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: { include: { user: true }, orderBy: { registeredAt: "desc" } },
      waitlists: { include: { user: true }, orderBy: { position: "asc" } },
      attendance: { include: { user: true }, orderBy: { markedAt: "desc" } },
    },
  })

  if (!event) notFound()

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label">{formatDate(event.date)}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{event.title}</h1>
        </div>
        <Link href={`/admin/events/${event.id}/scanner`} className="btn-primary inline-flex items-center gap-2"><Camera className="h-4 w-4" />Open Scanner</Link>
      </div>
      <ParticipantsClient registrations={event.registrations} waitlists={event.waitlists} attendance={event.attendance} />
    </main>
  )
}
