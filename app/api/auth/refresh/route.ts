import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 })
    }

    const result = await authService.refreshAccessToken(refreshToken)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 })
  }
}
