import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { EventForm } from "@/components/EventForm"

export const dynamic = "force-dynamic"

type EditEventPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { id } = await params
  const [event, categories] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!event) notFound()

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="label">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit Event</h1>
      </div>
      <EventForm categories={categories} userId={user.id} event={event} />
    </main>
  )
}
