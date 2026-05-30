"use client"

import { Download } from "lucide-react"
import { useState } from "react"
import { exportToCSV, formatDate } from "@/lib/utils"

type Registered = { id: string; ticketCode: string; registeredAt: Date; user: { name: string; email: string } }
type Waitlisted = { id: string; position: number; status: string; joinedAt: Date; user: { name: string; email: string } }
type Attended = { id: string; markedAt: Date; markedBy: string; user: { name: string; email: string } }

export function ParticipantsClient({
  registrations,
  waitlists,
  attendance,
}: {
  registrations: Registered[]
  waitlists: Waitlisted[]
  attendance: Attended[]
}) {
  const [tab, setTab] = useState<"registered" | "waitlist" | "attended">("registered")

  return (
    <section className="card p-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Tab active={tab === "registered"} onClick={() => setTab("registered")}>Registered ({registrations.length})</Tab>
          <Tab active={tab === "waitlist"} onClick={() => setTab("waitlist")}>Waitlist ({waitlists.length})</Tab>
          <Tab active={tab === "attended"} onClick={() => setTab("attended")}>Attended ({attendance.length})</Tab>
        </div>
        {tab === "registered" ? (
          <button className="btn-outline inline-flex items-center gap-2" onClick={() => exportToCSV(registrations.map((item) => ({ name: item.user.name, email: item.user.email, ticketCode: item.ticketCode, registeredAt: item.registeredAt })), "participants.csv")}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        ) : null}
      </div>
      {tab === "registered" ? <Table headers={["Name", "Email", "Date", "TicketCode", "Remove"]} rows={registrations.map((item) => [item.user.name, item.user.email, formatDate(item.registeredAt), item.ticketCode, "—"])} /> : null}
      {tab === "waitlist" ? <Table headers={["Name", "Email", "Position", "Date", "Status"]} rows={waitlists.map((item) => [item.user.name, item.user.email, String(item.position), formatDate(item.joinedAt), item.status])} /> : null}
      {tab === "attended" ? <Table headers={["Name", "Email", "CheckedIn", "MarkedBy"]} rows={attendance.map((item) => [item.user.name, item.user.email, formatDate(item.markedAt), item.markedBy])} /> : null}
    </section>
  )
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={`rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-[#EEF2FF] text-[#6366F1]" : "text-muted"}`} onClick={onClick}>{children}</button>
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((header) => <th key={header} className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className="border-b border-border last:border-0 hover:bg-[#F8FAFC] dark:hover:bg-slate-800">
              {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="px-3 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
