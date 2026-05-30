"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import toast from "react-hot-toast"
import { cancelRegistration, joinWaitlist, leaveWaitlist, registerForEvent } from "@/actions/registration"

type EventActionButtonProps = {
  eventId: string
  userId?: string
  registrationId?: string
  waitlisted: boolean
  soldOut: boolean
}

export function EventActionButton({ eventId, userId, registrationId, waitlisted, soldOut }: EventActionButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (!userId) {
    return (
      <button className="btn-primary w-full" onClick={() => router.push("/login")}>
        Login to register
      </button>
    )
  }

  if (registrationId) {
    return (
      <button
        className="btn-outline w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await cancelRegistration(registrationId, userId)
            if (result.success) {
              toast.success("Registration cancelled")
            } else {
              toast.error(result.message ?? "Could not cancel registration.")
            }
            router.refresh()
          })
        }
      >
        Cancel registration
      </button>
    )
  }

  if (waitlisted) {
    return (
      <button
        className="btn-outline w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await leaveWaitlist(eventId, userId)
            if (result.success) {
              toast.success("Left waitlist")
            } else {
              toast.error(result.message ?? "Could not leave waitlist.")
            }
            router.refresh()
          })
        }
      >
        Leave waitlist
      </button>
    )
  }

  return (
    <button
      className="btn-primary w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = soldOut ? await joinWaitlist(eventId, userId) : await registerForEvent(eventId, userId)
          if (result.success) {
            toast.success(soldOut ? "You joined the waitlist" : "You are registered")
          } else {
            toast.error(result.message ?? "Could not update registration.")
          }
          router.refresh()
        })
      }
    >
      {soldOut ? "Join waitlist" : "Register now"}
    </button>
  )
}
