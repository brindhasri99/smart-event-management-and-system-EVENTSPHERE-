import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { DashboardTabs } from "@/components/DashboardTabs"
import {
  LayoutDashboard,
  CalendarDays,
  Tag,
  ClipboardList,
  Ticket,
  User,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role === "ORGANIZER") redirect("/organizer")

  const [registrations, waitlists, categories, organizerCount] = await Promise.all([
    prisma.registration.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { registeredAt: "desc" },
    }),
    prisma.waitlist.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
  ])

  const now = new Date()
  const upcoming = registrations.filter((r) => r.event.date >= now).length
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(now)

  return (
    <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r border-border bg-card p-5 lg:block">
        <div className="mb-8 flex items-center gap-2 font-semibold">
          EventSphere
          <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs text-[#6366F1]">Participant</span>
        </div>
        <nav className="space-y-1">
          <SideLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" active />
          <SideLink href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Upcoming Events" />
          <SideLink href="/events" icon={<Tag className="h-4 w-4" />} label="Categories" />
          <SideLink href="/dashboard#registrations" icon={<ClipboardList className="h-4 w-4" />} label="My Registrations" />
          <SideLink href="/dashboard#tickets" icon={<Ticket className="h-4 w-4" />} label="My Tickets" />
          <SideLink href="/dashboard#profile" icon={<User className="h-4 w-4" />} label="Profile" />
        </nav>
        <div className="mt-8 rounded-xl border border-border bg-[#F8FAFC] p-4 dark:bg-slate-800">
          <p className="text-xs font-medium text-muted">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      </aside>

      {/* Main Content */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="label">{today}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Hey, {user.name}</h1>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <StatCard value={registrations.length} label="Total Registrations" color="#6366F1" />
          <StatCard value={upcoming} label="Upcoming Events" color="#10B981" />
          <StatCard value={organizerCount} label="Event Organizers" color="#8B5CF6" />
          <StatCard value={categories.length} label="Categories" color="#F59E0B" />
        </div>

        {/* Upcoming Events Quick Look */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Upcoming Events</h2>
            <Link href="/events" className="text-sm font-medium text-[#6366F1]">Browse all →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {registrations
              .filter((r) => r.event.date >= now)
              .slice(0, 3)
              .map((r) => (
                <div key={r.id} className="card p-4">
                  <h3 className="font-semibold">{r.event.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(r.event.date)}
                  </p>
                  <p className="mt-2 text-sm text-muted">{r.event.location}</p>
                  <Link
                    href={`/dashboard/ticket/${r.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#6366F1]"
                  >
                    <Ticket className="h-3.5 w-3.5" /> View Ticket
                  </Link>
                </div>
              ))}
            {upcoming === 0 && (
              <div className="col-span-3 rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-muted">No upcoming events. <Link href="/events" className="text-[#6366F1] font-medium">Browse events →</Link></p>
              </div>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-8">
          <h2 className="mb-4 font-semibold tracking-tight">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/events?category=${cat.slug}`}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-[#6366F1] hover:text-[#6366F1]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Registration Tabs */}
        <div id="registrations">
          <h2 className="mb-4 font-semibold tracking-tight">Registration Statistics</h2>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-semibold text-[#6366F1]">{registrations.length}</p>
              <p className="mt-1 text-sm text-muted">Total Registered</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-semibold text-[#10B981]">{upcoming}</p>
              <p className="mt-1 text-sm text-muted">Upcoming</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-semibold text-[#F59E0B]">{waitlists.length}</p>
              <p className="mt-1 text-sm text-muted">Waitlisted</p>
            </div>
          </div>
          <DashboardTabs userId={user.id} registrations={registrations} waitlists={waitlists} />
        </div>
      </section>
    </main>
  )
}

function SideLink({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
        active ? "bg-[#EEF2FF] text-[#6366F1]" : "text-muted hover:bg-[#F8FAFC] hover:text-[#6366F1] dark:hover:bg-slate-800"
      }`}
    >
      {icon}
      {label}
    </Link>
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
