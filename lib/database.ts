import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  createdAt: string
}

export interface AnalysisResult {
  id: string
  userId: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  analysisStatus: "pending" | "processing" | "completed" | "failed"
  authenticity: {
    prediction: "real" | "synthetic"
    confidence: number
    modelVersion: string
  } | null
  metadata: {
    md5: string
    sha256: string
    dimensions?: { width: number; height: number }
    duration?: number
  }
  heatmapData?: number[][]
  reportPath?: string
}

export interface DatabaseSchema {
  users: User[]
  analyses: AnalysisResult[]
  settings: {
    modelVersion: string
    maxFileSize: number
    allowedFileTypes: string[]
  }
}

class JSONDatabase {
  private dbPath: string
  private data: DatabaseSchema

  constructor() {
    this.dbPath = path.join(process.cwd(), "data", "database.json")
    this.data = {
      users: [],
      analyses: [],
      settings: {
        modelVersion: "1.0.0",
        maxFileSize: 20 * 1024 * 1024, // 20MB
        allowedFileTypes: [".jpg", ".jpeg", ".png", ".mp4", ".mov", ".avi"],
      },
    }
  }

  async init() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath)
      await fs.mkdir(dataDir, { recursive: true })

      // Try to read existing database
      const data = await fs.readFile(this.dbPath, "utf-8")
      this.data = JSON.parse(data)
    } catch (error) {
      // If file doesn't exist, create it with default data
      await this.save()
    }
  }

  private async save() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2))
  }

  // User operations
  async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    this.data.users.push(newUser)
    await this.save()
    return newUser
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.data.users.find((user) => user.email === email) || null
  }

  async getUserById(id: string): Promise<User | null> {
    return this.data.users.find((user) => user.id === id) || null
  }

  // Analysis operations
  async createAnalysis(analysis: Omit<AnalysisResult, "id" | "uploadedAt">): Promise<AnalysisResult> {
    const newAnalysis: AnalysisResult = {
      ...analysis,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString(),
    }
    this.data.analyses.push(newAnalysis)
    await this.save()
    return newAnalysis
  }

  async updateAnalysis(id: string, updates: Partial<AnalysisResult>): Promise<AnalysisResult | null> {
    const index = this.data.analyses.findIndex((analysis) => analysis.id === id)
    if (index === -1) return null

    this.data.analyses[index] = { ...this.data.analyses[index], ...updates }
    await this.save()
    return this.data.analyses[index]
  }

  async getAnalysesByUserId(userId: string): Promise<AnalysisResult[]> {
    return this.data.analyses.filter((analysis) => analysis.userId === userId)
  }

  async getAnalysisById(id: string): Promise<AnalysisResult | null> {
    return this.data.analyses.find((analysis) => analysis.id === id) || null
  }

  async getAllAnalyses(): Promise<AnalysisResult[]> {
    return this.data.analyses
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    const index = this.data.analyses.findIndex((analysis) => analysis.id === id)
    if (index === -1) return false

    this.data.analyses.splice(index, 1)
    await this.save()
    return true
  }

  // Settings operations
  async getSettings() {
    return this.data.settings
  }

  async updateSettings(updates: Partial<DatabaseSchema["settings"]>) {
    this.data.settings = { ...this.data.settings, ...updates }
    await this.save()
    return this.data.settings
  }
}

// Singleton instance
let dbInstance: JSONDatabase | null = null

export async function getDatabase(): Promise<JSONDatabase> {
  if (!dbInstance) {
    dbInstance = new JSONDatabase()
    await dbInstance.init()
  }
  return dbInstance
}
/**
 * Validate analysis result data integrity
 * Ensures all required fields are present and valid
 */
export function validateAnalysisResult(result: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!result.id) errors.push("Analysis ID is required")
  if (!result.userId) errors.push("User ID is required")
  if (!result.fileName) errors.push("File name is required")
  if (result.fileSize === undefined) errors.push("File size is required")
  if (!result.uploadedAt) errors.push("Upload timestamp is required")
  if (!["pending", "processing", "completed", "failed"].includes(result.analysisStatus)) {
    errors.push("Invalid analysis status")
  }

  if (result.authenticity) {
    if (!["real", "synthetic"].includes(result.authenticity.prediction)) {
      errors.push("Invalid authenticity prediction")
    }
    if (result.authenticity.confidence < 0 || result.authenticity.confidence > 1) {
      errors.push("Confidence must be between 0 and 1")
    }
  }

  return { valid: errors.length === 0, errors }
}