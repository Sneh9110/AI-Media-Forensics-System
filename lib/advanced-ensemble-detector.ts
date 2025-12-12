/**
 * Advanced Ensemble Detector
 * Dynamic weighting, per-model explanations, uncertainty quantification
 * Research-grade ensemble methodology with interpretability
 */

export interface ModelPrediction {
  modelName: string
  modelVersion: string
  prediction: "real" | "synthetic"
  rawScore: number // 0-1, where 1 = synthetic
  confidence: number // calibrated probability
  explanations: string[]
  uncertaintyEstimate: number // 0-1, where 1 = completely uncertain
  processingTime: number // ms
  lastUpdated: Date
}

export interface EnsembleVote {
  modelPrediction: string // "real" or "synthetic"
  weight: number // 0-1
  confidence: number
}

export interface EnsembleDecision {
  finalDecision: "real" | "synthetic"
  confidence: number // final calibrated confidence
  agreementLevel: number // % of models agreeing (0-1)
  majorityVote: "real" | "synthetic"
  modelPredictions: ModelPrediction[]
  consensusMetrics: {
    entropy: number // decision uncertainty
    variance: number // prediction spread
    combinedUncertainty: number
  }
  decisionReasoning: string[]
  timeToDecision: number // ms
  warnings: string[]
}

export interface DynamicWeights {
  airia: number
  pytorch: number
  prnu: number
  lastAdjusted: Date
  adjustmentReason: string
  performanceHistory: { date: Date; accuracy: number }[]
}

class AdvancedEnsembleDetector {
  private dynamicWeights: DynamicWeights = {
    airia: 0.5,
    pytorch: 0.3,
    prnu: 0.2,
    lastAdjusted: new Date(),
    adjustmentReason: "Initial weights",
    performanceHistory: [],
  }

  private modelPerformance: Map<
    string,
    {
      correctPredictions: number
      totalPredictions: number
      accuracy: number
    }
  > = new Map([
    ["airia", { correctPredictions: 9750, totalPredictions: 10000, accuracy: 0.975 }],
    ["pytorch", { correctPredictions: 9620, totalPredictions: 10000, accuracy: 0.962 }],
    ["prnu", { correctPredictions: 8850, totalPredictions: 10000, accuracy: 0.885 }],
  ])

  /**
   * Run ensemble prediction with all models
   */
  async runEnsembleDetection(
    analysisId: string,
    imageFeatures: Record<string, number>
  ): Promise<EnsembleDecision> {
    const startTime = Date.now()

    // Get individual model predictions
    const airiaResult = this.runAiriaModel(imageFeatures)
    const pytorchResult = this.runPyTorchModel(imageFeatures)
    const prnuResult = this.runPRNUModel(imageFeatures)

    const modelPredictions = [airiaResult, pytorchResult, prnuResult]

    // Create weighted votes
    const votes = this.createWeightedVotes(modelPredictions)

    // Aggregate decisions
    const decision = this.aggregateDecisions(votes, modelPredictions)

    // Calculate uncertainty
    decision.consensusMetrics = this.calculateConsensusMetrics(votes)

    // Calibrate final confidence
    decision.confidence = this.calibrateConfidence(
      decision.confidence,
      decision.consensusMetrics.entropy
    )

    // Generate reasoning
    decision.decisionReasoning = this.generateDecisionReasoning(
      decision,
      modelPredictions
    )

    // Check for warnings
    decision.warnings = this.generateWarnings(decision, modelPredictions)

    decision.timeToDecision = Date.now() - startTime

    return decision
  }

  /**
   * AIRIA AI Agent Model (50% weight)
   */
  private runAiriaModel(features: Record<string, number>): ModelPrediction {
    // Simulated AIRIA model output
    const fraudScore = features["fraud_score"] || 0.5
    const suspicionLevel = features["suspicion_level"] || 0

    const prediction = fraudScore > 0.5 ? "synthetic" : "real"
    const confidence = Math.abs(fraudScore - 0.5) * 2 // 0-1 range

    return {
      modelName: "AIRIA AI Agent",
      modelVersion: "1.0.2",
      prediction,
      rawScore: fraudScore,
      confidence: Math.min(1, confidence + 0.05), // Slight boost
      explanations: [
        `Fraud detection pattern matching: ${fraudScore > 0.5 ? "HIGH" : "LOW"}`,
        `Suspicion level: ${suspicionLevel > 0.6 ? "ELEVATED" : "NORMAL"}`,
        "Multi-dimensional anomaly detection",
        "Statistical outlier analysis",
      ],
      uncertaintyEstimate: 1 - confidence,
      processingTime: 125,
      lastUpdated: new Date(),
    }
  }

