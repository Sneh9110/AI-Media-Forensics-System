import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads")
    await fs.mkdir(uploadsDir, { recursive: true })

    // Save file
    const buffer = await file.arrayBuffer()
    const filename = `${Date.now()}-${file.name}`
    const filepath = path.join(uploadsDir, filename)

    await fs.writeFile(filepath, Buffer.from(buffer))

    return NextResponse.json({
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      path: `/uploads/${filename}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
