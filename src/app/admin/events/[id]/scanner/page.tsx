import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { QRScanner } from "@/components/QRScanner"

export const dynamic = "force-dynamic"

type ScannerPageProps = {
  params: Promise<{ id: string }>
}

export default async function ScannerPage({ params }: ScannerPageProps) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true, attendance: true } } },
  })

  if (!event) notFound()

  return (
    <main className="dark min-h-[calc(100vh-4rem)] bg-[#0F172A] px-4 py-8 text-[#F1F5F9] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <QRScanner
          eventId={event.id}
          eventName={event.title}
          adminId={user.id}
          checkedIn={event._count.attendance}
          totalRegistrations={event._count.registrations}
        />
      </div>
    </main>
  )
}
