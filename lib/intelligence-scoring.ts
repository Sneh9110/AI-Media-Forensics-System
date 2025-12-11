/**
 * Intelligence Scoring Service
 * Threat assessment and risk scoring algorithms
 */

export interface ThreatIntelligence {
  score: number // 0-100
  level: "safe" | "low_risk" | "medium_risk" | "high_risk" | "critical_risk"
  factors: ThreatFactor[]
  recommendations: string[]
  lastUpdated: Date
}

export interface ThreatFactor {
  name: string
  weight: number // 0-1
  confidence: number // 0-1
  impact: "low" | "medium" | "high"
  details: string
}

export interface RiskAssessment {
  analysisId: string
  overallRisk: number // 0-100
  confidenceInDetection: number // 0-1
  likelyManipulations: string[]
  similarCases: string[]
  trustScore: number // 0-100
}

export interface ThreatTrend {
  period: string
  averageThreatLevel: number
  criticalIncidents: number
  trend: "improving" | "stable" | "declining"
  recommendations: string[]
}

class IntelligenceScoringService {
  private threatCache: Map<string, ThreatIntelligence> = new Map()
  private riskAssessmentCache: Map<string, RiskAssessment> = new Map()
  private threatHistory: ThreatIntelligence[] = []

  /**
   * Calculate threat intelligence score for analysis
   */
  calculateThreatIntelligence(analysis: any): ThreatIntelligence {
    const factors: ThreatFactor[] = []
    let baseScore = 0

    // Factor 1: Detection confidence
    if (analysis.prediction === "synthetic") {
      const confidenceFactor: ThreatFactor = {
        name: "Detection Confidence",
        weight: 0.4,
        confidence: analysis.confidence,
        impact: analysis.confidence > 0.8 ? "high" : analysis.confidence > 0.6 ? "medium" : "low",
        details: `${(analysis.confidence * 100).toFixed(1)}% confidence in synthetic detection`,
      }
      factors.push(confidenceFactor)
      baseScore += confidenceFactor.weight * analysis.confidence * 100
    }

    // Factor 2: PRNU signature presence
    if (analysis.prnu_fingerprint === false && analysis.prediction === "synthetic") {
      const prnuFactor: ThreatFactor = {
        name: "Missing PRNU Signature",
        weight: 0.25,
        confidence: 0.85,
        impact: "high",
        details: "No camera fingerprint detected - indicates potential AI generation",
      }
      factors.push(prnuFactor)
      baseScore += prnuFactor.weight * prnuFactor.confidence * 100
    }

    // Factor 3: Frequency domain anomalies
    const frequencyAnomalies = analysis.frequency_anomalies?.length || 0
    if (frequencyAnomalies > 0) {
      const freqFactor: ThreatFactor = {
        name: "Frequency Domain Anomalies",
        weight: 0.2,
        confidence: Math.min(1, frequencyAnomalies / 3),
        impact: frequencyAnomalies > 2 ? "high" : "medium",
        details: `${frequencyAnomalies} frequency domain anomalies detected`,
      }
      factors.push(freqFactor)
      baseScore += freqFactor.weight * freqFactor.confidence * 100
    }

    // Factor 4: Method consensus
    const methodScores = [analysis.airia_score, analysis.pytorch_score, analysis.real_image_score]
    const syntheticVotes = methodScores.filter((s) => s > 0.5).length
    const consensusLevel = syntheticVotes / methodScores.length

    if (syntheticVotes >= 2) {
      const consensusFactor: ThreatFactor = {
        name: "Multi-Method Consensus",
        weight: 0.15,
        confidence: consensusLevel,
        impact: consensusLevel > 0.66 ? "high" : "medium",
        details: `${syntheticVotes}/3 detection methods agree on synthetic prediction`,
      }
      factors.push(consensusFactor)
      baseScore += consensusFactor.weight * consensusLevel * 100
    }

    // Determine threat level
    let level: "safe" | "low_risk" | "medium_risk" | "high_risk" | "critical_risk" = "safe"
    if (baseScore >= 80) level = "critical_risk"
    else if (baseScore >= 65) level = "high_risk"
    else if (baseScore >= 50) level = "medium_risk"
    else if (baseScore >= 30) level = "low_risk"
    else level = "safe"

    const intelligence: ThreatIntelligence = {
      score: Math.round(baseScore),
      level,
      factors: factors.sort((a, b) => b.weight - a.weight),
      recommendations: this.generateThreatRecommendations(level, factors),
      lastUpdated: new Date(),
    }

    this.threatHistory.push(intelligence)
    return intelligence
  }

  /**
   * Perform risk assessment on analysis
   */
  performRiskAssessment(analysisId: string, analysis: any): RiskAssessment {
    const threat = this.calculateThreatIntelligence(analysis)
    const confidenceInDetection = analysis.confidence

    const likelyManipulations: string[] = []
    if (analysis.frequency_anomalies?.includes("DCT_peaks")) {
      likelyManipulations.push("JPEG Compression Artifacts")
    }
    if (analysis.frequency_anomalies?.includes("FFT_irregularities")) {
      likelyManipulations.push("Irregular Frequency Patterns")
    }
    if (!analysis.prnu_fingerprint && analysis.prediction === "synthetic") {
      likelyManipulations.push("AI-Generated (No Camera Signature)")
    }

    if (likelyManipulations.length === 0 && analysis.prediction === "synthetic") {
      likelyManipulations.push("Unknown Manipulation Method")
    }

    const overallRisk = threat.score
    const trustScore = 100 - overallRisk

    const assessment: RiskAssessment = {
      analysisId,
      overallRisk,
      confidenceInDetection,
      likelyManipulations,
      similarCases: this.findSimilarCases(analysis),
      trustScore,
    }

    this.riskAssessmentCache.set(analysisId, assessment)
    return assessment
  }

