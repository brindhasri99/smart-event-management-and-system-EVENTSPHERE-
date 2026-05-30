"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { generateTicketCode } from "@/lib/utils"

export async function registerForEvent(eventId: string, userId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingRegistration = await tx.registration.findUnique({
        where: { userId_eventId: { userId, eventId } },
      })

      if (existingRegistration) {
        return { status: "registered" as const, data: existingRegistration }
      }

      const event = await tx.event.findUnique({ where: { id: eventId } })

      if (!event) {
        throw new Error("Event not found.")
      }

      if (event.registeredCount < event.totalSeats) {
        const registration = await tx.registration.create({
          data: { eventId, userId, ticketCode: generateTicketCode() },
        })

        await tx.event.update({
          where: { id: eventId },
          data: { registeredCount: { increment: 1 } },
        })

        return { status: "registered" as const, data: registration }
      }

      const existingWaitlist = await tx.waitlist.findUnique({
        where: { userId_eventId: { userId, eventId } },
      })

      if (existingWaitlist) {
        return { status: "waitlisted" as const, data: existingWaitlist }
      }

      const lastWaitlist = await tx.waitlist.findFirst({
        where: { eventId },
        orderBy: { position: "desc" },
      })

      const waitlist = await tx.waitlist.create({
        data: {
          eventId,
          userId,
          position: (lastWaitlist?.position ?? 0) + 1,
        },
      })

      return { status: "waitlisted" as const, data: waitlist }
    })

    revalidatePath(`/events/${eventId}`)
    revalidatePath("/dashboard")
    return { success: true, ...result }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Could not register." }
  }
}

export async function cancelRegistration(registrationId: string, userId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.findUnique({
        where: { id: registrationId },
        include: { event: true },
      })

      if (!registration || registration.userId !== userId) {
        throw new Error("Registration not found.")
      }

      await tx.attendance.deleteMany({ where: { registrationId } })
      await tx.registration.delete({ where: { id: registrationId } })
      await tx.event.update({
        where: { id: registration.eventId },
        data: { registeredCount: { decrement: 1 } },
      })

      const nextInLine = await tx.waitlist.findFirst({
        where: { eventId: registration.eventId, status: "waiting" },
        orderBy: { position: "asc" },
      })

      if (!nextInLine) {
        return { promoted: null, eventId: registration.eventId }
      }

      const promotedRegistration = await tx.registration.create({
        data: {
          userId: nextInLine.userId,
          eventId: registration.eventId,
          ticketCode: generateTicketCode(),
        },
      })

      await tx.waitlist.update({
        where: { id: nextInLine.id },
        data: { status: "promoted", promotedAt: new Date() },
      })
      await tx.event.update({
        where: { id: registration.eventId },
        data: { registeredCount: { increment: 1 } },
      })

      return { promoted: promotedRegistration, eventId: registration.eventId }
    })

    revalidatePath(`/events/${result.eventId}`)
    revalidatePath("/dashboard")
    return { success: true, promoted: result.promoted }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Could not cancel registration." }
  }
}

export async function joinWaitlist(eventId: string, userId: string) {
  try {
    const waitlist = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } })

      if (!event) {
        throw new Error("Event not found.")
      }

      if (event.registeredCount < event.totalSeats) {
        throw new Error("Seats are still available. Register instead.")
      }

      const existing = await tx.waitlist.findUnique({ where: { userId_eventId: { userId, eventId } } })

      if (existing) {
        return existing
      }

      const lastWaitlist = await tx.waitlist.findFirst({
        where: { eventId },
        orderBy: { position: "desc" },
      })

      return tx.waitlist.create({
        data: { eventId, userId, position: (lastWaitlist?.position ?? 0) + 1 },
      })
    })

    revalidatePath(`/events/${eventId}`)
    revalidatePath("/dashboard")
    return { success: true, data: waitlist }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Could not join waitlist." }
  }
}

export async function leaveWaitlist(eventId: string, userId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const entry = await tx.waitlist.findUnique({ where: { userId_eventId: { userId, eventId } } })

      if (!entry) {
        throw new Error("Waitlist entry not found.")
      }

      await tx.waitlist.delete({ where: { id: entry.id } })
      await tx.waitlist.updateMany({
        where: { eventId, position: { gt: entry.position }, status: "waiting" },
        data: { position: { decrement: 1 } },
      })
    })

    revalidatePath(`/events/${eventId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Could not leave waitlist." }
  }
}
