/**
 * Type Definitions for Forensic Analysis
 * Core types and interfaces for the forensic system
 */

/**
 * Basic detection result
 */
export type DetectionDecision = "real" | "synthetic"

/**
 * Confidence level classification
 */
export type ConfidenceLevel = "very_high" | "high" | "medium" | "low" | "very_low"

/**
 * Feature category type
 */
export type FeatureCategory = "frequency" | "spatial" | "color" | "other"

/**
 * Threat severity classification
 */
export type ThreatSeverity = "critical" | "high" | "medium" | "low"

/**
 * Report format type
 */
export type ReportFormat = "text" | "html" | "pdf" | "json"

/**
 * Individual detection result from a model
 */
export interface ModelDetectionResult {
  modelName: string
  modelVersion: string
  decision: DetectionDecision
  confidence: number
  rawScore: number
  processingTime: number
  explanations: string[]
}

/**
 * Feature importance entry
 */
export interface FeatureImportance {
  featureName: string
  importance: number
  category: FeatureCategory
  evidence: string
  contribution: "positive" | "negative" // How it contributes to synthetic classification
}

/**
 * Ensemble detection result
 */
export interface EnsembleDetectionResult {
  decision: DetectionDecision
  confidence: number
  timestamp: Date
  processingTime: number
  modelResults: ModelDetectionResult[]
  features: FeatureImportance[]
  agreementLevel: number
  warnings: string[]
}

/**
 * Threat intelligence match
 */
export interface ThreatMatch {
  threatId: string
  threatType: string
  confidence: number
  severity: ThreatSeverity
  lastDetected: Date
  detectionCount: number
  recommendation: string
}

/**
 * Chain of custody entry
 */
export interface ChainOfCustodyEntry {
  timestamp: Date
  action: string
  actor: string
  fileHash: string
  signature?: string
  notes?: string
}

/**
 * Forensic analysis report
 */
export interface ForensicAnalysisReport {
  analysisId: string
  imageUrl: string
  analysisDate: Date
  analyst?: string
  decision: DetectionDecision
  confidence: number
  methodology: string
  limitations: string[]
  uncertainties: {
    confidence: number
    explanation: string
  }
  features: FeatureImportance[]
  threats: ThreatMatch[]
  chainOfCustody: ChainOfCustodyEntry[]
  recommendations: string[]
  admissibilityNotes?: string
}

/**
 * Analysis metadata
 */
export interface AnalysisMetadata {
  analysisId: string
  createdAt: Date
  updatedAt: Date
  sourceImageUrl: string
  imageResolution?: {
    width: number
    height: number
  }
  fileSize?: number
  processingTimeMs: number
  systemVersion: string
  modelVersions: Record<string, string>
}

/**
 * System health status
 */
export interface SystemHealthStatus {
  timestamp: Date
  cpuUsage: number
  memoryUsage: number
  activeAnalyses: number
  modelAvailability: Record<string, boolean>
  uptime: number
  errorRate: number
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  poolSize: number
}

/**
 * Analysis request
 */
export interface AnalysisRequest {
  imageUrl: string
  analysisId?: string
  priority?: "low" | "medium" | "high"
  callback?: string
  metadata?: Record<string, unknown>
}

/**
 * Analysis response
 */
export interface AnalysisResponse {
  success: boolean
  analysisId: string
  result?: EnsembleDetectionResult
  report?: ForensicAnalysisReport
  error?: {
    code: string
    message: string
  }
  timestamp: Date
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