  /**
   * Generate threat-based recommendations
   */
  private generateThreatRecommendations(
    level: string,
    factors: ThreatFactor[]
  ): string[] {
    const recommendations: string[] = []

    switch (level) {
      case "critical_risk":
        recommendations.push("⚠️ CRITICAL: This content is highly likely to be AI-generated")
        recommendations.push("Recommend immediate removal or additional human review")
        recommendations.push("Consider reporting to platform moderation team")
        break
      case "high_risk":
        recommendations.push("⚠️ HIGH RISK: Multiple indicators suggest AI generation")
        recommendations.push("Recommend human review before publishing")
        recommendations.push("Consider additional forensic analysis")
        break
      case "medium_risk":
        recommendations.push("⚠️ MEDIUM RISK: Some indicators of manipulation detected")
        recommendations.push("Further investigation recommended")
        recommendations.push("Not conclusive - additional context needed")
        break
      case "low_risk":
        recommendations.push("✓ LOW RISK: Minimal indicators of manipulation")
        recommendations.push("Content appears largely authentic")
        break
      case "safe":
        recommendations.push("✓ SAFE: No significant indicators of manipulation detected")
        recommendations.push("Content appears authentic")
        break
    }

    // Add factor-specific recommendations
    const highImpactFactors = factors.filter((f) => f.impact === "high")
    if (highImpactFactors.length > 0) {
      recommendations.push(`Review these high-impact factors: ${highImpactFactors.map((f) => f.name).join(", ")}`)
    }

    return recommendations
  }

  /**
   * Find similar cases in history
   */
  private findSimilarCases(analysis: any, limit: number = 3): string[] {
    // In production, would search actual database
    return [`analysis_${Math.random().toString(36).substr(2, 9)}` for i in range(Math.min(limit, 2))]
  }

  /**
   * Calculate threat trend
   */
  calculateThreatTrend(threatHistory: ThreatIntelligence[]): ThreatTrend {
    if (threatHistory.length === 0) {
      return {
        period: "No Data",
        averageThreatLevel: 0,
        criticalIncidents: 0,
        trend: "stable",
        recommendations: ["No threat data available yet"],
      }
    }

    const scores = threatHistory.map((t) => t.score)
    const averageThreatLevel = scores.reduce((a, b) => a + b, 0) / scores.length
    const criticalIncidents = threatHistory.filter((t) => t.level === "critical_risk").length

    // Determine trend
    const recentAvg = scores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, scores.length)
    const olderAvg = scores.slice(0, -5).reduce((a, b) => a + b, 0) / Math.max(1, scores.length - 5)

    let trend: "improving" | "stable" | "declining" = "stable"
    if (recentAvg < olderAvg - 10) trend = "improving"
    else if (recentAvg > olderAvg + 10) trend = "declining"

    return {
      period: "Last 30 Days",
      averageThreatLevel: Math.round(averageThreatLevel),
      criticalIncidents,
      trend,
      recommendations: this.generateTrendRecommendations(trend, averageThreatLevel, criticalIncidents),
    }
  }

  /**
   * Generate trend-based recommendations
   */
  private generateTrendRecommendations(
    trend: string,
    averageLevel: number,
    criticalCount: number
  ): string[] {
    const recommendations: string[] = []

    if (trend === "declining") {
      recommendations.push("⚠️ Threat level is increasing. Enhanced moderation recommended.")
      recommendations.push("Consider auditing recent uploads for policy violations.")
    } else if (trend === "improving") {
      recommendations.push("✓ Threat level is decreasing. Current policies appear effective.")
      recommendations.push("Continue monitoring with current safety measures.")
    } else {
      recommendations.push("Threat levels are stable. Maintain current security posture.")
    }

    if (averageLevel > 60) {
      recommendations.push("High average threat detected. Consider stricter content filtering.")
    }

    if (criticalCount > 5) {
      recommendations.push(`${criticalCount} critical incidents detected. Immediate investigation needed.`)
    }

    return recommendations
  }

  /**
   * Get threat statistics
   */
  getThreatStatistics() {
    return {
      totalAnalyzed: this.threatHistory.length,
      criticalThreats: this.threatHistory.filter((t) => t.level === "critical_risk").length,
      highRiskThreats: this.threatHistory.filter((t) => t.level === "high_risk").length,
      averageThreatScore:
        this.threatHistory.reduce((sum, t) => sum + t.score, 0) / (this.threatHistory.length || 1),
      threatDistribution: {
        safe: this.threatHistory.filter((t) => t.level === "safe").length,
        lowRisk: this.threatHistory.filter((t) => t.level === "low_risk").length,
        mediumRisk: this.threatHistory.filter((t) => t.level === "medium_risk").length,
        highRisk: this.threatHistory.filter((t) => t.level === "high_risk").length,
        criticalRisk: this.threatHistory.filter((t) => t.level === "critical_risk").length,
      },
    }
  }

  /**
   * Export threat report
   */
  exportThreatReport(assessments: RiskAssessment[]): string {
    return JSON.stringify(
      {
        reportId: `threat_report_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        totalAssessments: assessments.length,
        criticalCases: assessments.filter((a) => a.overallRisk > 80).length,
        assessments: assessments.slice(0, 50),
        threatStatistics: this.getThreatStatistics(),
      },
      null,
      2
    )
  }
}

// Export singleton instance
export const intelligenceScoringService = new IntelligenceScoringService()
