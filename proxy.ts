import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip tracking for:
  // - API routes
  // - Static files
  // - Admin pages
  // - Auth pages
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // Track page view asynchronously (fire and forget)
  const ip = request.ip || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
  const userAgent = request.headers.get("user-agent")
  const referer = request.headers.get("referer")

  // Send tracking data to API route (non-blocking)
  const trackingUrl = new URL("/api/analytics/track", request.url)
  fetch(trackingUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: pathname,
      ip,
      userAgent,
      referer,
    }),
  }).catch(() => {
    // Silently fail - don't block page load
  })

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
