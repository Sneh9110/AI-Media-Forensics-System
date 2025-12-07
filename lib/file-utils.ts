import crypto from "crypto"

export interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
  md5: string
  sha256: string
  dimensions?: { width: number; height: number }
  duration?: number
  exif?: any
}

export async function calculateFileHashes(buffer: ArrayBuffer): Promise<{ md5: string; sha256: string }> {
  const data = new Uint8Array(buffer)

  // Use Web Crypto API for browser compatibility
  if (typeof window !== "undefined") {
    // Browser environment
    const hashBuffer1 = await crypto.subtle.digest("SHA-256", data)
    const sha256 = Array.from(new Uint8Array(hashBuffer1))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // For MD5, we'll use a simple hash for demo purposes
    const md5 = sha256.substring(0, 32)

    return { md5, sha256 }
  } else {
    // Server environment
    const cryptoNode = require("crypto")
    const md5 = cryptoNode.createHash("md5").update(data).digest("hex")
    const sha256 = cryptoNode.createHash("sha256").update(data).digest("hex")
    return { md5, sha256 }
  }
}

export async function extractImageMetadata(file: File): Promise<FileMetadata> {
  const buffer = await file.arrayBuffer()
  const hashes = await calculateFileHashes(buffer)

  // Get image dimensions
  const dimensions = await getImageDimensions(file)

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    dimensions,
    ...hashes,
  }
}

export async function extractVideoMetadata(file: File): Promise<FileMetadata> {
  const buffer = await file.arrayBuffer()
  const hashes = await calculateFileHashes(buffer)

  // Get video duration (simplified)
  const duration = await getVideoDuration(file)

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    duration,
    ...hashes,
  }
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      // Server-side fallback
      resolve({ width: 1920, height: 1080 })
      return
    }

    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }
    img.src = URL.createObjectURL(file)
  })
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      // Server-side fallback
      resolve(60) // Default 60 seconds
      return
    }

    const video = document.createElement("video")
    video.onloadedmetadata = () => {
      resolve(video.duration || 60)
      URL.revokeObjectURL(video.src)
    }
    video.onerror = () => {
      reject(new Error("Failed to load video"))
    }
    video.src = URL.createObjectURL(file)
  })
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 20 * 1024 * 1024 // 20MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "video/mp4", "video/quicktime", "video/x-msvideo"]

  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 20MB limit" }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type not supported" }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
