import Image from "next/image"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, Users } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { formatDate, formatSeatsLeft } from "@/lib/utils"
import { computeCapacityForecast } from "@/lib/forecast"
import { CapacityForecast } from "@/components/CapacityForecast"
import { EventActionButton } from "@/components/EventActionButton"

export const dynamic = "force-dynamic"

type EventDetailProps = {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { id } = await params
  const [event, user] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        registrations: { select: { id: true, userId: true, registeredAt: true } },
        waitlists: { where: { status: "waiting" } },
      },
    }),
    getCurrentUser(),
  ])

  if (!event) notFound()

  const userRegistration = user ? event.registrations.find((registration) => registration.userId === user.id) : undefined
  const userWaitlist = user ? event.waitlists.find((entry) => entry.userId === user.id) : undefined
  const soldOut = event.registeredCount >= event.totalSeats
  const filledPct = Math.min(Math.round((event.registeredCount / event.totalSeats) * 100), 100)
  const forecast = computeCapacityForecast(event.totalSeats, event.registeredCount, event.registrations, event.date)

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
      <section>
        <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-border">
          <Image src={event.imageUrl} alt="" fill className="object-cover" priority />
        </div>
        <div className="mt-8">
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#6366F1]">{event.category.name}</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{event.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#6366F1]" />{formatDate(event.date)}</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#6366F1]" />{event.location}</span>
          </div>
          <p className="mt-6 leading-relaxed text-muted">{event.description}</p>
        </div>
        <iframe className="mt-8 h-72 w-full rounded-xl border border-border" src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`} loading="lazy" />
      </section>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Registration</h2>
            <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#6366F1]">{formatSeatsLeft(event.registeredCount, event.totalSeats)}</span>
          </div>
          <div className="mb-5">
            <div className="mb-2 flex justify-between text-xs font-medium">
              <span className="text-muted">{event.registeredCount} registered</span>
              <span>{filledPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
              <div className="h-2 rounded-full bg-[#6366F1]" style={{ width: `${filledPct}%` }} />
            </div>
          </div>
          <EventActionButton eventId={event.id} userId={user?.id} registrationId={userRegistration?.id} waitlisted={Boolean(userWaitlist)} soldOut={soldOut} />
          {soldOut ? <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Users className="h-4 w-4" />{event.waitlists.length} people on waitlist</p> : null}
        </section>
        <CapacityForecast forecast={forecast} />
      </aside>
    </main>
  )
}
