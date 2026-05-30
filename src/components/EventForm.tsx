"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import { createEvent, updateEvent } from "@/actions/events"

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80"

type CategoryOption = { id: string; name: string }
type EditableEvent = {
  id: string
  title: string
  description: string
  categoryId: string
  date: Date
  location: string
  imageUrl: string
  totalSeats: number
}

export function EventForm({
  categories,
  userId,
  event,
}: {
  categories: CategoryOption[]
  userId: string
  event?: EditableEvent
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const initialDate = event?.date ? new Date(event.date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

  const [form, setForm] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    categoryId: event?.categoryId ?? categories[0]?.id ?? "",
    date: initialDate.toISOString().slice(0, 10),
    time: initialDate.toTimeString().slice(0, 5),
    location: event?.location ?? "",
    imageUrl: event?.imageUrl ?? "",
    totalSeats: String(event?.totalSeats ?? 100),
  })

  const [imgError, setImgError] = useState(false)

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    if (field === "imageUrl") setImgError(false)
  }

  function onSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    const date = new Date(`${form.date}T${form.time}:00`)
    const payload = {
      title: form.title,
      description: form.description,
      categoryId: form.categoryId,
      date,
      location: form.location,
      imageUrl: form.imageUrl || FALLBACK_IMAGE,
      totalSeats: Number(form.totalSeats),
    }

    startTransition(async () => {
      const result = event
        ? await updateEvent(event.id, payload)
        : await createEvent({ ...payload, createdBy: userId })

      if (result.success) {
        toast.success(event ? "Event updated" : "Event created")
        router.push("/organizer/events")
        router.refresh()
      } else {
        toast.error("message" in result ? result.message : "Could not save event.")
      }
    })
  }

  const previewImgSrc = imgError || !form.imageUrl ? FALLBACK_IMAGE : form.imageUrl

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form className="card space-y-5 p-6" onSubmit={onSubmit}>
        <TextInput
          label="Event Name"
          value={form.title}
          onChange={(v) => setField("title", v)}
          placeholder="e.g. AI Summit Mumbai 2025"
        />

        <div>
          <label className="label">Description</label>
          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#6366F1]"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Describe your event…"
            required
          />
        </div>

        <div>
          <label className="label">Category</label>
          <select
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#6366F1]"
            value={form.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
          >
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Date" type="date" value={form.date} onChange={(v) => setField("date", v)} />
          <TextInput label="Time" type="time" value={form.time} onChange={(v) => setField("time", v)} />
        </div>

        <TextInput
          label="Venue"
          value={form.location}
          onChange={(v) => setField("location", v)}
          placeholder="e.g. Bandra Kurla Complex, Mumbai"
        />

        <div>
          <label className="label">Image URL</label>
          <input
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#6366F1]"
            type="url"
            value={form.imageUrl}
            onChange={(e) => setField("imageUrl", e.target.value)}
            placeholder="https://example.com/image.jpg  (leave blank for default)"
          />
          <p className="mt-1 text-xs text-muted">
            Paste any image URL. Leave blank to use a default image.
            Try: <span className="font-mono text-[#6366F1] select-all">https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80</span>
          </p>
        </div>

        <TextInput
          label="Total Seats"
          type="number"
          value={form.totalSeats}
          onChange={(v) => setField("totalSeats", v)}
          placeholder="100"
        />

        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "Saving…" : event ? "Update Event" : "Create Event"}
        </button>
      </form>

      {/* Live Preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start space-y-3">
        <p className="label">Live Preview</p>
        <div className="card overflow-hidden">
          <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
            <Image
              src={previewImgSrc}
              alt="preview"
              fill
              className="object-cover"
              sizes="380px"
              onError={() => setImgError(true)}
            />
            <span className="absolute left-3 top-3 rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#6366F1]">
              {categories.find((c) => c.id === form.categoryId)?.name ?? "Category"}
            </span>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2">{form.title || "Event Title"}</h3>
            <p className="text-sm text-muted">{form.date} at {form.time}</p>
            <p className="text-sm text-muted">{form.location || "Venue"}</p>
            <p className="text-sm font-medium">{form.totalSeats} seats</p>
          </div>
        </div>
        {imgError && form.imageUrl && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            ⚠ Could not load that image URL. Check the link or leave it blank.
          </p>
        )}
      </aside>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="mt-2 w-full rounded-lg border border-border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#6366F1]"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={type !== "url"}
      />
    </div>
  )
}
