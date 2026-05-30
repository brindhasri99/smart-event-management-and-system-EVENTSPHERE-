"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import { cancelRegistration, leaveWaitlist } from "@/actions/registration"
import { formatDate } from "@/lib/utils"

type RegistrationItem = {
  id: string
  userId: string
  event: { id: string; title: string; date: Date; location: string; imageUrl: string }
}

type WaitlistItem = {
  userId: string
  eventId: string
  position: number
  status: string
  event: { title: string; date: Date; location: string }
}

export function DashboardTabs({
  userId,
  registrations,
  waitlists,
}: {
  userId: string
  registrations: RegistrationItem[]
  waitlists: WaitlistItem[]
}) {
  const [tab, setTab] = useState<"registrations" | "waitlist" | "past">("registrations")
  const [pending, startTransition] = useTransition()
  const now = new Date()
  const upcoming = registrations.filter((item) => item.event.date >= now)
  const past = registrations.filter((item) => item.event.date < now)
  const shownRegistrations = tab === "past" ? past : upcoming

  return (
    <section className="card p-4">
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ["registrations", "My Registrations"],
          ["waitlist", "Waitlist"],
          ["past", "Past Events"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === value ? "bg-[#EEF2FF] text-[#6366F1]" : "text-muted"}`}
            onClick={() => setTab(value as "registrations" | "waitlist" | "past")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "waitlist" ? (
        waitlists.length ? (
          <div className="space-y-3">
            {waitlists.map((item) => (
              <div key={item.eventId} className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
                <div>
                  <span className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.status === "promoted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {item.status === "promoted" ? "You're in!" : `#${item.position} in line`}
                  </span>
                  <h3 className="font-semibold">{item.event.title}</h3>
                  <p className="text-sm text-muted">{formatDate(item.event.date)} · {item.event.location}</p>
                </div>
                <button
                  className="btn-outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await leaveWaitlist(item.eventId, userId)
                      if (result.success) {
                        toast.success("Left waitlist")
                      } else {
                        toast.error(result.message ?? "Could not leave waitlist.")
                      }
                    })
                  }
                >
                  Leave Waitlist
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyDashboardState title="No waitlist spots" />
        )
      ) : shownRegistrations.length ? (
        <div className="space-y-3">
          {shownRegistrations.map((item) => (
            <div key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold">{item.event.title}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted"><CalendarDays className="h-4 w-4" />{formatDate(item.event.date)}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted"><MapPin className="h-4 w-4" />{item.event.location}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="btn-primary inline-flex items-center gap-2" href={`/dashboard/ticket/${item.id}`}>
                  <Ticket className="h-4 w-4" /> View Ticket
                </Link>
                {tab !== "past" ? (
                  <button
                    className="btn-outline"
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm("Cancel this registration? A waitlisted attendee may be promoted.")) return
                      startTransition(async () => {
                        const result = await cancelRegistration(item.id, userId)
                        if (result.success) {
                          toast.success("Registration cancelled")
                        } else {
                          toast.error(result.message ?? "Could not cancel registration.")
                        }
                      })
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyDashboardState title={tab === "past" ? "No past events yet" : "No registrations yet"} />
      )}
    </section>
  )
}

function EmptyDashboardState({ title }: { title: string }) {
  return (
    <div className="py-16 text-center">
      <Ticket className="mx-auto h-16 w-16 text-muted" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-muted">Find something worth showing up for.</p>
      <Link href="/events" className="btn-primary mt-5 inline-flex">
        Browse events
      </Link>
    </div>
  )
}
