import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value)
          response = NextResponse.next({ request })
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, "")
          response = NextResponse.next({ request })
          response.cookies.set(name, "", options)
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Not logged in — send to login
  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/organizer"))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Organizer route — only organizer/admin metadata roles allowed
  if (pathname.startsWith("/organizer") && user) {
    const metaRole = user.user_metadata?.role ?? ""
    if (metaRole !== "organizer" && metaRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/organizer/:path*"],
}
