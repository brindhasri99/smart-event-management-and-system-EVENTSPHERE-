"use client"

import { Download } from "lucide-react"

type Row = {
  id: string
  participantName: string
  email: string
  event: string
  registeredOn: string
  ticketCode: string
  status: string
}

export function ExportCsvButton({ rows, filename }: { rows: Row[]; filename?: string }) {
  function handleExport() {
    const headers = ["Participant Name", "Email", "Event", "Registered On", "Ticket Code", "Status"]
    const csvRows = [
      headers.join(","),
      ...rows.map((r) =>
        [
          `"${r.participantName}"`,
          `"${r.email}"`,
          `"${r.event}"`,
          `"${r.registeredOn}"`,
          `"${r.ticketCode}"`,
          `"${r.status}"`,
        ].join(",")
      ),
    ]
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename ?? `registrations-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  )
}
