import Link from "next/link"
import { ArrowRight, Briefcase, GraduationCap, Palette, Trophy, Cpu } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { EventCard } from "@/components/EventCard"
import { demoCategories, demoEvents } from "@/lib/demo-data"

export const dynamic = "force-dynamic"

const categoryIcons = [Cpu, Briefcase, Palette, Trophy, GraduationCap]

export default async function LandingPage() {
  const { events, eventCount, registrationCount, categories } = await getLandingData()

  return (
    <main>
      <section className="dot-grid bg-white dark:bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Manage, Discover & Register for Events Seamlessly</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Browse high-signal events, register in seconds, and walk in with a QR ticket that just works.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="btn-primary inline-flex items-center gap-2">Explore events <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/register" className="btn-outline">Create account</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <Stat value={eventCount} label="Events Live" />
          <Stat value={registrationCount} label="Registrations" />
          <Stat value={5} label="Cities" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="label">Featured</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Upcoming events</h2>
          </div>
          <Link href="/events" className="text-sm font-medium text-[#6366F1]">View all</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length]
            return (
              <Link key={category.id} href={`/events?category=${category.slug}`} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-[#6366F1]" />
                {category.name}
                <span className="text-muted">{category._count.events}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-indigo-100 bg-[#EEF2FF] p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Ready to host?</h2>
          <p className="mt-2 max-w-xl text-[#64748B]">Run registration, waitlists, QR check-in, and forecasting from one clean admin panel.</p>
          <Link href="/admin/events/new" className="btn-primary mt-5 inline-flex">Create an event</Link>
        </div>
      </section>
    </main>
  )
}

async function getLandingData() {
  try {
    const [events, eventCount, registrationCount, categories] = await Promise.all([
      prisma.event.findMany({ where: { date: { gte: new Date() } }, include: { category: true }, orderBy: { date: "asc" }, take: 3 }),
      prisma.event.count(),
      prisma.registration.count(),
      prisma.category.findMany({ include: { _count: { select: { events: true } } } }),
    ])

    return { events, eventCount, registrationCount, categories }
  } catch {
    // Preview should still show the product shell before Supabase/Postgres are connected.
    return {
      events: demoEvents,
      eventCount: 8,
      registrationCount: 767,
      categories: demoCategories,
    }
  }
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="border-l-4 border-[#6366F1] pl-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
