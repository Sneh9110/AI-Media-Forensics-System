import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

/**
 * POST /api/auth/register
 * Register new user
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, organization, department, agreeToTerms } = await req.json()

    if (!agreeToTerms) {
      return NextResponse.json({ error: "Must agree to terms" }, { status: 400 })
    }

    const result = await authService.register({
      email,
      password,
      name,
      organization,
      department,
      agreeToTerms,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
