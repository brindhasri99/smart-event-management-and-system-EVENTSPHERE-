"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Moon, Sun, UserCircle, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { cn } from "@/lib/utils"

type NavUser = { email: string; name?: string; role?: string }

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [user, setUser] = useState<NavUser | null>(null)
  const [open, setOpen] = useState(false)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user?.email) { setUser(null); return }
      setUser({ email: data.user.email, name: data.user.user_metadata?.name, role: data.user.user_metadata?.role })
    })
  }, [supabase])

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const isOrganizer = user?.role === "organizer" || user?.role === "admin"
  const dashboardHref = isOrganizer ? "/organizer" : "/dashboard"

  const links = [
    { href: "/events", label: "Events" },
    ...(user ? [{ href: dashboardHref, label: "Dashboard" }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md dark:bg-[#0F172A]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-lg">EventSphere</span>
          
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-[#EEF2FF] hover:text-[#6366F1]",
                pathname.startsWith(link.href) && link.href !== "/" && "bg-[#EEF2FF] text-[#6366F1]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            aria-label="Toggle theme"
            className="rounded-lg border border-border p-2 transition-colors hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardHref} className="flex items-center gap-2 text-sm font-medium">
                <UserCircle className="h-5 w-5 text-muted" />
                <span>{user.name ?? user.email}</span>
              </Link>
              <button className="btn-outline px-3 py-2 text-sm" onClick={signOut}>Logout</button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-outline px-3 py-2 text-sm">Login</Link>
              <Link href="/register" className="btn-primary px-3 py-2 text-sm">Register</Link>
            </>
          )}
        </div>

        <button className="rounded-lg border border-border p-2 md:hidden" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 md:hidden" onClick={() => setOpen(false)}>
          <aside className="ml-auto h-full w-72 border-l border-border bg-card p-4 shadow-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">EventSphere</span>
              <button className="rounded-lg border border-border p-2" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 font-medium" onClick={() => setOpen(false)}>{link.label}</Link>
              ))}
              <button className="btn-outline mt-2" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>Toggle theme</button>
              {user ? (
                <button className="btn-primary mt-2" onClick={signOut}>Logout</button>
              ) : (
                <>
                  <Link href="/login" className="btn-outline mt-2 text-center" onClick={() => setOpen(false)}>Login</Link>
                  <Link href="/register" className="btn-primary text-center" onClick={() => setOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
