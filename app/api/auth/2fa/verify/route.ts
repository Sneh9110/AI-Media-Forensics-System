import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/2fa/verify
 * Verify two-factor authentication token
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "2FA token required" }, { status: 400 })
    }

    // In production, extract userId from JWT
    const result = await authService.verifyTwoFactorToken("user_mock_123", token)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Verify 2FA error:", error)
    return NextResponse.json({ error: "Failed to verify 2FA" }, { status: 500 })
  }
}