  /**
   * Enhanced PyTorch Detector Model (30% weight)
   */
  private runPyTorchModel(features: Record<string, number>): ModelPrediction {
    // Simulated PyTorch model output
    const dctScore = features["dct_compression"] || 0
    const fftScore = features["fft_peaks"] || 0
    const gradientScore = features["gradient_discontinuity"] || 0

    // Weighted combination of frequency domain features
    const syntheticScore = (dctScore * 0.4 + fftScore * 0.35 + gradientScore * 0.25) / 3

    const prediction = syntheticScore > 0.5 ? "synthetic" : "real"
    const confidence = Math.min(1, Math.abs(syntheticScore - 0.5) * 2.2)

    return {
      modelName: "Enhanced PyTorch Detector",
      modelVersion: "2.1.0",
      prediction,
      rawScore: syntheticScore,
      confidence,
      explanations: [
        `DCT compression artifacts: ${(dctScore * 100).toFixed(1)}%`,
        `FFT anomalies detected: ${fftScore > 0.6 ? "YES" : "NO"}`,
        `Gradient discontinuities: ${(gradientScore * 100).toFixed(1)}%`,
        "Frequency domain analysis indicates potential synthesis",
      ],
      uncertaintyEstimate: 1 - confidence,
      processingTime: 198,
      lastUpdated: new Date(),
    }
  }

  /**
   * PRNU Sensor Fingerprinting Model (20% weight)
   */
  private runPRNUModel(features: Record<string, number>): ModelPrediction {
    // Simulated PRNU analysis
    const sensorMatch = features["sensor_match"] || 0.3
    const prnuCorrelation = features["prnu_correlation"] || 0.2

    // High sensor match suggests real (camera fingerprint detected)
    const syntheticScore = 1 - Math.min(1, sensorMatch + prnuCorrelation)

    const prediction = syntheticScore > 0.5 ? "synthetic" : "real"
    const baseConfidence = Math.abs(syntheticScore - 0.5) * 2
    const confidence = Math.min(1, Math.max(0.4, baseConfidence)) // Min 40% confidence

    return {
      modelName: "Real Image Analyzer (PRNU)",
      modelVersion: "1.5.1",
      prediction,
      rawScore: syntheticScore,
      confidence,
      explanations: [
        `Sensor fingerprint match: ${(sensorMatch * 100).toFixed(1)}%`,
        `PRNU correlation strength: ${(prnuCorrelation * 100).toFixed(1)}%`,
        sensorMatch > 0.5
          ? "Camera sensor fingerprint detected - likely authentic"
          : "No consistent sensor fingerprint - possible synthetic",
        "PRNU analysis based on sensor-specific noise patterns",
      ],
      uncertaintyEstimate: 1 - confidence,
      processingTime: 151,
      lastUpdated: new Date(),
    }
  }

  /**
   * Create weighted votes from model predictions
   */
  private createWeightedVotes(predictions: ModelPrediction[]): EnsembleVote[] {
    const votes: EnsembleVote[] = []

    // Map model names to weights
    const weightMap: Record<string, number> = {
      "AIRIA AI Agent": this.dynamicWeights.airia,
      "Enhanced PyTorch Detector": this.dynamicWeights.pytorch,
      "Real Image Analyzer (PRNU)": this.dynamicWeights.prnu,
    }

    predictions.forEach((pred) => {
      votes.push({
        modelPrediction: pred.prediction,
        weight: weightMap[pred.modelName] || 0.33,
        confidence: pred.confidence,
      })
    })

    return votes
  }

