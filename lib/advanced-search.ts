/**
 * Advanced Search & Filter Service
 * Provides sophisticated filtering capabilities for analyses
 */

import { AnalysisResult } from "./database"

export interface FilterCriteria {
  searchTerm?: string
  prediction?: 'real' | 'synthetic' | 'all'
  confidenceRange?: { min: number; max: number }
  dateRange?: { start: Date; end: Date }
  fileType?: string
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'all'
  sortBy?: 'date' | 'confidence' | 'name' | 'size'
  sortOrder?: 'asc' | 'desc'
}

export class AdvancedSearchFilter {
  /**
   * Apply filters to analyses list
   */
  static filterAnalyses(
    analyses: AnalysisResult[],
    criteria: FilterCriteria
  ): AnalysisResult[] {
    let filtered = [...analyses]

    // Search term filter
    if (criteria.searchTerm) {
      const term = criteria.searchTerm.toLowerCase()
      filtered = filtered.filter(
        a =>
          a.fileName.toLowerCase().includes(term) ||
          a.id.toLowerCase().includes(term) ||
          a.fileType.toLowerCase().includes(term)
      )
    }

    // Prediction filter
    if (criteria.prediction && criteria.prediction !== 'all') {
      filtered = filtered.filter(a => a.authenticity?.prediction === criteria.prediction)
    }

    // Confidence range filter
    if (criteria.confidenceRange) {
      filtered = filtered.filter(
        a =>
          a.authenticity &&
          a.authenticity.confidence >= criteria.confidenceRange!.min &&
          a.authenticity.confidence <= criteria.confidenceRange!.max
      )
    }

    // Date range filter
    if (criteria.dateRange) {
      filtered = filtered.filter(a => {
        const uploadDate = new Date(a.uploadedAt)
        return (
          uploadDate >= criteria.dateRange!.start &&
          uploadDate <= criteria.dateRange!.end
        )
      })
    }

    // File type filter
    if (criteria.fileType && criteria.fileType !== 'all') {
      filtered = filtered.filter(a => a.fileType.includes(criteria.fileType!))
    }

    // Status filter
    if (criteria.status && criteria.status !== 'all') {
      filtered = filtered.filter(a => a.analysisStatus === criteria.status)
    }

    // Sorting
    const sortBy = criteria.sortBy || 'date'
    const sortOrder = criteria.sortOrder || 'desc'

    filtered.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'confidence':
          compareValue = (a.authenticity?.confidence || 0) - (b.authenticity?.confidence || 0)
          break
        case 'name':
          compareValue = a.fileName.localeCompare(b.fileName)
          break
        case 'size':
          compareValue = a.fileSize - b.fileSize
          break
        default:
          compareValue = 0
      }

      return sortOrder === 'desc' ? -compareValue : compareValue
    })

    return filtered
  }

  /**
   * Get filter suggestions based on current analyses
   */
  static getSuggestions(analyses: AnalysisResult[]): {
    fileTypes: string[]
    confidenceRanges: string[]
    recentSearches: string[]
  } {
    const fileTypes = [...new Set(analyses.map(a => a.fileType))].sort()
    const confidenceRanges = [
      '0-25% (Very Low)',
      '25-50% (Low)',
      '50-75% (Medium)',
      '75-100% (High)',
    ]
    // In a real app, this would be stored from user searches
    const recentSearches: string[] = []

    return { fileTypes, confidenceRanges, recentSearches }
  }

  /**
   * Get filter statistics
   */
  static getFilterStats(analyses: AnalysisResult[]): {
    totalCount: number
    realCount: number
    syntheticCount: number
    averageConfidence: number
    completedCount: number
    failedCount: number
  } {
    const realCount = analyses.filter(a => a.authenticity?.prediction === 'real').length
    const syntheticCount = analyses.filter(
      a => a.authenticity?.prediction === 'synthetic'
    ).length
    const completedCount = analyses.filter(a => a.analysisStatus === 'completed').length
    const failedCount = analyses.filter(a => a.analysisStatus === 'failed').length

    const confidenceSum = analyses.reduce((sum, a) => sum + (a.authenticity?.confidence || 0), 0)
    const averageConfidence = analyses.length > 0 ? confidenceSum / analyses.length : 0

    return {
      totalCount: analyses.length,
      realCount,
      syntheticCount,
      averageConfidence,
      completedCount,
      failedCount,
    }
  }
}

/**
 * Rate limiter utility
 * Prevents abuse and manages API request frequency
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now()
    const clientRequests = this.requests.get(clientId) || []

    // Remove requests outside the time window
    const validRequests = clientRequests.filter((timestamp) => now - timestamp < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(clientId, validRequests)
    return true
  }

  getRemainingRequests(clientId: string): number {
    const now = Date.now()
    const clientRequests = this.requests.get(clientId) || []
    const validRequests = clientRequests.filter((timestamp) => now - timestamp < this.windowMs)
    return Math.max(0, this.maxRequests - validRequests.length)
  }

  reset(clientId?: string): void {
    if (clientId) {
      this.requests.delete(clientId)
    } else {
      this.requests.clear()
    }
  }
}

export const advancedSearch = new AdvancedSearchFilter()
export const apiRateLimiter = new RateLimiter(100, 60000)
