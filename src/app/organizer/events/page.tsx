import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getOrganizerUser } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { Plus, Pencil, ScanLine } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OrganizerManageEventsPage() {
  const user = await getOrganizerUser()
  if (!user) redirect("/login")

  const events = await prisma.event.findMany({
    where: { createdBy: user.id },
    include: { category: true },
    orderBy: { date: "desc" },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="label">Organizer</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage Events</h1>
        </div>
        <Link href="/organizer/events/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Event
        </Link>
      </div>

      {events.length ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Event", "Category", "Date", "Seats", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
                  >
                    <td className="px-4 py-4 font-medium">{event.title}</td>
                    <td className="px-4 py-4 text-muted">{event.category.name}</td>
                    <td className="px-4 py-4 text-muted">{formatDate(event.date)}</td>
                    <td className="px-4 py-4">
                      <span className={`font-medium ${event.registeredCount >= event.totalSeats ? "text-red-600" : "text-emerald-600"}`}>
                        {event.registeredCount}/{event.totalSeats}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          event.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700"
                            : event.status === "DRAFT"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#6366F1]"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/scanner`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-muted"
                        >
                          <ScanLine className="h-3.5 w-3.5" /> Scan
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card py-16 text-center">
          <p className="text-muted">You have not created any events yet.</p>
          <Link href="/organizer/events/new" className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create your first event
          </Link>
        </div>
      )}
    </div>
  )
}
