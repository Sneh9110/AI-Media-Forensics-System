import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/change-password
 * Change user password
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json()

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    // In production, extract userId from JWT
    const result = await authService.changePassword("user_mock_123", currentPassword, newPassword)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
