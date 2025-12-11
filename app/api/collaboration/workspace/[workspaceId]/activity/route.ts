import { NextRequest, NextResponse } from "next/server"
import { activityFeedService } from "@/lib/activity-feed"

/**
 * GET /api/collaboration/workspace/[workspaceId]/activity
 * Get activity feed for workspace
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { searchParams } = req.nextUrl
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0

    const activities = activityFeedService.getWorkspaceActivityFeed(
      params.workspaceId,
      limit,
      offset
    )

    const stats = activityFeedService.getWorkspaceActivityStats(params.workspaceId)

    return NextResponse.json({
      success: true,
      workspaceId: params.workspaceId,
      total: stats.totalEvents,
      activities,
      stats,
    })
  } catch (error) {
    console.error("Error fetching activity feed:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity feed" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/collaboration/workspace/[workspaceId]/activity
 * Log an activity event
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId, userName, type, description, target, metadata, isPublic } =
      await req.json()

    if (!userId || !userName || !type || !target) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const activity = activityFeedService.logActivity(
      params.workspaceId,
      userId,
      userName,
      type,
      description,
      target,
      metadata,
      isPublic
    )

    return NextResponse.json(
      {
        success: true,
        activity,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error logging activity:", error)
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    )
  }
}
