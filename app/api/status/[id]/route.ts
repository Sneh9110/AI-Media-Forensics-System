import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const analysis = await db.getAnalysisById(params.id)

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: analysis.id,
      status: analysis.analysisStatus,
      progress: analysis.analysisStatus === "completed" ? 100 : analysis.analysisStatus === "processing" ? 50 : 0,
      authenticity: analysis.authenticity,
    })
  } catch (error) {
    console.error("Failed to fetch status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
