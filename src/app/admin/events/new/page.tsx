import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { EventForm } from "@/components/EventForm"

export const dynamic = "force-dynamic"

export default async function NewEventPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="label">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create Event</h1>
      </div>
      <EventForm categories={categories} userId={user.id} />
    </main>
  )
}
