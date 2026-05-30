"use client"

import { QRCodeSVG } from "qrcode.react"
import { Printer } from "lucide-react"
import { formatDate } from "@/lib/utils"

type QRTicketProps = {
  registration: {
    ticketCode: string
    user: { name: string }
    event: { title: string; date: Date; location: string }
  }
}

export function QRTicket({ registration }: QRTicketProps) {
  return (
    <div className="mx-auto max-w-md">
      <div className="ticket-card overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="bg-[#6366F1] p-6 text-white">
          <p className="text-sm font-semibold">EventSphere AI</p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{registration.event.title}</h1>
          <p className="mt-2 text-sm text-white/70">{formatDate(registration.event.date)} · {registration.event.location}</p>
        </div>
        <div
          className="-mt-px h-3 bg-white"
          style={{
            clipPath:
              "polygon(0 0, 5% 50%, 10% 0, 15% 50%, 20% 0, 25% 50%, 30% 0, 35% 50%, 40% 0, 45% 50%, 50% 0, 55% 50%, 60% 0, 65% 50%, 70% 0, 75% 50%, 80% 0, 85% 50%, 90% 0, 95% 50%, 100% 0, 100% 100%, 0 100%)",
          }}
        />
        <div className="flex items-center justify-between gap-5 p-6 text-[#0F172A]">
          <div>
            <p className="text-lg font-semibold">{registration.user.name}</p>
            <p className="label mt-2">Registered</p>
            <p className="mt-2 font-mono text-sm">{registration.ticketCode}</p>
          </div>
          <QRCodeSVG value={registration.ticketCode} size={140} />
        </div>
        <p className="border-t border-[#E2E8F0] py-4 text-center text-sm text-[#64748B]">Scan QR at venue entry</p>
      </div>
      <button className="print-hidden btn-primary mt-6 inline-flex w-full items-center justify-center gap-2" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print ticket
      </button>
    </div>
  )
}
