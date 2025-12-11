import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/logout
 * Logout user and revoke session
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, refreshToken } = await req.json()

    const result = await authService.logout(sessionId, refreshToken)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    const response = NextResponse.json(result, { status: 200 })

    // Clear cookies
    response.cookies.delete("sessionId")
    response.cookies.delete("accessToken")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
