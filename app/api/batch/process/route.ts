import { NextRequest, NextResponse } from "next/server"
import { batchProcessor, type BatchJob } from "@/lib/batch-processor"
import { batchStorage } from "@/lib/batch-storage"

/**
 * POST /api/batch/process
 * Create a new batch processing job
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { files, batchName, priority, tags, description } = data

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (!batchName) {
      return NextResponse.json({ error: "Batch name is required" }, { status: 400 })
    }

    // Create file objects (in production, these would be actual File objects)
    const fileObjects = files.map((file: any) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }))

    // Create batch job using batch processor
    const job = await batchProcessor.createBatchJob(fileObjects, {
      name: batchName,
      priority: priority || "medium",
      tags,
      description,
    })

    // Save metadata to storage
    batchStorage.saveBatchMetadata(job)

    return NextResponse.json(
      {
        success: true,
        jobId: job.id,
        message: "Batch job created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Batch processing error:", error)
    return NextResponse.json({ error: "Failed to create batch job" }, { status: 500 })
  }
}

/**
 * GET /api/batch/process
 * Get all batch jobs
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50

    const allJobs = batchProcessor.getAllBatchJobs()
    let filtered = allJobs

    if (status) {
      filtered = filtered.filter((job) => job.status === status)
    }

    filtered = filtered.slice(0, limit)

    const jobsWithStats = filtered.map((job) => ({
      ...job,
      stats: batchProcessor.getBatchStatistics(job.id),
    }))

    return NextResponse.json({
      success: true,
      total: allJobs.length,
      returned: filtered.length,
      jobs: jobsWithStats,
    })
  } catch (error) {
    console.error("Error fetching batch jobs:", error)
    return NextResponse.json({ error: "Failed to fetch batch jobs" }, { status: 500 })
  }
}
