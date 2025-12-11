import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/password-reset/request
 * Request password reset link
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const result = await authService.requestPasswordReset(email)

    // Always return same message for security
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ error: "Password reset request failed" }, { status: 500 })
  }
}
