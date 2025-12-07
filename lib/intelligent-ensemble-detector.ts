/**
 * Intelligent Ensemble AI Detection System
 * Combines multiple detection methods with sophisticated confidence weighting
 * Designed to eliminate false positives and improve accuracy for AI-generated content
 */

import { advancedAiriaDetection } from './advanced-airia-detection'
import { enhancedAIDetectorService } from './enhanced-ai-detector-service-fixed'
import { RealImageAnalyzer } from './real-image-analyzer'

export interface EnsembleDetectionRequest {
  fileBuffer: ArrayBuffer
  fileName: string
  metadata?: {
    mimeType?: string
    fileSize?: number
    dimensions?: { width: number; height: number }
  }
  options?: {
    useAdvancedAiria?: boolean
    useEnhancedPyTorch?: boolean
    useRealImageAnalyzer?: boolean
    confidenceThreshold?: number
    ensembleMode?: 'weighted' | 'majority' | 'conservative' | 'aggressive'
  }
}

export interface EnsembleDetectionResponse {
  prediction: 'real' | 'synthetic' | 'uncertain'
  confidence: number
  ensembleScore: number
  individualResults: {
    airia?: any
    pytorch?: any
    realAnalyzer?: any
  }
  weightedScores: {
    finalAIGenerationScore: number
    finalAuthenticityScore: number
    consensusStrength: number
    conflictIndicator: number
  }
  explanation: string
  recommendedAction: string
  processingTime: number
  heatmapData?: string
  technicalDetails: any
}

class IntelligentEnsembleDetector {
  private readonly AIRIA_WEIGHT = 0.5      // Your exported agent gets highest weight
  private readonly PYTORCH_WEIGHT = 0.3    // Enhanced PyTorch detector
  private readonly REAL_ANALYZER_WEIGHT = 0.2  // Real image analyzer

  async detectWithEnsemble(request: EnsembleDetectionRequest): Promise<EnsembleDetectionResponse> {
    const startTime = Date.now()
    const options = request.options || {}
    
    console.log('[Ensemble] Starting intelligent multi-model AI detection')
    
    const results: any = {
      airia: null,
      pytorch: null,
      realAnalyzer: null
    }
    
    const errors: string[] = []

    // Run all available detectors in parallel for speed
    const detectionPromises: Promise<void>[] = []

    // 1. Advanced Airia Detection (Primary - your exported agent)
    if (options.useAdvancedAiria !== false) {
      detectionPromises.push(
        this.runAiriaDetection(request, results, errors)
      )
    }

    // 2. Enhanced PyTorch Detection (Secondary)
    if (options.useEnhancedPyTorch !== false) {
      detectionPromises.push(
        this.runPyTorchDetection(request, results, errors)
      )
    }

    // 3. Real Image Analyzer (Tertiary)
    if (options.useRealImageAnalyzer !== false) {
      detectionPromises.push(
        this.runRealImageDetection(request, results, errors)
      )
    }

    // Wait for all detections to complete
    await Promise.allSettled(detectionPromises)

    // Analyze ensemble results
    const ensembleResult = this.analyzeEnsembleResults(
      results, 
      options.ensembleMode || 'weighted',
      options.confidenceThreshold || 0.7
    )

    const finalResult: EnsembleDetectionResponse = {
      ...ensembleResult,
      individualResults: results,
      processingTime: Date.now() - startTime,
      technicalDetails: {
        detectorsUsed: Object.keys(results).filter(k => results[k] !== null),
        errors: errors,
        ensembleMode: options.ensembleMode || 'weighted',
        weights: {
          airia: this.AIRIA_WEIGHT,
          pytorch: this.PYTORCH_WEIGHT,
          realAnalyzer: this.REAL_ANALYZER_WEIGHT
        }
      }
    }

    console.log('[Ensemble] Detection completed:', {
      prediction: finalResult.prediction,
      confidence: finalResult.confidence,
      ensembleScore: finalResult.ensembleScore,
      detectorsUsed: finalResult.technicalDetails.detectorsUsed.length
    })

    return finalResult
  }

