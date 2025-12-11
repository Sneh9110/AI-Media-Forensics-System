import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/password-reset/confirm
 * Confirm password reset with token
 */
export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password required" }, { status: 400 })
    }

    const result = await authService.resetPassword(token, newPassword)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Password reset confirm error:", error)
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 })
  }
}
