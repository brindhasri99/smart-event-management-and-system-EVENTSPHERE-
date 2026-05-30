import Link from "next/link"
import { BarChart3, CalendarDays, LayoutDashboard, Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [events, registrations, waitlisted, checkins, recent] = await Promise.all([
    prisma.event.findMany({ include: { category: true }, orderBy: { date: "asc" }, take: 8 }),
    prisma.registration.count(),
    prisma.waitlist.count({ where: { status: "waiting" } }),
    prisma.attendance.count({ where: { markedAt: { gte: todayStart } } }),
    prisma.registration.findMany({ include: { user: true, event: true }, orderBy: { registeredAt: "desc" }, take: 10 }),
  ])

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <Link href="/admin/events/new" className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" />Create Event</Link>
      </div>
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Stat label="Total Events" value={events.length} color="#6366F1" />
        <Stat label="Registrations" value={registrations} color="#10B981" />
        <Stat label="Waitlisted" value={waitlisted} color="#F59E0B" />
        <Stat label="Today's Check-ins" value={checkins} color="#8B5CF6" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5">
          <h2 className="mb-4 font-semibold tracking-tight">Recent Registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-border">{["Name", "Event", "Date", "Status"].map((header) => <th key={header} className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted">{header}</th>)}</tr></thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-slate-800">
                    <td className="px-3 py-3">{item.user.name}</td>
                    <td className="px-3 py-3">{item.event.title}</td>
                    <td className="px-3 py-3">{formatDate(item.registeredAt)}</td>
                    <td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Registered</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card p-5">
          <h2 className="mb-4 font-semibold tracking-tight">Upcoming Events</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted">{formatDate(event.date)}</p>
                    <p className="mt-2 text-sm font-medium">{event.registeredCount}/{event.totalSeats}</p>
                  </div>
                  <Link href={`/admin/events/${event.id}/scanner`} className="text-sm font-medium text-[#6366F1]">Scan &rarr;</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-border bg-card p-5 lg:block">
        <div className="mb-8 flex items-center gap-2 font-semibold">EventSphere <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs text-[#6366F1]">Admin</span></div>
        <nav className="space-y-1">
          <Link className="flex items-center gap-2 rounded-lg bg-[#EEF2FF] px-3 py-2 text-sm font-medium text-[#6366F1]" href="/admin"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
          <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted" href="/admin/events/new"><CalendarDays className="h-4 w-4" />Events</Link>
          <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted" href="/admin/analytics"><BarChart3 className="h-4 w-4" />Analytics</Link>
        </nav>
      </aside>
      <section className="px-4 py-8 sm:px-6 lg:px-8">{children}</section>
    </main>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return <section className="card border-l-4 p-5" style={{ borderLeftColor: color }}><p className="text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></section>
}
