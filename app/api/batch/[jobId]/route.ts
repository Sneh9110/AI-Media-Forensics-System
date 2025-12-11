import { NextRequest, NextResponse } from "next/server"
import { batchProcessor } from "@/lib/batch-processor"
import { batchStorage } from "@/lib/batch-storage"

/**
 * GET /api/batch/status
 * Get status of a batch job
 */
export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const jobId = params.jobId
    const job = batchProcessor.getBatchJob(jobId)

    if (!job) {
      return NextResponse.json({ error: "Batch job not found" }, { status: 404 })
    }

    const stats = batchProcessor.getBatchStatistics(jobId)
    const queueStatus = batchProcessor.getQueueStatus()

    return NextResponse.json({
      success: true,
      job,
      stats,
      queueStatus,
    })
  } catch (error) {
    console.error("Error fetching batch status:", error)
    return NextResponse.json({ error: "Failed to fetch batch status" }, { status: 500 })
  }
}

/**
 * PATCH /api/batch/status
 * Cancel or pause a batch job
 */
export async function PATCH(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const jobId = params.jobId
    const { action } = await req.json()

    let success = false

    if (action === "cancel") {
      success = batchProcessor.cancelBatchJob(jobId)
    } else if (action === "pause") {
      success = batchProcessor.pauseBatchJob(jobId)
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to update batch job" }, { status: 400 })
    }

    const job = batchProcessor.getBatchJob(jobId)
    return NextResponse.json({
      success: true,
      message: `Batch job ${action}ed successfully`,
      job,
    })
  } catch (error) {
    console.error("Error updating batch job:", error)
    return NextResponse.json({ error: "Failed to update batch job" }, { status: 500 })
  }
}