  private async runAiriaDetection(request: EnsembleDetectionRequest, results: any, errors: string[]): Promise<void> {
    try {
      console.log('[Ensemble] Running Airia agent detection')
      
      const airiaResult = await advancedAiriaDetection.detectAIContent({
        fileBuffer: request.fileBuffer,
        fileName: request.fileName,
        metadata: request.metadata,
        analysisConfig: {
          enableDeepAnalysis: true,
          confidenceThreshold: 0.1, // Low threshold to get all info
          includeForensicMetadata: true,
          generateHeatmap: true
        }
      })

      results.airia = {
        prediction: airiaResult.prediction,
        confidence: airiaResult.confidence,
        aiGenerationScore: airiaResult.detectionScores.aiGenerationProbability,
        authenticityScore: airiaResult.detectionScores.authenticityScore,
        manipulationScore: airiaResult.detectionScores.manipulationProbability,
        explanation: airiaResult.explanation,
        heatmapData: airiaResult.heatmapData,
        processingTime: airiaResult.processingTime,
        forensicIndicators: airiaResult.forensicAnalysis.generationIndicators,
        weight: this.AIRIA_WEIGHT
      }

      console.log('[Ensemble] Airia detection completed:', results.airia.prediction, results.airia.confidence)

    } catch (error) {
      console.warn('[Ensemble] Airia detection failed:', error)
      errors.push(`Airia detection failed: ${error}`)
    }
  }

  private async runPyTorchDetection(request: EnsembleDetectionRequest, results: any, errors: string[]): Promise<void> {
    try {
      console.log('[Ensemble] Running PyTorch detection')
      
      const buffer = Buffer.from(request.fileBuffer)
      const pytorchResult = await enhancedAIDetectorService.analyzeImageEnhanced(buffer, {
        uncertainty_threshold: 0.1, // Low threshold for ensemble
        generate_gradcam: true,
        backbone: 'resnet18',
        save_prediction: true
      })

      results.pytorch = {
        prediction: pytorchResult.prediction,
        confidence: pytorchResult.confidence,
        aiGenerationScore: pytorchResult.synthetic_probability,
        authenticityScore: pytorchResult.real_probability,
        manipulationScore: pytorchResult.synthetic_probability * 0.8,
        explanation: `Enhanced PyTorch analysis: ${pytorchResult.prediction} (${(pytorchResult.confidence * 100).toFixed(1)}%)`,
        heatmapData: pytorchResult.gradcam?.heatmap_data,
        processingTime: pytorchResult.processing_time,
        isUncertain: pytorchResult.is_uncertain,
        weight: this.PYTORCH_WEIGHT
      }

      console.log('[Ensemble] PyTorch detection completed:', results.pytorch.prediction, results.pytorch.confidence)

    } catch (error) {
      console.warn('[Ensemble] PyTorch detection failed:', error)
      errors.push(`PyTorch detection failed: ${error}`)
    }
  }

  private async runRealImageDetection(request: EnsembleDetectionRequest, results: any, errors: string[]): Promise<void> {
    try {
      console.log('[Ensemble] Running Real Image analysis')
      
      if (!request.metadata?.mimeType?.startsWith('image/')) {
        console.log('[Ensemble] Skipping Real Image analyzer for non-image file')
        return
      }

      const realResult = await RealImageAnalyzer.analyzeRealImage(request.fileBuffer, {
        fileSize: request.metadata?.fileSize || 0,
        mimeType: request.metadata?.mimeType || ''
      })

      results.realAnalyzer = {
        prediction: realResult.isAIGenerated ? 'synthetic' : 'real',
        confidence: realResult.confidence,
        aiGenerationScore: realResult.isAIGenerated ? 0.8 : 0.2,
        authenticityScore: realResult.isAIGenerated ? 0.2 : 0.8,
        manipulationScore: realResult.analysis?.frequencyAnomalies || 0.3,
        explanation: `Real Image analysis: ${realResult.isAIGenerated ? 'AI-generated' : 'Authentic'} (${(realResult.confidence * 100).toFixed(1)}%)`,
        heatmapData: realResult.heatmapData,
        processingTime: 100, // Estimate
        weight: this.REAL_ANALYZER_WEIGHT
      }

      console.log('[Ensemble] Real Image analysis completed:', results.realAnalyzer.prediction, results.realAnalyzer.confidence)

    } catch (error) {
      console.warn('[Ensemble] Real Image analysis failed:', error)
      errors.push(`Real Image analysis failed: ${error}`)
    }
  }

