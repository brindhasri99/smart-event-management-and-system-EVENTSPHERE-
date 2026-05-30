import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getOrganizerUser } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { ExportCsvButton } from "@/components/ExportCsvButton"

export const dynamic = "force-dynamic"

export default async function OrganizerRegistrationsPage() {
  const user = await getOrganizerUser()
  if (!user) redirect("/login")

  const registrations = await prisma.registration.findMany({
    where: { event: { createdBy: user.id } },
    include: { user: true, event: true },
    orderBy: { registeredAt: "desc" },
  })

  const csvRows = registrations.map((r) => ({
    id: r.id,
    participantName: r.user.name,
    email: r.user.email,
    event: r.event.title,
    registeredOn: formatDate(r.registeredAt),
    ticketCode: r.ticketCode,
    status: "Confirmed",
  }))

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="label">Organizer</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Registrations</h1>
          <p className="mt-2 text-sm text-muted">
            {registrations.length} total registration{registrations.length !== 1 ? "s" : ""} across your events.
          </p>
        </div>
        {registrations.length > 0 && (
          <div className="mt-6 shrink-0">
            <ExportCsvButton
              rows={csvRows}
              filename={`registrations-${new Date().toISOString().slice(0, 10)}.csv`}
            />
          </div>
        )}
      </div>

      {registrations.length ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Participant", "Email", "Event", "Ticket Code", "Registered On", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrations.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-slate-800">
                    <td className="px-4 py-3 font-medium">{item.user.name}</td>
                    <td className="px-4 py-3 text-muted">{item.user.email}</td>
                    <td className="px-4 py-3 max-w-[180px] truncate">{item.event.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{item.ticketCode}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(item.registeredAt)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card py-16 text-center">
          <p className="text-muted">No registrations yet for your events.</p>
        </div>
      )}
    </div>
  )
}
