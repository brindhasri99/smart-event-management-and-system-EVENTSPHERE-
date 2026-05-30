import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getOrganizerUser } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OrganizerDashboardPage() {
  const user = await getOrganizerUser()
  if (!user) redirect("/login")

  const [events, totalRegistrations, recentRegistrations] = await Promise.all([
    prisma.event.findMany({
      where: { createdBy: user.id },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
    prisma.registration.count({ where: { event: { createdBy: user.id } } }),
    prisma.registration.findMany({
      where: { event: { createdBy: user.id } },
      include: { user: true, event: true },
      orderBy: { registeredAt: "desc" },
      take: 10,
    }),
  ])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="label">Organizer Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome, {user.name}</h1>
        </div>
        <Link href="/organizer/events/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Event
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard value={events.length} label="Total Events" color="#6366F1" />
        <StatCard value={totalRegistrations} label="Total Registrations" color="#10B981" />
        <StatCard value={events.filter((e) => e.date >= new Date()).length} label="Upcoming Events" color="#8B5CF6" />
        <StatCard value={events.reduce((s, e) => s + e.registeredCount, 0)} label="Seats Filled" color="#F59E0B" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5">
          <h2 className="mb-4 font-semibold tracking-tight">Recent Registrations</h2>
          {recentRegistrations.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Name", "Event", "Date", "Status"].map((h) => (
                      <th key={h} className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-slate-800">
                      <td className="px-3 py-3">{item.user.name}</td>
                      <td className="px-3 py-3 max-w-[150px] truncate">{item.event.title}</td>
                      <td className="px-3 py-3">{formatDate(item.registeredAt)}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Registered</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-muted">No registrations yet for your events.</p>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Your Events</h2>
            <Link href="/organizer/events" className="text-sm font-medium text-[#6366F1]">Manage all →</Link>
          </div>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted">{formatDate(event.date)}</p>
                    <p className="mt-1 text-sm font-medium">{event.registeredCount}/{event.totalSeats} seats</p>
                  </div>
                  <Link href={`/admin/events/${event.id}/scanner`} className="shrink-0 text-sm font-medium text-[#6366F1]">Scan →</Link>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-muted">No events yet.</p>
                <Link href="/organizer/events/new" className="btn-primary mt-4 inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Create your first event
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <section className="card border-l-4 p-5" style={{ borderLeftColor: color }}>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </section>
  )
}
