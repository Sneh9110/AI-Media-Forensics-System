import { NextRequest, NextResponse } from "next/server"
import { collaborationService } from "@/lib/collaboration-service"
import { activityFeedService } from "@/lib/activity-feed"

/**
 * GET /api/collaboration/workspace/[workspaceId]/comments
 * Get all comments for a workspace
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { searchParams } = req.nextUrl
    const analysisId = searchParams.get("analysisId")
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50

    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId parameter is required" },
        { status: 400 }
      )
    }

    const comments = collaborationService.getCommentsForAnalysis(analysisId)

    return NextResponse.json({
      success: true,
      analysisId,
      total: comments.length,
      comments: comments.slice(0, limit),
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/collaboration/workspace/[workspaceId]/comments
 * Add a comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { analysisId, author, content, parentCommentId } = await req.json()

    if (!analysisId || !author || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const comment = collaborationService.addCommentToAnalysis(
      analysisId,
      author,
      content,
      parentCommentId
    )

    // Log activity
    activityFeedService.logActivity(
      params.workspaceId,
      author.id,
      author.name,
      "comment_added",
      `Added a ${parentCommentId ? "reply" : "comment"}`,
      {
        type: "comment",
        id: comment?.id || "",
        name: `Comment on ${analysisId}`,
      }
    )

    return NextResponse.json(
      {
        success: true,
        comment,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
