import { redirect } from "next/navigation"
import Link from "next/link"
import { getOrganizerUser } from "@/lib/auth"
import { LayoutDashboard, Plus, CalendarDays, ClipboardList, BarChart3 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const user = await getOrganizerUser()
  if (!user) redirect("/login")

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-border bg-card p-5 lg:block">
        <div className="mb-8 flex items-center gap-2 font-semibold">
          EventSphere
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-600">Organizer</span>
        </div>
        <nav className="space-y-1">
          <SideLink href="/organizer" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <SideLink href="/organizer/events/new" icon={<Plus className="h-4 w-4" />} label="Create Event" />
          <SideLink href="/organizer/events" icon={<CalendarDays className="h-4 w-4" />} label="Manage Events" />
          <SideLink href="/organizer/registrations" icon={<ClipboardList className="h-4 w-4" />} label="Registrations" />
          <SideLink href="/organizer/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" />
        </nav>
        <div className="mt-8 rounded-xl border border-border bg-[#F8FAFC] p-4 dark:bg-slate-800">
          <p className="text-xs font-medium text-muted">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      </aside>
      <section className="px-4 py-8 sm:px-6 lg:px-8">{children}</section>
    </div>
  )
}

function SideLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-[#F8FAFC] hover:text-[#6366F1] dark:hover:bg-slate-800">
      {icon}{label}
    </Link>
  )
}