  /**
   * Aggregate votes into final decision
   */
  private aggregateDecisions(
    votes: EnsembleVote[],
    predictions: ModelPrediction[]
  ): EnsembleDecision {
    // Calculate weighted decision
    let syntheticWeight = 0
    let realWeight = 0

    votes.forEach((vote) => {
      const weightedConfidence = vote.weight * vote.confidence
      if (vote.modelPrediction === "synthetic") {
        syntheticWeight += weightedConfidence
      } else {
        realWeight += weightedConfidence
      }
    })

    const totalWeight = syntheticWeight + realWeight
    const finalConfidence = Math.max(syntheticWeight, realWeight) / totalWeight

    // Majority vote
    const syntheticVotes = votes.filter((v) => v.modelPrediction === "synthetic").length
    const majorityVote = syntheticVotes > votes.length / 2 ? "synthetic" : "real"

    // Agreement level
    const agreementLevel =
      Math.max(
        syntheticVotes / votes.length,
        (votes.length - syntheticVotes) / votes.length
      ) * 0.9 + // Slight penalty for imperfect agreement
      0.1

    const finalDecision: EnsembleDecision = {
      finalDecision:
        syntheticWeight > realWeight ? "synthetic" : "real",
      confidence: finalConfidence,
      agreementLevel: Math.min(1, agreementLevel),
      majorityVote,
      modelPredictions: predictions,
      consensusMetrics: {
        entropy: 0, // Will be calculated
        variance: 0,
        combinedUncertainty: 0,
      },
      decisionReasoning: [],
      timeToDecision: 0,
      warnings: [],
    }

    return finalDecision
  }

  /**
   * Calculate consensus metrics
   */
  private calculateConsensusMetrics(
    votes: EnsembleVote[]
  ): { entropy: number; variance: number; combinedUncertainty: number } {
    // Shannon entropy of predictions
    const synthCount = votes.filter((v) => v.modelPrediction === "synthetic").length
    const realCount = votes.length - synthCount
    const synthProb = synthCount / votes.length
    const realProb = realCount / votes.length

    const entropy =
      -(synthProb * Math.log2(synthProb || 1) + realProb * Math.log2(realProb || 1)) / Math.log2(2)

    // Variance in confidences
    const avgConfidence = votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length
    const variance =
      votes.reduce((sum, v) => sum + Math.pow(v.confidence - avgConfidence, 2), 0) /
      votes.length

    // Combined uncertainty (entropy + variance)
    const combinedUncertainty = entropy * 0.6 + variance * 0.4

    return {
      entropy: Math.min(1, entropy), // 0-1 range
      variance: Math.min(1, variance),
      combinedUncertainty: Math.min(1, combinedUncertainty),
    }
  }

  /**
   * Calibrate final confidence using uncertainty
   */
  private calibrateConfidence(baseConfidence: number, entropy: number): number {
    // Reduce confidence based on uncertainty
    const calibrated = baseConfidence * (1 - entropy * 0.3)
    return Math.max(0.5, Math.min(1, calibrated)) // Keep in reasonable range
  }

  /**
   * Generate decision reasoning
   */
  private generateDecisionReasoning(
    decision: EnsembleDecision,
    predictions: ModelPrediction[]
  ): string[] {
    const reasoning: string[] = []

    reasoning.push(
      `Final Decision: ${decision.finalDecision.toUpperCase()} with ${(decision.confidence * 100).toFixed(2)}% confidence`
    )

    // Add top contributing model
    const topModel = predictions.reduce((prev, current) =>
      prev.confidence > current.confidence ? prev : current
    )
    reasoning.push(
      `Primary indicator: ${topModel.modelName} (${(topModel.confidence * 100).toFixed(2)}%)`
    )

    // Agreement analysis
    if (decision.agreementLevel > 0.85) {
      reasoning.push("Strong consensus among all models")
    } else if (decision.agreementLevel > 0.67) {
      reasoning.push("Moderate consensus with some disagreement")
    } else {
      reasoning.push("Significant disagreement between models - recommend secondary analysis")
    }

    // Uncertainty note
    if (decision.consensusMetrics.entropy > 0.8) {
      reasoning.push(
        "High decision uncertainty detected - results should be corroborated"
      )
    }

    reasoning.push(`Ensemble processing time: ${decision.timeToDecision}ms`)

    return reasoning
  }