  private analyzeEnsembleResults(
    results: any, 
    mode: string, 
    confidenceThreshold: number
  ): Omit<EnsembleDetectionResponse, 'individualResults' | 'processingTime' | 'technicalDetails'> {
    
    const validResults = Object.values(results).filter(r => r !== null) as any[]
    
    if (validResults.length === 0) {
      return this.createFailsafeResponse()
    }

    console.log('[Ensemble] Analyzing results from', validResults.length, 'detectors')

    // Calculate weighted scores
    const weightedScores = this.calculateWeightedScores(validResults)
    
    // Determine final prediction based on ensemble mode
    const finalPrediction = this.determineFinalPrediction(validResults, weightedScores, mode)
    
    // Calculate ensemble confidence
    const ensembleConfidence = this.calculateEnsembleConfidence(validResults, weightedScores)
    
    // Generate explanation and recommendation
    const explanation = this.generateEnsembleExplanation(validResults, weightedScores, finalPrediction)
    const recommendation = this.generateRecommendation(finalPrediction, ensembleConfidence, weightedScores)
    
    // Select best heatmap
    const heatmapData = this.selectBestHeatmap(validResults)

    return {
      prediction: finalPrediction,
      confidence: ensembleConfidence,
      ensembleScore: weightedScores.finalAIGenerationScore,
      weightedScores: {
        finalAIGenerationScore: weightedScores.finalAIGenerationScore,
        finalAuthenticityScore: weightedScores.finalAuthenticityScore,
        consensusStrength: weightedScores.consensusStrength,
        conflictIndicator: weightedScores.conflictIndicator
      },
      explanation,
      recommendedAction: recommendation,
      heatmapData
    }
  }

  private calculateWeightedScores(results: any[]): any {
    let totalWeight = 0
    let weightedAIScore = 0
    let weightedAuthScore = 0
    let consensusCount = 0
    let conflictCount = 0

    // Calculate weighted averages
    results.forEach(result => {
      const weight = result.weight || 0.33
      totalWeight += weight
      weightedAIScore += (result.aiGenerationScore || 0) * weight
      weightedAuthScore += (result.authenticityScore || 0) * weight
    })

    const finalAIScore = totalWeight > 0 ? weightedAIScore / totalWeight : 0.5
    const finalAuthScore = totalWeight > 0 ? weightedAuthScore / totalWeight : 0.5

    // Calculate consensus strength
    const syntheticCount = results.filter(r => r.prediction === 'synthetic').length
    const realCount = results.filter(r => r.prediction === 'real').length
    const uncertainCount = results.filter(r => r.prediction === 'uncertain').length

    const maxCount = Math.max(syntheticCount, realCount, uncertainCount)
    const consensusStrength = maxCount / results.length

    // Calculate conflict indicator
    const scoreVariance = this.calculateScoreVariance(results)
    const conflictIndicator = scoreVariance > 0.3 ? 1 : scoreVariance / 0.3

    return {
      finalAIGenerationScore: finalAIScore,
      finalAuthenticityScore: finalAuthScore,
      consensusStrength,
      conflictIndicator,
      syntheticCount,
      realCount,
      uncertainCount
    }
  }

  private calculateScoreVariance(results: any[]): number {
    if (results.length < 2) return 0

    const scores = results.map(r => r.aiGenerationScore || 0)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length
    
    return Math.sqrt(variance)
  }

  private determineFinalPrediction(results: any[], weightedScores: any, mode: string): 'real' | 'synthetic' | 'uncertain' {
    const { finalAIGenerationScore, consensusStrength, syntheticCount, realCount } = weightedScores

    switch (mode) {
      case 'conservative':
        // Conservative: Err on the side of synthetic detection
        return finalAIGenerationScore > 0.3 ? 'synthetic' : 
               finalAIGenerationScore < 0.2 ? 'real' : 'uncertain'

      case 'aggressive':
        // Aggressive: Higher threshold for synthetic detection
        return finalAIGenerationScore > 0.7 ? 'synthetic' : 
               finalAIGenerationScore < 0.4 ? 'real' : 'uncertain'

      case 'majority':
        // Majority vote
        if (syntheticCount > realCount) return 'synthetic'
        if (realCount > syntheticCount) return 'real'
        return 'uncertain'

      default: // 'weighted'
        // Weighted decision with Airia agent preference
        const airiaResult = results.find(r => r.weight === this.AIRIA_WEIGHT)
        
        if (airiaResult && airiaResult.confidence > 0.7) {
          // Trust high-confidence Airia prediction
          return airiaResult.prediction
        }

        // Fall back to weighted score
        if (finalAIGenerationScore > 0.6) return 'synthetic'
        if (finalAIGenerationScore < 0.3) return 'real'
        return 'uncertain'
    }
  }

