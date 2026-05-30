import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getOrganizerUser } from "@/lib/auth"
import { EventForm } from "@/components/EventForm"

export const dynamic = "force-dynamic"

export default async function OrganizerNewEventPage() {
  const user = await getOrganizerUser()
  if (!user) redirect("/login")

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <div className="mb-8">
        <p className="label">Organizer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create Event</h1>
        <p className="mt-2 text-sm text-muted">Fill in the details below to publish a new event.</p>
      </div>
      <EventForm categories={categories} userId={user.id} />
    </div>
  )
}
