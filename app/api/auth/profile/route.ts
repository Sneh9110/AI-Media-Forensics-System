import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * GET /api/auth/profile
 * Get current user profile
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In production, validate JWT token here
    // For now, return mock profile
    const mockUser = {
      id: "user_mock_123",
      email: "user@example.com",
      name: "John Doe",
      role: "user",
      avatar: undefined,
      createdAt: new Date(),
      lastLogin: new Date(),
      emailVerified: true,
      twoFactorEnabled: false,
    }

    return NextResponse.json(
      {
        success: true,
        user: mockUser,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
  }
}

/**
 * PATCH /api/auth/profile
 * Update current user profile
 */
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, avatar, phone, organization, department } = await req.json()

    // In production, extract userId from JWT and update
    const result = await authService.updateUserProfile("user_mock_123", {
      name,
      avatar,
      phone,
      organization,
      department,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
