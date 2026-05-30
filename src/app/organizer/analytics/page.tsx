import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getOrganizerUser } from "@/lib/auth"
import { AnalyticsCharts } from "@/components/AnalyticsCharts"

export const dynamic = "force-dynamic"

export default async function OrganizerAnalyticsPage() {
  const user = await getOrganizerUser()
  if (!user) redirect("/login")

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const eventFilter = { createdBy: user.id }

  const [events, categories, registrations, attendance, waitlisted] = await Promise.all([
    prisma.event.findMany({ where: eventFilter, include: { category: true, registrations: true } }),
    prisma.category.findMany({ include: { events: { where: eventFilter } } }),
    prisma.registration.findMany({
      where: {
        event: { createdBy: user.id },
        registeredAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.attendance.count({ where: { event: { createdBy: user.id } } }),
    prisma.waitlist.count({ where: { status: "waiting", event: { createdBy: user.id } } }),
  ])

  const monthRegistrations = registrations.filter((r) => r.registeredAt >= monthStart).length
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrations.length, 0)
  const topCategory =
    categories
      .map((cat) => ({ name: cat.name, count: events.filter((e) => e.categoryId === cat.id).length }))
      .sort((a, b) => b.count - a.count)[0]?.name ?? "None"

  const dayData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const key = date.toISOString().slice(5, 10)
    return {
      date: key,
      registrations: registrations.filter((r) => r.registeredAt.toISOString().slice(5, 10) === key).length,
    }
  })

  return (
    <div>
      <div className="mb-8">
        <p className="label">Organizer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Analytics</h1>
      </div>
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Stat label="This month" value={monthRegistrations} />
        <Stat label="Top category" value={topCategory} />
        <Stat
          label="Attendance rate"
          value={`${totalRegistrations ? Math.round((attendance / totalRegistrations) * 100) : 0}%`}
        />
        <Stat label="Waitlisted" value={waitlisted} />
      </div>
      <AnalyticsCharts
        eventData={events.map((e) => ({ name: e.title.split(" ").slice(0, 3).join(" "), registrations: e.registrations.length }))}
        categoryData={categories.map((cat) => ({ name: cat.name, value: events.filter((e) => e.categoryId === cat.id).length }))}
        dayData={dayData}
      />
    </div>
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
