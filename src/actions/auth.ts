"use server"

import { prisma } from "@/lib/prisma"
import type { OrganizerRegistrationInput, ParticipantRegistrationInput } from "@/lib/validation"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function ensureParticipantProfile(input: Pick<ParticipantRegistrationInput, "email" | "fullName" | "phone">) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: { name: input.fullName, phone: input.phone, role: "PARTICIPANT", status: "ACTIVE" },
    create: { email: input.email, name: input.fullName, phone: input.phone, role: "PARTICIPANT", status: "ACTIVE" },
  })
}

export async function ensureOrganizerProfile(input: Pick<OrganizerRegistrationInput, "email" | "organizationName" | "organizerName" | "phone">) {
  const slug = slugify(input.organizationName)

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.upsert({
      where: { slug },
      update: { name: input.organizationName },
      create: { name: input.organizationName, slug, approved: false },
    })

    return tx.user.upsert({
      where: { email: input.email },
      update: {
        name: input.organizerName,
        phone: input.phone,
        role: "ORGANIZER",
        status: "PENDING_APPROVAL",
        organizationId: organization.id,
      },
      create: {
        email: input.email,
        name: input.organizerName,
        phone: input.phone,
        role: "ORGANIZER",
        status: "PENDING_APPROVAL",
        organizationId: organization.id,
      },
    })
  })
}

export async function approveOrganizer(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
      organization: { update: { approved: true } },
      notifications: {
        create: {
          type: "ORGANIZER_APPROVAL",
          title: "Organizer account approved",
          message: "Your organizer workspace is ready. You can now publish and manage events.",
        },
      },
    },
  })

  return { success: true, data: user }
}

// Backward-compatible helper used by old RegisterForm
export async function ensureUserProfile(email: string, name: string) {
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name, role: "PARTICIPANT", status: "ACTIVE" },
  })
}
