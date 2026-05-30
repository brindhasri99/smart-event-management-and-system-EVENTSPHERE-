"use server"

import { prisma } from "@/lib/prisma"
import type { ScanResult } from "@/types"

export async function scanTicket(ticketCode: string, eventId: string, adminId: string): Promise<ScanResult> {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { ticketCode },
      include: { user: true, event: true, attendance: true },
    })

    if (!registration || registration.eventId !== eventId) {
      return {
        status: "invalid",
        message: "This ticket does not belong to this event.",
        scannedCode: ticketCode,
      }
    }

    if (registration.attendance) {
      return {
        status: "alreadyScanned",
        message: "This attendee was already checked in.",
        attendeeName: registration.user.name,
        eventName: registration.event.title,
        checkedInAt: registration.attendance.markedAt,
      }
    }

    const attendance = await tx.attendance.create({
      data: {
        userId: registration.userId,
        eventId: registration.eventId,
        registrationId: registration.id,
        markedBy: adminId,
      },
    })

    return {
      status: "success",
      message: "Checked in successfully.",
      attendeeName: registration.user.name,
      eventName: registration.event.title,
      checkedInAt: attendance.markedAt,
    }
  })
}
