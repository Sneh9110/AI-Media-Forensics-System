import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Verification token required" }, { status: 400 })
    }

    const result = await authService.verifyEmail(token)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Email verification failed" }, { status: 500 })
  }
}
