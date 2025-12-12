/**
 * Formatting Utilities
 * Helper functions for formatting analysis results and reports
 */

/**
 * Format bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns formatted string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Format milliseconds to human-readable format
 * @param ms - Milliseconds
 * @returns formatted string
 */
export function formatMilliseconds(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Format date for forensic reports
 * @param date - Date object
 * @returns ISO string
 */
export function formatForensicDate(date: Date): string {
  return date.toISOString()
}

/**
 * Format percentage with specified decimals
 * @param value - Value between 0 and 1
 * @param decimals - Number of decimal places
 * @returns formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return "0%"
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format confidence with interpretation
 * @param confidence - Confidence 0-1
 * @returns formatted string with interpretation
 */
export function formatConfidenceWithInterpretation(confidence: number): string {
  const percent = formatPercent(confidence, 1)
  if (confidence >= 0.9) return `${percent} (Very High)`
  if (confidence >= 0.75) return `${percent} (High)`
  if (confidence >= 0.65) return `${percent} (Medium)`
  if (confidence >= 0.5) return `${percent} (Low)`
  return `${percent} (Very Low)`
}

/**
 * Format model name for display
 * @param modelName - Model identifier
 * @returns display name
 */
export function formatModelName(modelName: string): string {
  const nameMap: Record<string, string> = {
    airia: "AIRIA AI Agent",
    pytorch: "Enhanced PyTorch Detector",
    prnu: "Real Image Analyzer (PRNU)",
    "AIRIA AI Agent": "AIRIA AI Agent",
    "Enhanced PyTorch Detector": "Enhanced PyTorch Detector",
    "Real Image Analyzer (PRNU)": "Real Image Analyzer (PRNU)",
  }
  return nameMap[modelName] || modelName
}

/**
 * Format threat severity for display
 * @param severity - Severity level
 * @returns formatted string
 */
export function formatThreatSeverity(severity: string): string {
  const severityMap: Record<string, string> = {
    critical: "🔴 CRITICAL",
    high: "🟠 HIGH",
    medium: "🟡 MEDIUM",
    low: "🟢 LOW",
  }
  return severityMap[severity] || severity.toUpperCase()
}

/**
 * Format decision result
 * @param decision - "real" or "synthetic"
 * @param confidence - Confidence score
 * @returns formatted string
 */
export function formatDecision(decision: string, confidence?: number): string {
  const upperDecision = decision.toUpperCase()
  if (!confidence) return upperDecision
  return `${upperDecision} (${formatPercent(confidence, 1)})`
}

/**
 * Format feature name for display
 * @param featureName - Feature identifier
 * @returns display name
 */
export function formatFeatureName(featureName: string): string {
  return featureName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Format hash for display
 * @param hash - Full hash string
 * @returns abbreviated hash
 */
export function formatHash(hash: string): string {
  if (hash.length <= 16) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

/**
 * Format analysis ID for display
 * @param id - Analysis ID
 * @returns formatted ID
 */
export function formatAnalysisId(id: string): string {
  // Format: ANALYSIS_20240115_001 -> ANALYSIS_20240115...001
  if (id.length > 20) {
    return `${id.slice(0, 10)}...${id.slice(-3)}`
  }
  return id
}

/**
 * Create formatted separator line
 * @param char - Character to use for line
 * @param length - Line length
 * @returns separator line
 */
export function createSeparator(char: string = "=", length: number = 60): string {
  return char.repeat(length)
}

/**
 * Format feature importance for report display
 * @param importance - Importance 0-1
 * @param bars - Number of bars to display
 * @returns visual representation
 */
export function formatImportanceBar(importance: number, bars: number = 20): string {
  const filledBars = Math.round(importance * bars)
  const emptyBars = bars - filledBars
  return `[${"█".repeat(filledBars)}${"░".repeat(emptyBars)}]`
}

/**
 * Pad string to specified length
 * @param str - String to pad
 * @param length - Target length
 * @param padChar - Padding character
 * @returns padded string
 */
export function padString(str: string, length: number, padChar: string = " "): string {
  if (str.length >= length) return str
  return str + padChar.repeat(length - str.length)
}

/**
 * Truncate string to specified length
 * @param str - String to truncate
 * @param length - Max length
 * @param suffix - Suffix to add (default: "...")
 * @returns truncated string
 */
export function truncateString(str: string, length: number, suffix: string = "..."): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}
