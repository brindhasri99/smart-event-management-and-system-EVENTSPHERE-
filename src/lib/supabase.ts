import { cookies } from "next/headers"
import { createBrowserClient, createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return { url, anonKey }
}

export function createSupabaseBrowserClient() {
  const { url, anonKey } = supabaseConfig()

  return createBrowserClient(url, anonKey)
}

export async function createSupabaseServerClient() {
  const { url, anonKey } = supabaseConfig()
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set() {
        // Server Components can read cookies but cannot commit them. Middleware
        // and route handlers handle refresh writes, so swallowing here is safer.
      },
      remove() {},
    },
  })
}

export async function createSupabaseRouteHandlerClient() {
  const { url, anonKey } = supabaseConfig()
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set(name, "", options)
      },
    },
  })
}
