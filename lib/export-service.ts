/**
 * Export Service - Generate reports in multiple formats
 * CSV, JSON, PDF for analysis results
 */

export interface ExportableAnalysisResult {
  id: string
  fileName: string
  uploadedAt: string
  prediction: 'real' | 'synthetic'
  confidence: number
  processingTime: number
  metadata: {
    spatialScore: number
    frequencyScore: number
    aiGenerationScore: number
    deepfakeScore: number
    manipulationScore: number
    prnuSensorScore: number
  }
  ensembleAnalysis?: {
    finalScore: number
    consensusStrength: number
    detectorsUsed: number
  }
}

/**
 * Export analysis result to CSV format
 */
export function exportToCSV(
  results: ExportableAnalysisResult | ExportableAnalysisResult[]
): string {
  const resultsArray = Array.isArray(results) ? results : [results]

  // CSV Headers
  const headers = [
    'File Name',
    'Prediction',
    'Confidence (%)',
    'Spatial Score',
    'Frequency Score',
    'AI Generation Score',
    'Deepfake Score',
    'Manipulation Score',
    'PRNU Sensor Score',
    'Processing Time (ms)',
    'Uploaded At',
    'Analysis ID'
  ]

  // CSV Rows
  const rows = resultsArray.map((result) => [
    `"${result.fileName}"`,
    result.prediction.toUpperCase(),
    (result.confidence * 100).toFixed(2),
    result.metadata.spatialScore.toFixed(4),
    result.metadata.frequencyScore.toFixed(4),
    result.metadata.aiGenerationScore.toFixed(4),
    result.metadata.deepfakeScore.toFixed(4),
    result.metadata.manipulationScore.toFixed(4),
    result.metadata.prnuSensorScore.toFixed(4),
    result.processingTime,
    result.uploadedAt,
    result.id
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Export analysis result to JSON format
 */
export function exportToJSON(
  results: ExportableAnalysisResult | ExportableAnalysisResult[],
  pretty = true
): string {
  const resultsArray = Array.isArray(results) ? results : [results]

  const jsonData = {
    exportDate: new Date().toISOString(),
    totalResults: resultsArray.length,
    results: resultsArray.map((result) => ({
      id: result.id,
      fileName: result.fileName,
      prediction: result.prediction,
      confidence: (result.confidence * 100).toFixed(2) + '%',
      scores: {
        spatial: result.metadata.spatialScore.toFixed(4),
        frequency: result.metadata.frequencyScore.toFixed(4),
        aiGeneration: result.metadata.aiGenerationScore.toFixed(4),
        deepfake: result.metadata.deepfakeScore.toFixed(4),
        manipulation: result.metadata.manipulationScore.toFixed(4),
        prnuSensor: result.metadata.prnuSensorScore.toFixed(4)
      },
      ensemble: result.ensembleAnalysis,
      processingTime: result.processingTime + 'ms',
      uploadedAt: result.uploadedAt
    }))
  }

  return pretty ? JSON.stringify(jsonData, null, 2) : JSON.stringify(jsonData)
}

/**
 * Download file helper
 */
export function downloadFile(content: string, fileName: string, mimeType: string): void {
  const element = document.createElement('a')
  element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`)
  element.setAttribute('download', fileName)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * Generate filename with timestamp
 */
export function generateFileName(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().slice(0, 10)
  const time = new Date().getTime()
  return `${baseName}_${timestamp}_${time}.${extension}`
}

/**
 * Main export handler
 */
export function exportAnalysisResult(
  result: ExportableAnalysisResult | ExportableAnalysisResult[],
  format: 'csv' | 'json' | 'both' = 'json'
): void {
  const singleResult = Array.isArray(result) ? result[0] : result
  const baseName = singleResult.fileName.replace(/\.[^/.]+$/, '')

  if (format === 'csv' || format === 'both') {
    const csvContent = exportToCSV(result)
    const csvFileName = generateFileName(`${baseName}_analysis`, 'csv')
    downloadFile(csvContent, csvFileName, 'text/csv')
  }

  if (format === 'json' || format === 'both') {
    const jsonContent = exportToJSON(result, true)
    const jsonFileName = generateFileName(`${baseName}_analysis`, 'json')
    downloadFile(jsonContent, jsonFileName, 'application/json')
  }
}
