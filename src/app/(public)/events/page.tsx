import { Search } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { EventCard } from "@/components/EventCard"
import { demoCategories, demoEvents } from "@/lib/demo-data"

export const dynamic = "force-dynamic"

type EventsPageProps = {
  searchParams: Promise<{ search?: string; category?: string; filter?: string }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams
  const { categories, events } = await getEventsData(params)

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="label">Events</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Find your next room</h1>
        </div>
        <form className="flex min-w-0 flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input name="search" defaultValue={params.search} placeholder="Search events" className="w-64 rounded-lg border border-border py-2 pl-9 pr-3 focus:border-transparent focus:ring-2 focus:ring-[#6366F1]" />
          </div>
          <select name="category" defaultValue={params.category ?? ""} className="rounded-lg border border-border px-3 py-2">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
          <select name="filter" defaultValue={params.filter ?? "upcoming"} className="rounded-lg border border-border px-3 py-2">
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <button className="btn-primary">Apply</button>
        </form>
      </div>

      {events.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      ) : (
        <div className="card py-16 text-center">
          <CalendarIcon />
          <h2 className="mt-4 text-lg font-semibold">No events found</h2>
          <p className="mt-1 text-muted">Try a different search or category.</p>
        </div>
      )}
    </main>
  )
}

async function getEventsData(params: { search?: string; category?: string; filter?: string }) {
  try {
    const [categories, events] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.event.findMany({
        where: {
          date: params.filter === "past" ? { lt: new Date() } : { gte: new Date() },
          title: params.search ? { contains: params.search, mode: "insensitive" } : undefined,
          category: params.category ? { slug: params.category } : undefined,
        },
        include: { category: true },
        orderBy: { date: "asc" },
      }),
    ])

    return { categories, events }
  } catch {
    const filteredEvents = demoEvents.filter((event) => {
      const matchesSearch = params.search ? event.title.toLowerCase().includes(params.search.toLowerCase()) : true
      const matchesCategory = params.category ? event.category.slug === params.category : true
      return matchesSearch && matchesCategory
    })

    return {
      categories: demoCategories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })),
      events: filteredEvents,
    }
  }
}

function CalendarIcon() {
  return <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF] text-2xl text-[#6366F1]">◎</div>
}
