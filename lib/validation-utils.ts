/**
 * Validation Utilities
 * Helper functions for input validation and data checking
 */

import { REPORT_VALIDATION, CONFIDENCE_THRESHOLDS } from "./constants"

/**
 * Validate confidence score
 * @param confidence - Score between 0 and 1
 * @returns true if valid
 */
export function isValidConfidence(confidence: number): boolean {
  return (
    typeof confidence === "number" &&
    confidence >= REPORT_VALIDATION.MIN_CONFIDENCE &&
    confidence <= REPORT_VALIDATION.MAX_CONFIDENCE &&
    !isNaN(confidence)
  )
}

/**
 * Validate image URL or path
 * @param imageUrl - Image URL or file path
 * @returns true if valid format
 */
export function isValidImageUrl(imageUrl: string): boolean {
  if (typeof imageUrl !== "string" || imageUrl.length === 0) return false
  const urlPattern =
    /^(https?:\/\/|\/|\.).*\.(jpg|jpeg|png|gif|webp|bmp)$/i
  return urlPattern.test(imageUrl)
}

/**
 * Validate analysis ID format
 * @param analysisId - ID to validate
 * @returns true if valid format
 */
export function isValidAnalysisId(analysisId: string): boolean {
  const idPattern = /^[A-Z0-9_]{10,50}$/
  return idPattern.test(analysisId)
}

/**
 * Validate hash string (SHA256, MD5)
 * @param hash - Hash to validate
 * @returns true if valid
 */
export function isValidHash(hash: string): boolean {
  // SHA256: 64 hex chars, MD5: 32 hex chars
  const hashPattern = /^[a-f0-9]{32}$|^[a-f0-9]{64}$/i
  return hashPattern.test(hash)
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns true if valid
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

/**
 * Validate forensic evidence text
 * @param evidence - Evidence description
 * @returns true if valid
 */
export function isValidEvidence(evidence: string): boolean {
  return (
    typeof evidence === "string" &&
    evidence.length >= REPORT_VALIDATION.MIN_EVIDENCE_LENGTH &&
    evidence.length <= REPORT_VALIDATION.MAX_EVIDENCE_LENGTH
  )
}

/**
 * Validate processing time in milliseconds
 * @param time - Processing time
 * @returns true if valid
 */
export function isValidProcessingTime(time: number): boolean {
  return (
    typeof time === "number" &&
    time > 0 &&
    time < 60000 && // Less than 60 seconds
    !isNaN(time)
  )
}

/**
 * Validate decision string
 * @param decision - Detection decision
 * @returns true if valid
 */
export function isValidDecision(decision: string): boolean {
  return decision === "real" || decision === "synthetic"
}

/**
 * Validate feature importance array
 * @param features - Array of features with importance
 * @returns true if valid
 */
export function isValidFeatureArray(
  features: Array<{ importance: number }>
): boolean {
  if (!Array.isArray(features) || features.length === 0) return false
  return features.every(
    (f) => typeof f.importance === "number" && isValidConfidence(f.importance)
  )
}

/**
 * Validate prediction result object
 * @param prediction - Prediction to validate
 * @returns true if valid structure
 */
export function isValidPrediction(prediction: {
  decision?: string
  confidence?: number
  processingTime?: number
}): boolean {
  return (
    (!prediction.decision || isValidDecision(prediction.decision)) &&
    (!prediction.confidence || isValidConfidence(prediction.confidence)) &&
    (!prediction.processingTime || isValidProcessingTime(prediction.processingTime))
  )
}

/**
 * Sanitize text for report inclusion
 * @param text - Text to sanitize
 * @returns sanitized text
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
    .trim()
}

/**
 * Normalize confidence to percentage
 * @param confidence - Confidence 0-1
 * @returns percentage string
 */
export function confidenceToPercent(confidence: number): string {
  if (!isValidConfidence(confidence)) return "0%"
  return `${(confidence * 100).toFixed(2)}%`
}

/**
 * Classify confidence level
 * @param confidence - Confidence 0-1
 * @returns confidence category
 */
export function classifyConfidence(
  confidence: number
): "very_high" | "high" | "medium" | "low" | "very_low" {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return "very_high"
  if (confidence >= 0.75) return "high"
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return "medium"
  if (confidence >= CONFIDENCE_THRESHOLDS.LOW) return "low"
  return "very_low"
}
