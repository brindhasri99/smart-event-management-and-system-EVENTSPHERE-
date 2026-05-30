"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ensureParticipantProfile, ensureOrganizerProfile } from "@/actions/auth"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { Users, Building2 } from "lucide-react"

type AccountType = "participant" | "organizer"

const inputClass =
  "mt-2 w-full rounded-lg border border-border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#6366F1]"

export function RegisterForm() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [accountType, setAccountType] = useState<AccountType>("participant")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Participant fields
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Organizer fields
  const [organizationName, setOrganizationName] = useState("")
  const [organizerName, setOrganizerName] = useState("")
  const [orgEmail, setOrgEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [orgPassword, setOrgPassword] = useState("")
  const [orgConfirmPassword, setOrgConfirmPassword] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    if (!supabase) {
      setError("Supabase is not configured yet. Add your values to .env.local, then restart the dev server.")
      setLoading(false)
      return
    }

    if (accountType === "participant") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        setLoading(false)
        return
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: fullName, role: "participant" } },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      await ensureParticipantProfile({ email, fullName, phone: "" })
      router.push("/dashboard")
      router.refresh()
    } else {
      if (orgPassword !== orgConfirmPassword) {
        setError("Passwords do not match.")
        setLoading(false)
        return
      }

      const { error: authError } = await supabase.auth.signUp({
        email: orgEmail,
        password: orgPassword,
        options: { data: { name: organizerName, role: "organizer" } },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      await ensureOrganizerProfile({ email: orgEmail, organizationName, organizerName, phone })
      router.push("/organizer")
      router.refresh()
    }
  }

  return (
    <div>
      {/* Account Type Selector */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAccountType("participant")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            accountType === "participant"
              ? "border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]"
              : "border-border bg-card text-muted hover:border-[#6366F1]/40"
          }`}
        >
          <Users className="h-6 w-6" />
          <span className="text-sm font-medium">Participant</span>
        </button>
        <button
          type="button"
          onClick={() => setAccountType("organizer")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
            accountType === "organizer"
              ? "border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]"
              : "border-border bg-card text-muted hover:border-[#6366F1]/40"
          }`}
        >
          <Building2 className="h-6 w-6" />
          <span className="text-sm font-medium">Organizer</span>
        </button>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {accountType === "participant" ? (
          <>
            <div>
              <label className="label">Full Name</label>
              <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" minLength={8} required />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="label">Organization Name</label>
              <input className={inputClass} value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Organizer Name</label>
              <input className={inputClass} value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className={inputClass} value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className={inputClass} value={orgPassword} onChange={(e) => setOrgPassword(e.target.value)} type="password" minLength={8} required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className={inputClass} value={orgConfirmPassword} onChange={(e) => setOrgConfirmPassword(e.target.value)} type="password" minLength={8} required />
            </div>
          </>
        )}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : `Create ${accountType === "participant" ? "Participant" : "Organizer"} Account`}
        </button>
      </form>
    </div>
  )
}