  private calculateEnsembleConfidence(results: any[], weightedScores: any): number {
    const { consensusStrength, conflictIndicator, finalAIGenerationScore } = weightedScores

    // Base confidence from the strength of the prediction
    const scoreConfidence = Math.abs(finalAIGenerationScore - 0.5) * 2

    // Consensus bonus
    const consensusBonus = consensusStrength * 0.3

    // Conflict penalty
    const conflictPenalty = conflictIndicator * 0.2

    // Airia agent bonus (trust your exported agent more)
    const airiaResult = results.find(r => r.weight === this.AIRIA_WEIGHT)
    const airiaBonus = airiaResult && airiaResult.confidence > 0.7 ? 0.1 : 0

    const finalConfidence = scoreConfidence + consensusBonus - conflictPenalty + airiaBonus

    return Math.max(0.1, Math.min(0.95, finalConfidence))
  }

  private generateEnsembleExplanation(results: any[], weightedScores: any, prediction: string): string {
    const { consensusStrength, conflictIndicator, finalAIGenerationScore } = weightedScores
    const detectorsUsed = results.length

    let explanation = `Ensemble analysis using ${detectorsUsed} detection method(s). `

    if (prediction === 'synthetic') {
      explanation += `Strong evidence of AI generation detected (score: ${(finalAIGenerationScore * 100).toFixed(1)}%). `
    } else if (prediction === 'real') {
      explanation += `Analysis indicates authentic content (authenticity score: ${(weightedScores.finalAuthenticityScore * 100).toFixed(1)}%). `
    } else {
      explanation += `Mixed indicators present - uncertain classification. `
    }

    if (consensusStrength > 0.8) {
      explanation += `High consensus among detectors (${(consensusStrength * 100).toFixed(0)}% agreement). `
    } else if (conflictIndicator > 0.5) {
      explanation += `Some disagreement between detection methods - additional analysis may be needed. `
    }

    // Add Airia agent insights if available
    const airiaResult = results.find(r => r.weight === this.AIRIA_WEIGHT)
    if (airiaResult) {
      explanation += `Primary forensic analysis (Airia): ${airiaResult.explanation?.substring(0, 100)}...`
    }

    return explanation
  }

  private generateRecommendation(prediction: string, confidence: number, weightedScores: any): string {
    if (prediction === 'synthetic' && confidence > 0.8) {
      return 'HIGH CONFIDENCE: Content appears to be AI-generated. Recommend flagging as synthetic.'
    } else if (prediction === 'synthetic' && confidence > 0.6) {
      return 'MODERATE CONFIDENCE: Likely AI-generated content. Consider additional verification.'
    } else if (prediction === 'real' && confidence > 0.8) {
      return 'HIGH CONFIDENCE: Content appears authentic. Safe to classify as real.'
    } else if (prediction === 'uncertain' || confidence < 0.6) {
      return 'UNCERTAIN: Mixed signals detected. Recommend human review or additional analysis methods.'
    } else {
      return 'MODERATE CONFIDENCE: Classification provided but additional verification recommended.'
    }
  }

  private selectBestHeatmap(results: any[]): string | undefined {
    // Prioritize Airia agent heatmap, then PyTorch, then Real Analyzer
    const priorities = [this.AIRIA_WEIGHT, this.PYTORCH_WEIGHT, this.REAL_ANALYZER_WEIGHT]
    
    for (const weight of priorities) {
      const result = results.find(r => r.weight === weight && r.heatmapData)
      if (result?.heatmapData) {
        return result.heatmapData
      }
    }
    
    return undefined
  }

  private createFailsafeResponse(): Omit<EnsembleDetectionResponse, 'individualResults' | 'processingTime' | 'technicalDetails'> {
    return {
      prediction: 'synthetic',
      confidence: 0.7,
      ensembleScore: 0.75,
      weightedScores: {
        finalAIGenerationScore: 0.75,
        finalAuthenticityScore: 0.25,
        consensusStrength: 1.0,
        conflictIndicator: 0.0
      },
      explanation: 'All detection methods failed. Applying conservative synthetic classification for safety.',
      recommendedAction: 'FAILSAFE: All detectors failed. Recommend manual inspection and re-analysis.',
      heatmapData: undefined
    }
  }
}

export const intelligentEnsembleDetector = new IntelligentEnsembleDetector()