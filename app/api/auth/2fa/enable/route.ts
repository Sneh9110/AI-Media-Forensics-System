import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/2fa/enable
 * Enable two-factor authentication
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production, extract userId from JWT
    const result = await authService.enableTwoFactor("user_mock_123")

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Enable 2FA error:", error)
    return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 })
  }
}
