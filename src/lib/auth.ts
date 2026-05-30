import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase"

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return null

  // Try Prisma lookup; if not found, return a minimal object from Supabase metadata
  // so pages never break just because the DB row is missing
  const dbUser = await prisma.user.findUnique({ where: { email: user.email } })

  if (dbUser) return dbUser

  // Fallback: synthesize from Supabase metadata (new registrations before Prisma upsert runs)
  const metaRole = user.user_metadata?.role ?? "participant"
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.email,
    phone: null,
    role: metaRole === "organizer" || metaRole === "admin" ? "ORGANIZER" : "PARTICIPANT",
    status: "ACTIVE",
    organizationId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error("You need to be signed in to do that.")
  return user
}

// Helper used by organizer pages — checks Supabase metadata, not Prisma role
// so it works even when Prisma row has wrong role value
export async function getOrganizerUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return null

  const metaRole = user.user_metadata?.role ?? ""
  if (metaRole !== "organizer" && metaRole !== "admin") return null

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (dbUser) return dbUser

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.email,
    phone: null,
    role: "ORGANIZER" as const,
    status: "ACTIVE" as const,
    organizationId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
