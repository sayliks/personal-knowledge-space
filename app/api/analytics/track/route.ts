import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, ip, userAgent, referer } = body

    // Store page view
    await prisma.pageView.create({
      data: {
        path,
        ip: ip || null,
        userAgent: userAgent || null,
        referer: referer || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    // Return success even on error to not block page loads
    return NextResponse.json({ success: true })
  }
}
