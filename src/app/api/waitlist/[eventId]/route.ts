import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase"

type WaitlistRouteContext = {
  params: Promise<{ eventId: string }>
}

export async function GET(_request: NextRequest, context: WaitlistRouteContext) {
  const { eventId } = await context.params
  const supabase = await createSupabaseRouteHandlerClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser?.email) {
    return NextResponse.json({ status: "none", position: null, count: 0 })
  }

  const user = await prisma.user.findUnique({ where: { email: authUser.email } })
  const count = await prisma.waitlist.count({ where: { eventId, status: "waiting" } })

  if (!user) {
    return NextResponse.json({ status: "none", position: null, count })
  }

  const [registration, waitlist] = await Promise.all([
    prisma.registration.findUnique({ where: { userId_eventId: { userId: user.id, eventId } } }),
    prisma.waitlist.findUnique({ where: { userId_eventId: { userId: user.id, eventId } } }),
  ])

  if (registration) {
    return NextResponse.json({ status: "registered", position: null, count })
  }

  if (waitlist) {
    return NextResponse.json({ status: "waitlisted", position: waitlist.position, count })
  }

  return NextResponse.json({ status: "none", position: null, count })
}
