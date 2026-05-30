import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin } from "lucide-react"
import { formatDate, formatSeatsLeft } from "@/lib/utils"

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80"

type EventCardProps = {
  event: {
    id: string
    title: string
    date: Date
    location: string
    imageUrl: string
    totalSeats: number
    registeredCount: number
    category: { name: string }
  }
}

export function EventCard({ event }: EventCardProps) {
  const filledPct = Math.min(Math.round((event.registeredCount / event.totalSeats) * 100), 100)
  const soldOut = event.registeredCount >= event.totalSeats
  const progressColor = filledPct >= 90 ? "bg-[#EF4444]" : filledPct >= 70 ? "bg-[#F59E0B]" : "bg-[#10B981]"
  const imgSrc = event.imageUrl && event.imageUrl.trim() !== "" ? event.imageUrl : FALLBACK_IMAGE

  return (
    <article className="card overflow-hidden">
      <div className="relative aspect-video">
        <Image
  src={imgSrc}
  alt={event.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 33vw"
/>
        <span className="absolute left-3 top-3 rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#6366F1]">
          {event.category.name}
        </span>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            FULL
          </span>
        )}
      </div>
      <div className="space-y-4 p-4">
        <h3 className="line-clamp-2 min-h-12 text-lg font-semibold tracking-tight">{event.title}</h3>
        <div className="space-y-2 text-sm text-muted">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#6366F1]" />
            {formatDate(event.date)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#6366F1]" />
            {event.location}
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="text-muted">{formatSeatsLeft(event.registeredCount, event.totalSeats)}</span>
            <span>{filledPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
            <div className={`h-2 rounded-full ${progressColor}`} style={{ width: `${filledPct}%` }} />
          </div>
        </div>
        <Link href={`/events/${event.id}`} className="inline-flex font-medium text-[#6366F1] hover:text-[#4F46E5]">
          Register &rarr;
        </Link>
      </div>
    </article>
  )
}
