import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { QRTicket } from "@/components/QRTicket"

export const dynamic = "force-dynamic"

type TicketPageProps = {
  params: Promise<{ registrationId: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { registrationId } = await params
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { user: true, event: true },
  })

  if (!registration || registration.userId !== user.id) notFound()

  return (
    <main className="px-4 py-12">
      <QRTicket registration={registration} />
    </main>
  )
}
