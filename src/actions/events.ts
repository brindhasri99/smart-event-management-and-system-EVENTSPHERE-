"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { generateTicketCode } from "@/lib/utils"

type EventInput = {
  title: string
  description: string
  categoryId: string
  date: Date
  location: string
  imageUrl: string
  totalSeats: number
  createdBy: string
}

async function autoPromoteFromWaitlist(eventId: string, availableSeats: number) {
  if (availableSeats <= 0) {
    return
  }

  await prisma.$transaction(async (tx) => {
    const entries = await tx.waitlist.findMany({
      where: { eventId, status: "waiting" },
      orderBy: { position: "asc" },
      take: availableSeats,
    })

    for (const entry of entries) {
      await tx.registration.create({
        data: {
          userId: entry.userId,
          eventId,
          ticketCode: generateTicketCode(),
        },
      })
      await tx.waitlist.update({
        where: { id: entry.id },
        data: { status: "promoted", promotedAt: new Date() },
      })
      await tx.event.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      })
    }
  })
}

export async function createEvent(input: EventInput) {
  const event = await prisma.event.create({ data: input })
  revalidatePath("/admin")
  revalidatePath("/events")
  return { success: true, data: event }
}

export async function updateEvent(eventId: string, input: Omit<EventInput, "createdBy">) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } })

  if (!existing) {
    return { success: false, message: "Event not found." }
  }

  const updated = await prisma.event.update({ where: { id: eventId }, data: input })
  const newSeats = updated.totalSeats - updated.registeredCount
  const seatsAdded = updated.totalSeats - existing.totalSeats

  if (seatsAdded > 0 && newSeats > 0) {
    await autoPromoteFromWaitlist(eventId, newSeats)
  }

  revalidatePath("/admin")
  revalidatePath(`/events/${eventId}`)
  return { success: true, data: updated }
}

export async function deleteEvent(eventId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.attendance.deleteMany({ where: { eventId } })
    await tx.registration.deleteMany({ where: { eventId } })
    await tx.waitlist.deleteMany({ where: { eventId } })
    await tx.event.delete({ where: { id: eventId } })
  })

  revalidatePath("/admin")
  revalidatePath("/events")
  return { success: true }
}
