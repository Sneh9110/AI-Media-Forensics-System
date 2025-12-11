/**
 * Persistent Batch Storage Service
 * Manages batch metadata, history, and localStorage persistence
 */

import type { BatchJob, BatchAnalysisResult } from "./batch-processor"

export interface StoredBatchMetadata {
  jobId: string
  name: string
  createdAt: string
  modifiedAt: string
  totalFiles: number
  processedFiles: number
  status: string
  tags: string[]
  description: string
  resultsSummary: {
    syntheticCount: number
    realCount: number
    averageConfidence: number
  }
}

class BatchStorageService {
  private readonly STORAGE_KEY = "ai_forensics_batch_history"
  private readonly MAX_STORED_BATCHES = 100
  private batchHistory: StoredBatchMetadata[] = []

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Save batch metadata to persistent storage
   */
  saveBatchMetadata(job: BatchJob): void {
    const metadata: StoredBatchMetadata = {
      jobId: job.id,
      name: job.name,
      createdAt: job.createdAt.toISOString(),
      modifiedAt: new Date().toISOString(),
      totalFiles: job.totalFiles,
      processedFiles: job.processedFiles,
      status: job.status,
      tags: job.metadata.tags,
      description: job.metadata.description,
      resultsSummary: {
        syntheticCount: job.results.filter((r) => r.prediction === "synthetic").length,
        realCount: job.results.filter((r) => r.prediction === "real").length,
        averageConfidence:
          job.results.length > 0
            ? job.results.reduce((sum, r) => sum + r.confidence, 0) / job.results.length
            : 0,
      },
    }

    // Remove if exists (to update)
    this.batchHistory = this.batchHistory.filter((b) => b.jobId !== job.id)

    // Add to front (most recent first)
    this.batchHistory.unshift(metadata)

    // Keep only max batches
    if (this.batchHistory.length > this.MAX_STORED_BATCHES) {
      this.batchHistory = this.batchHistory.slice(0, this.MAX_STORED_BATCHES)
    }

    this.saveToStorage()
  }

  /**
   * Get batch history with filtering
   */
  getBatchHistory(filters?: {
    status?: string
    tags?: string[]
    dateRange?: { start: Date; end: Date }
    limit?: number
  }): StoredBatchMetadata[] {
    let filtered = [...this.batchHistory]

    if (filters?.status) {
      filtered = filtered.filter((b) => b.status === filters.status)
    }

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter((b) => filters.tags!.some((tag) => b.tags.includes(tag)))
    }

    if (filters?.dateRange) {
      const startTime = filters.dateRange.start.getTime()
      const endTime = filters.dateRange.end.getTime()
      filtered = filtered.filter((b) => {
        const batchTime = new Date(b.createdAt).getTime()
        return batchTime >= startTime && batchTime <= endTime
      })
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  /**
   * Get a single batch metadata
   */
  getBatchMetadata(jobId: string): StoredBatchMetadata | undefined {
    return this.batchHistory.find((b) => b.jobId === jobId)
  }

  /**
   * Delete batch from history
   */
  deleteBatch(jobId: string): boolean {
    const initialLength = this.batchHistory.length
    this.batchHistory = this.batchHistory.filter((b) => b.jobId !== jobId)
    const deleted = this.batchHistory.length < initialLength
    if (deleted) this.saveToStorage()
    return deleted
  }

  /**
   * Add tag to batch
   */
  addTagToBatch(jobId: string, tag: string): boolean {
    const batch = this.batchHistory.find((b) => b.jobId === jobId)
    if (!batch) return false

    if (!batch.tags.includes(tag)) {
      batch.tags.push(tag)
      batch.modifiedAt = new Date().toISOString()
      this.saveToStorage()
    }
    return true
  }

  /**
   * Remove tag from batch
   */
  removeTagFromBatch(jobId: string, tag: string): boolean {
    const batch = this.batchHistory.find((b) => b.jobId === jobId)
    if (!batch) return false

    const initialLength = batch.tags.length
    batch.tags = batch.tags.filter((t) => t !== tag)
    if (batch.tags.length < initialLength) {
      batch.modifiedAt = new Date().toISOString()
      this.saveToStorage()
      return true
    }
    return false
  }

  /**
   * Get all unique tags used across batches
   */
  getAllTags(): string[] {
    const tagSet = new Set<string>()
    this.batchHistory.forEach((batch) => {
      batch.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }

  /**
   * Get statistics across all batches
   */
  getAggregateStatistics() {
    return {
      totalBatches: this.batchHistory.length,
      completedBatches: this.batchHistory.filter((b) => b.status === "completed").length,
      processingBatches: this.batchHistory.filter((b) => b.status === "processing").length,
      totalFilesAnalyzed: this.batchHistory.reduce((sum, b) => sum + b.processedFiles, 0),
      totalSyntheticDetected: this.batchHistory.reduce((sum, b) => sum + b.resultsSummary.syntheticCount, 0),
      totalRealDetected: this.batchHistory.reduce((sum, b) => sum + b.resultsSummary.realCount, 0),
      averageConfidenceAcrossAll:
        this.batchHistory.length > 0
          ? this.batchHistory.reduce((sum, b) => sum + b.resultsSummary.averageConfidence, 0) /
            this.batchHistory.length
          : 0,
    }
  }

  /**
   * Export batch history as CSV
   */
  exportHistoryAsCSV(): string {
    const headers = [
      "Batch ID",
      "Batch Name",
      "Created At",
      "Status",
      "Total Files",
      "Synthetic Count",
      "Real Count",
      "Avg Confidence",
      "Tags",
    ]

    const rows = this.batchHistory.map((b) => [
      b.jobId,
      b.name,
      b.createdAt,
      b.status,
      b.totalFiles,
      b.resultsSummary.syntheticCount,
      b.resultsSummary.realCount,
      b.resultsSummary.averageConfidence.toFixed(3),
      b.tags.join("; "),
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    return csvContent
  }

  /**
   * Search batches by name or description
   */
  searchBatches(query: string): StoredBatchMetadata[] {
    const lowerQuery = query.toLowerCase()
    return this.batchHistory.filter(
      (b) => b.name.toLowerCase().includes(lowerQuery) || b.description.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Clear all batch history (with confirmation)
   */
  clearAllHistory(confirm: boolean = false): boolean {
    if (!confirm) return false
    this.batchHistory = []
    this.saveToStorage()
    return true
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.batchHistory))
    } catch (error) {
      console.error("Failed to save batch history to localStorage:", error)
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.batchHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Failed to load batch history from localStorage:", error)
      this.batchHistory = []
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo() {
    const data = JSON.stringify(this.batchHistory)
    return {
      entriesCount: this.batchHistory.length,
      approximateSizeKB: (data.length / 1024).toFixed(2),
      maxEntries: this.MAX_STORED_BATCHES,
    }
  }
}

// Export singleton instance
export const batchStorage = new BatchStorageService()
