import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/login
 * Login user and get auth tokens
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe } = await req.json()

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")
    const userAgent = req.headers.get("user-agent")

    const result = await authService.login(
      { email, password, rememberMe },
      ipAddress || undefined,
      userAgent || undefined
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 })
    }

    const response = NextResponse.json(result, { status: 200 })

    // Set secure cookies for tokens
    response.cookies.set("sessionId", `session_${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
