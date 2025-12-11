import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * GET /api/auth/stats
 * Get authentication statistics (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = authService.getAuthStats()

    return NextResponse.json(
      {
        success: true,
        stats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get auth stats error:", error)
    return NextResponse.json({ error: "Failed to get auth stats" }, { status: 500 })
  }
}
