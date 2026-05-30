import { prisma } from "@/lib/prisma"
import { AnalyticsCharts } from "@/components/AnalyticsCharts"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [events, categories, registrations, attendance, waitlisted] = await Promise.all([
    prisma.event.findMany({ include: { category: true, registrations: true } }),
    prisma.category.findMany({ include: { events: true } }),
    prisma.registration.findMany({ where: { registeredAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.attendance.count(),
    prisma.waitlist.count({ where: { status: "waiting" } }),
  ])

  const monthRegistrations = registrations.filter((registration) => registration.registeredAt >= monthStart).length
  const totalRegistrations = events.reduce((sum, event) => sum + event.registrations.length, 0)
  const topCategory = categories
    .map((category) => ({ name: category.name, count: events.filter((event) => event.categoryId === category.id).length }))
    .sort((a, b) => b.count - a.count)[0]?.name ?? "None"

  const dayData = Array.from({ length: 30 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - index))
    const key = date.toISOString().slice(5, 10)
    return {
      date: key,
      registrations: registrations.filter((registration) => registration.registeredAt.toISOString().slice(5, 10) === key).length,
    }
  })

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="label">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Analytics</h1>
      </div>
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Stat label="This month" value={monthRegistrations} />
        <Stat label="Top category" value={topCategory} />
        <Stat label="Attendance rate" value={`${totalRegistrations ? Math.round((attendance / totalRegistrations) * 100) : 0}%`} />
        <Stat label="Waitlisted" value={waitlisted} />
      </div>
      <AnalyticsCharts
        eventData={events.map((event) => ({ name: event.title.split(" ").slice(0, 3).join(" "), registrations: event.registrations.length }))}
        categoryData={categories.map((category) => ({ name: category.name, value: events.filter((event) => event.categoryId === category.id).length }))}
        dayData={dayData}
      />
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <section className="card border-l-4 border-[#6366F1] p-5">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </section>
  )
}
