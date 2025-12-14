/**
 * Advanced Analytics Engine
 * Pattern detection, statistical analysis, and intelligence scoring
 */

export interface DetectionPattern {
  id: string
  name: string
  description: string
  characteristics: string[]
  frequency: number
  lastDetected: Date
  confidence: number
  relatedAnalyses: string[]
}

export interface AnalysisTrend {
  period: "daily" | "weekly" | "monthly"
  date: Date
  syntheticCount: number
  realCount: number
  averageConfidence: number
  detectionRate: number
  topPatterns: DetectionPattern[]
}

export interface AnomalyDetection {
  id: string
  type: "unusual_confidence" | "pattern_spike" | "detection_rate_anomaly"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  affectedAnalyses: number
  timestamp: Date
  recommendation: string
}

export interface ComparativeMetrics {
  batchId: string
  totalAnalyses: number
  syntheticPercentage: number
  realPercentage: number
  confidenceDistribution: { range: string; count: number }[]
  averageProcessingTime: number
  detectionMethodBreakdown: {
    airia: number
    pytorch: number
    prnu: number
  }
}

class AnalyticsEngine {
  private detectionPatterns: Map<string, DetectionPattern> = new Map()
  private analysisTrends: Map<string, AnalysisTrend[]> = new Map()
  private anomalies: AnomalyDetection[] = []
  private analysisDatabase: Map<string, any> = new Map()

