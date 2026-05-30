"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { Users, Building2 } from "lucide-react"

type Role = "participant" | "organizer"

export function LoginForm() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [role, setRole] = useState<Role>("participant")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!supabase) {
      setError("Supabase is not configured. Check .env.local and restart.")
      setLoading(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError("Invalid email or password.")
      setLoading(false)
      return
    }

    // Route based on Supabase metadata role — handles "organizer", "admin", "participant", "user", or missing
    const metaRole = data.user.user_metadata?.role ?? "participant"
    const isOrganizer = metaRole === "organizer" || metaRole === "admin"

    if (role === "organizer" && !isOrganizer) {
      await supabase.auth.signOut()
      setError("This account is not registered as an Organizer.")
      setLoading(false)
      return
    }

    router.push(isOrganizer ? "/organizer" : "/dashboard")
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {(["participant", "organizer"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              role === r
                ? "border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]"
                : "border-border bg-card text-muted hover:border-[#6366F1]/40"
            }`}
          >
            {r === "participant" ? <Users className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
            <span className="text-sm font-medium capitalize">{r}</span>
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label">Email</label>
          <input
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#6366F1]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#6366F1]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : `Sign in as ${role === "participant" ? "Participant" : "Organizer"}`}
        </button>
      </form>

      <div className="mt-4 rounded-lg bg-[#F8FAFC] p-3 text-xs text-muted dark:bg-slate-800">
        <p className="font-medium">Demo accounts</p>
        <p className="mt-1">Participant: participant@test.com / Password123!</p>
        <p>Organizer: organizer@test.com / Password123!</p>
      </div>
    </div>
  )
}
