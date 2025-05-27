import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("Middleware - Path:", req.nextUrl.pathname)
  console.log("Middleware - Session exists:", !!session)

  // If no session and trying to access protected routes
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    console.log("Middleware - No session, redirecting to login")
    const redirectUrl = new URL("/auth/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access auth routes
  if (session && (req.nextUrl.pathname.startsWith("/auth") || req.nextUrl.pathname === "/")) {
    console.log("Middleware - Session exists, redirecting to dashboard")
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/"],
}