  /**
   * Detect patterns in analysis results
   */
  detectPatterns(analyses: any[]): DetectionPattern[] {
    const patterns: DetectionPattern[] = []

    // Pattern 1: High confidence synthetic with specific FFT signature
    const highConfidenceSynthetic = analyses.filter(
      (a) => a.prediction === "synthetic" && a.confidence > 0.85
    )
    if (highConfidenceSynthetic.length > 0) {
      const pattern: DetectionPattern = {
        id: `pattern_high_conf_syn_${Date.now()}`,
        name: "High Confidence Synthetic Detection",
        description: "Images detected as synthetic with confidence > 85%",
        characteristics: ["high_confidence", "synthetic_prediction", "frequency_anomalies"],
        frequency: highConfidenceSynthetic.length,
        lastDetected: new Date(),
        confidence: 0.92,
        relatedAnalyses: highConfidenceSynthetic.map((a) => a.fileId),
      }
      patterns.push(pattern)
      this.detectionPatterns.set(pattern.id, pattern)
    }

    // Pattern 2: Mixed detection results (low consensus)
    const mixedDetections = analyses.filter((a) => {
      const scores = [a.airia_score, a.pytorch_score, a.real_image_score]
      const stdDev =
        Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - 0.5, 2), 0) / scores.length) <
        0.2
      return stdDev
    })
    if (mixedDetections.length > 0) {
      const pattern: DetectionPattern = {
        id: `pattern_mixed_${Date.now()}`,
        name: "Mixed Detection Results",
        description: "Images where detection methods show varying confidence",
        characteristics: ["mixed_predictions", "low_consensus", "requires_review"],
        frequency: mixedDetections.length,
        lastDetected: new Date(),
        confidence: 0.65,
        relatedAnalyses: mixedDetections.map((a) => a.fileId),
      }
      patterns.push(pattern)
      this.detectionPatterns.set(pattern.id, pattern)
    }

    // Pattern 3: PRNU-signature detected (camera fingerprinting)
    const prnu Detected = analyses.filter((a) => a.prnu_fingerprint === true)
    if (prnuDetected.length > 0) {
      const pattern: DetectionPattern = {
        id: `pattern_prnu_${Date.now()}`,
        name: "PRNU Sensor Fingerprint Detected",
        description: "Images with identifiable sensor fingerprints (PRNU analysis)",
        characteristics: ["prnu_signature", "camera_authenticated", "can_trace_source"],
        frequency: prnuDetected.length,
        lastDetected: new Date(),
        confidence: 0.88,
        relatedAnalyses: prnuDetected.map((a) => a.fileId),
      }
      patterns.push(pattern)
      this.detectionPatterns.set(pattern.id, pattern)
    }

    return patterns
  }

  /**
   * Calculate analysis trends over time
   */
  calculateTrends(analyses: any[], period: "daily" | "weekly" | "monthly" = "daily"): AnalysisTrend[] {
    const trends: AnalysisTrend[] = []

    const groupByPeriod = (analyses: any[]) => {
      const grouped: { [key: string]: any[] } = {}

      analyses.forEach((analysis) => {
        const date = new Date(analysis.timestamp)
        let key = ""

        if (period === "daily") {
          key = date.toISOString().split("T")[0]
        } else if (period === "weekly") {
          const weekStart = new Date(date)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          key = weekStart.toISOString().split("T")[0]
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        }

        if (!grouped[key]) grouped[key] = []
        grouped[key].push(analysis)
      })

      return grouped
    }

    const grouped = groupByPeriod(analyses)

    Object.entries(grouped).forEach(([dateKey, analyses]) => {
      const syntheticCount = analyses.filter((a) => a.prediction === "synthetic").length
      const realCount = analyses.filter((a) => a.prediction === "real").length
      const avgConfidence =
        analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length

      const trend: AnalysisTrend = {
        period,
        date: new Date(dateKey),
        syntheticCount,
        realCount,
        averageConfidence: avgConfidence,
        detectionRate: (syntheticCount / analyses.length) * 100,
        topPatterns: this.detectPatterns(analyses),
      }

      trends.push(trend)
    })

    return trends.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  /**
   * Detect anomalies in analysis results
   */
  detectAnomalies(analyses: any[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []

    // Anomaly 1: Unusual confidence distribution
    const confidences = analyses.map((a) => a.confidence)
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length
    const stdDev = Math.sqrt(
      confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length
    )

    const unusualConfidences = analyses.filter((a) => Math.abs(a.confidence - avgConfidence) > 2 * stdDev)
    if (unusualConfidences.length > 0) {
      anomalies.push({
        id: `anomaly_conf_${Date.now()}`,
        type: "unusual_confidence",
        severity: unusualConfidences.length > 5 ? "high" : "medium",
        description: `${unusualConfidences.length} analyses with unusual confidence scores detected`,
        affectedAnalyses: unusualConfidences.length,
        timestamp: new Date(),
        recommendation: "Review these analyses manually for quality assurance",
      })
    }

    // Anomaly 2: Sudden spike in detection rate
    const trends = this.calculateTrends(analyses)
    if (trends.length > 1) {
      for (let i = 1; i < trends.length; i++) {
        const change = Math.abs(trends[i].detectionRate - trends[i - 1].detectionRate)
        if (change > 30) {
          anomalies.push({
            id: `anomaly_spike_${Date.now()}`,
            type: "pattern_spike",
            severity: change > 50 ? "critical" : "high",
            description: `${change.toFixed(1)}% change in detection rate detected`,
            affectedAnalyses: trends[i].syntheticCount + trends[i].realCount,
            timestamp: trends[i].date,
            recommendation: "Investigate potential dataset shift or model degradation",
          })
        }
      }
    }

    this.anomalies = anomalies
    return anomalies
  }

  /**
   * Generate comparative metrics for batch
   */
  generateComparativeMetrics(batchId: string, analyses: any[]): ComparativeMetrics {
    if (analyses.length === 0) {
      return {
        batchId,
        totalAnalyses: 0,
        syntheticPercentage: 0,
        realPercentage: 0,
        confidenceDistribution: [],
        averageProcessingTime: 0,
        detectionMethodBreakdown: { airia: 0, pytorch: 0, prnu: 0 },
      }
    }

    const syntheticCount = analyses.filter((a) => a.prediction === "synthetic").length
    const realCount = analyses.filter((a) => a.prediction === "real").length

    // Confidence distribution
    const confidenceDistribution = [
      { range: "0-20%", count: analyses.filter((a) => a.confidence <= 0.2).length },
      { range: "20-40%", count: analyses.filter((a) => a.confidence > 0.2 && a.confidence <= 0.4).length },
      { range: "40-60%", count: analyses.filter((a) => a.confidence > 0.4 && a.confidence <= 0.6).length },
      { range: "60-80%", count: analyses.filter((a) => a.confidence > 0.6 && a.confidence <= 0.8).length },
      { range: "80-100%", count: analyses.filter((a) => a.confidence > 0.8).length },
    ]

    // Detection method breakdown
    const airiaPredictions = analyses.filter((a) => a.airia_score > 0.5).length
    const pytorchPredictions = analyses.filter((a) => a.pytorch_score > 0.5).length
    const prnuPredictions = analyses.filter((a) => a.prnu_fingerprint).length

    return {
      batchId,
      totalAnalyses: analyses.length,
      syntheticPercentage: (syntheticCount / analyses.length) * 100,
      realPercentage: (realCount / analyses.length) * 100,
      confidenceDistribution,
      averageProcessingTime:
        analyses.reduce((sum, a) => sum + (a.processingTime || 0), 0) / analyses.length,
      detectionMethodBreakdown: {
        airia: (airiaPredictions / analyses.length) * 100,
        pytorch: (pytorchPredictions / analyses.length) * 100,
        prnu: (prnuPredictions / analyses.length) * 100,
      },
    }
  }

  /**
   * Get pattern statistics
   */
  getPatternStatistics() {
    return {
      totalPatterns: this.detectionPatterns.size,
      patterns: Array.from(this.detectionPatterns.values()),
      mostFrequentPattern: Array.from(this.detectionPatterns.values()).reduce(
        (a, b) => (a.frequency > b.frequency ? a : b),
        null
      ),
      averagePatternConfidence:
        Array.from(this.detectionPatterns.values()).reduce((sum, p) => sum + p.confidence, 0) /
        (this.detectionPatterns.size || 1),
    }
  }

  /**
   * Get anomaly statistics
   */
  getAnomalyStatistics() {
    return {
      totalAnomalies: this.anomalies.length,
      criticalAnomalies: this.anomalies.filter((a) => a.severity === "critical").length,
      highAnomalies: this.anomalies.filter((a) => a.severity === "high").length,
      recentAnomalies: this.anomalies.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5),
    }
  }

  /**
   * Export analytics report
   */
  exportAnalyticsReport(
    batchId: string,
    analyses: any[],
    patterns: DetectionPattern[],
    anomalies: AnomalyDetection[]
  ): string {
    const metrics = this.generateComparativeMetrics(batchId, analyses)

    return JSON.stringify(
      {
        reportId: `report_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        batchId,
        metrics,
        patterns: patterns.map((p) => ({
          ...p,
          lastDetected: p.lastDetected.toISOString(),
        })),
        anomalies: anomalies.map((a) => ({
          ...a,
          timestamp: a.timestamp.toISOString(),
        })),
        recommendations: this.generateRecommendations(metrics, patterns, anomalies),
      },
      null,
      2
    )
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    metrics: ComparativeMetrics,
    patterns: DetectionPattern[],
    anomalies: AnomalyDetection[]
  ): string[] {
    const recommendations: string[] = []

    if (metrics.syntheticPercentage > 70) {
      recommendations.push("High synthetic content detected. Consider additional manual verification.")
    }

    if (patterns.some((p) => p.confidence < 0.7)) {
      recommendations.push("Low confidence patterns detected. Review mixed detection results.")
    }

    if (anomalies.some((a) => a.severity === "critical")) {
      recommendations.push("Critical anomalies detected. Immediate investigation recommended.")
    }

    if (metrics.detectionMethodBreakdown.airia < 30) {
      recommendations.push("Low AIRIA detection rate. Check model performance.")
    }

    if (recommendations.length === 0) {
      recommendations.push("All metrics within normal parameters. Analysis quality is good.")
    }

    return recommendations
  }

  /**
   * Trend prediction (simple linear regression)
   */
  predictFutureTrend(
    trends: AnalysisTrend[],
    daysAhead: number = 7
  ): { date: Date; predictedSyntheticRate: number }[] {
    if (trends.length < 2) return []

    const predictions: { date: Date; predictedSyntheticRate: number }[] = []
    const rates = trends.map((t) => t.detectionRate)

    // Simple linear regression
    const n = rates.length
    const sumX = Array.from({ length: n }, (_, i) => i).reduce((a, b) => a + b, 0)
    const sumY = rates.reduce((a, b) => a + b, 0)
    const sumXY = Array.from({ length: n }, (_, i) => i * rates[i]).reduce((a, b) => a + b, 0)
    const sumX2 = Array.from({ length: n }, (_, i) => i * i).reduce((a, b) => a + b, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const lastDate = trends[trends.length - 1].date
    for (let i = 1; i <= daysAhead; i++) {
      const predictedDate = new Date(lastDate)
      predictedDate.setDate(predictedDate.getDate() + i)

      const predictedRate = Math.max(0, Math.min(100, intercept + slope * (n + i - 1)))

      predictions.push({
        date: predictedDate,
        predictedSyntheticRate: predictedRate,
      })
    }

    return predictions
  }
}

/**
 * Calculate detection quality metrics
 * Determines overall quality of detection results
 */
export function calculateDetectionQuality(
  analyzeData: { confidence: number; pattern: string; timestamp: Date }[]
): { overallScore: number; qualityLevel: "excellent" | "good" | "fair" | "poor" } {
  if (analyzeData.length === 0) {
    return { overallScore: 0, qualityLevel: "poor" }
  }

  const avgConfidence = analyzeData.reduce((sum, d) => sum + d.confidence, 0) / analyzeData.length
  const consistencyScore = analyzeData.length > 1 ? Math.min(1, analyzeData.length / 100) : 0.5

  const overallScore = avgConfidence * 0.7 + consistencyScore * 0.3

  let qualityLevel: "excellent" | "good" | "fair" | "poor"
  if (overallScore >= 0.85) qualityLevel = "excellent"
  else if (overallScore >= 0.7) qualityLevel = "good"
  else if (overallScore >= 0.5) qualityLevel = "fair"
  else qualityLevel = "poor"

  return { overallScore, qualityLevel }
}