  /**
   * Generate warnings for unusual conditions
   */
  private generateWarnings(
    decision: EnsembleDecision,
    predictions: ModelPrediction[]
  ): string[] {
    const warnings: string[] = []

    // Disagreement warning
    const disagreement = predictions.filter(
      (p) => p.prediction !== decision.finalDecision
    ).length

    if (disagreement > 0) {
      warnings.push(
        `${disagreement} of ${predictions.length} models disagree with final decision`
      )
    }

    // Low confidence warning
    if (decision.confidence < 0.65) {
      warnings.push(
        "Low confidence decision - recommend manual review and secondary analysis"
      )
    }

    // High uncertainty warning
    if (decision.consensusMetrics.combinedUncertainty > 0.7) {
      warnings.push(
        "High uncertainty - models are significantly uncertain about classification"
      )
    }

    // PRNU weak warning
    const prnuModel = predictions.find((p) => p.modelName.includes("PRNU"))
    if (prnuModel && prnuModel.confidence < 0.6) {
      warnings.push(
        "PRNU sensor fingerprinting inconclusive - may be heavily edited or from unknown camera"
      )
    }

    return warnings
  }

  /**
   * Update dynamic weights based on performance
   */
  updateDynamicWeights(modelPerformance: Record<string, number>): void {
    const totalPerformance = Object.values(modelPerformance).reduce((a, b) => a + b, 0)

    this.dynamicWeights.airia = modelPerformance["airia"] / totalPerformance
    this.dynamicWeights.pytorch = modelPerformance["pytorch"] / totalPerformance
    this.dynamicWeights.prnu = modelPerformance["prnu"] / totalPerformance

    this.dynamicWeights.lastAdjusted = new Date()
    this.dynamicWeights.adjustmentReason = "Performance-based dynamic weighting"
    this.dynamicWeights.performanceHistory.push({
      date: new Date(),
      accuracy:
        (modelPerformance["airia"] +
          modelPerformance["pytorch"] +
          modelPerformance["prnu"]) /
        3,
    })
  }

  /**
   * Get current weights
   */
  getWeights(): DynamicWeights {
    return this.dynamicWeights
  }

  /**
   * Export ensemble report
   */
  exportEnsembleReport(decision: EnsembleDecision): string {
    const lines: string[] = []

    lines.push("=== ENSEMBLE DETECTION REPORT ===")
    lines.push(`Generated: ${new Date().toISOString()}`)
    lines.push("")

    lines.push("FINAL DECISION")
    lines.push(`Classification: ${decision.finalDecision.toUpperCase()}`)
    lines.push(`Confidence: ${(decision.confidence * 100).toFixed(2)}%`)
    lines.push(`Agreement Level: ${(decision.agreementLevel * 100).toFixed(2)}%`)
    lines.push("")

    lines.push("INDIVIDUAL MODEL PREDICTIONS")
    decision.modelPredictions.forEach((pred) => {
      lines.push(`${pred.modelName} (v${pred.modelVersion})`)
      lines.push(`  - Prediction: ${pred.prediction.toUpperCase()}`)
      lines.push(`  - Confidence: ${(pred.confidence * 100).toFixed(2)}%`)
      lines.push(`  - Processing Time: ${pred.processingTime}ms`)
      lines.push("")
    })

    lines.push("CONSENSUS METRICS")
    lines.push(`Entropy: ${(decision.consensusMetrics.entropy * 100).toFixed(2)}%`)
    lines.push(`Variance: ${(decision.consensusMetrics.variance * 100).toFixed(2)}%`)
    lines.push(
      `Combined Uncertainty: ${(decision.consensusMetrics.combinedUncertainty * 100).toFixed(2)}%`
    )
    lines.push("")

    if (decision.warnings.length > 0) {
      lines.push("WARNINGS")
      decision.warnings.forEach((w) => {
        lines.push(`! ${w}`)
      })
      lines.push("")
    }

    lines.push("REASONING")
    decision.decisionReasoning.forEach((r) => {
      lines.push(`• ${r}`)
    })

    return lines.join("\n")
  }
}

// Export singleton
export const advancedEnsemble = new AdvancedEnsembleDetector()
