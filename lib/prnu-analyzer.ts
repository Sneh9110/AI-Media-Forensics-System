/**
 * PRNU (Photo-Response Non-Uniformity) Analysis for Camera Sensor Fingerprinting
 * Implements advanced sensor-based forensic detection using noise residual correlation
 */

export interface PRNUFingerprint {
  sensorPattern: Float32Array
  noiseVariance: number
  correlationMap: Float32Array
  sensorId: string
  patternStrength: number
  spatialConsistency: number
  frequencySignature: Float32Array
}

export interface PRNUAnalysisResult {
  sensorDetected: boolean
  sensorMatch: string | null
  correlationScore: number
  prnu: PRNUFingerprint
  anomalies: PRNUAnomaly[]
  authenticity: {
    score: number
    confidence: number
    evidence: string[]
  }
  ganDetection: {
    prnuDisruption: number
    patternInconsistency: number
    noiseArtifacts: number
  }
}

export interface PRNUAnomaly {
  type: 'correlation_drop' | 'pattern_disruption' | 'noise_inconsistency' | 'spatial_anomaly'
  location: { x: number; y: number; width: number; height: number }
  severity: number
  description: string
  confidence: number
}

export interface SensorReference {
  sensorId: string
  manufacturer: string
  model: string
  prnuPattern: Float32Array
  noiseCharacteristics: {
    variance: number
    distribution: string
    spatialFrequency: number[]
  }
  metadata: {
    samples: number
    quality: number
    lastUpdated: Date
  }
}

export class PRNUAnalyzer {
  private sensorDatabase: Map<string, SensorReference> = new Map()
  private analysisCache: Map<string, PRNUAnalysisResult> = new Map()
  private blockSize: number = 64
  private overlapSize: number = 32
  private correlationThreshold: number = 0.15

  constructor() {
    this.initializeSensorDatabase()
    this.loadKnownCameraFingerprints()
    console.log(`[PRNUAnalyzer] Initialized with ${this.sensorDatabase.size} sensor references`)
  }

  /**
   * Main PRNU analysis method
   */
  async analyzePRNU(
    imageData: ArrayBuffer,
    dimensions: { width: number; height: number },
    metadata?: any
  ): Promise<PRNUAnalysisResult> {
    console.log(`[PRNU] Starting sensor fingerprint analysis for ${dimensions.width}x${dimensions.height} image`)
    
    const startTime = Date.now()
    
    // Extract PRNU fingerprint from image
    const prnu = await this.extractPRNUFingerprint(imageData, dimensions)
    
    // Compare with reference sensors
    const sensorMatch = await this.findSensorMatch(prnu)
    
    // Detect GAN/diffusion artifacts in PRNU
    const ganDetection = this.detectGANArtifactsInPRNU(prnu)
    
    // Analyze spatial consistency
    const anomalies = this.detectPRNUAnomalies(prnu, dimensions)
    
    // Calculate authenticity score
    const authenticity = this.calculateAuthenticityScore(prnu, sensorMatch, ganDetection, anomalies)
    
    const processingTime = Date.now() - startTime
    
    const result: PRNUAnalysisResult = {
      sensorDetected: sensorMatch.score > this.correlationThreshold,
      sensorMatch: sensorMatch.sensorId,
      correlationScore: sensorMatch.score,
      prnu,
      anomalies,
      authenticity,
      ganDetection
    }
    
    console.log(`[PRNU] Analysis completed in ${processingTime}ms - Sensor: ${result.sensorDetected ? 'Detected' : 'Unknown'}, Score: ${result.correlationScore.toFixed(3)}`)
    
    return result
  }

  /**
   * Extract PRNU fingerprint using advanced noise residual analysis
   */
  private async extractPRNUFingerprint(
    imageData: ArrayBuffer,
    dimensions: { width: number; height: number }
  ): Promise<PRNUFingerprint> {
    console.log(`[PRNU] Extracting sensor fingerprint using noise residual analysis`)
    
    const { width, height } = dimensions
    const imageArray = new Uint8Array(imageData)
    
    // Convert to grayscale for PRNU analysis
    const grayImage = this.convertToGrayscale(imageArray, width, height)
    
    // Apply denoising filter to extract noise residual
    const denoised = this.applyDenoisingFilter(grayImage, width, height)
    const noiseResidual = this.computeNoiseResidual(grayImage, denoised, width, height)
    
    // Extract PRNU pattern using Wiener filtering
    const prnuPattern = this.extractPRNUPattern(noiseResidual, width, height)
    
    // Compute noise variance and spatial characteristics
    const noiseVariance = this.computeNoiseVariance(noiseResidual)
    const spatialConsistency = this.analyzeSpatialConsistency(prnuPattern, width, height)
    
    // Generate correlation map
    const correlationMap = this.generateCorrelationMap(prnuPattern, width, height)
    
    // Extract frequency signature
    const frequencySignature = this.extractFrequencySignature(prnuPattern, width, height)
    
    // Calculate pattern strength
    const patternStrength = this.calculatePatternStrength(prnuPattern, noiseVariance)
    
    // Generate sensor ID based on pattern characteristics
    const sensorId = this.generateSensorId(prnuPattern, frequencySignature)
    
    return {
      sensorPattern: prnuPattern,
      noiseVariance,
      correlationMap,
      sensorId,
      patternStrength,
      spatialConsistency,
      frequencySignature
    }
  }

  /**
   * Advanced denoising filter for PRNU extraction
   */
  private applyDenoisingFilter(
    image: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    // Implement advanced denoising (Wiener filter approximation)
    const denoised = new Float32Array(width * height)
    const kernelSize = 5
    const kernelRadius = Math.floor(kernelSize / 2)
    
    for (let y = kernelRadius; y < height - kernelRadius; y++) {
      for (let x = kernelRadius; x < width - kernelRadius; x++) {
        let sum = 0
        let weightSum = 0
        
        // Adaptive Wiener-like filtering
        for (let ky = -kernelRadius; ky <= kernelRadius; ky++) {
          for (let kx = -kernelRadius; kx <= kernelRadius; kx++) {
            const pixelIdx = (y + ky) * width + (x + kx)
            const centerIdx = y * width + x
            
            // Calculate weight based on pixel similarity
            const diff = Math.abs(image[pixelIdx] - image[centerIdx])
            const weight = Math.exp(-diff * diff / (2 * 0.1 * 0.1))
            
            sum += image[pixelIdx] * weight
            weightSum += weight
          }
        }
        
        denoised[y * width + x] = weightSum > 0 ? sum / weightSum : image[y * width + x]
      }
    }
    
    return denoised
  }

  /**
   * Compute noise residual (original - denoised)
   */
  private computeNoiseResidual(
    original: Float32Array,
    denoised: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    const residual = new Float32Array(width * height)
    
    for (let i = 0; i < width * height; i++) {
      residual[i] = original[i] - denoised[i]
    }
    
    return residual
  }

  /**
   * Extract PRNU pattern using advanced signal processing
   */
  private extractPRNUPattern(
    noiseResidual: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    // Apply high-pass filtering to extract multiplicative noise
    const highPassed = this.applyHighPassFilter(noiseResidual, width, height)
    
    // Normalize by local intensity to extract multiplicative component
    const prnuPattern = this.extractMultiplicativeNoise(highPassed, width, height)
    
    // Apply statistical normalization
    const normalized = this.statisticalNormalization(prnuPattern)
    
    return normalized
  }

  /**
   * High-pass filter for PRNU extraction
   */
  private applyHighPassFilter(
    signal: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    // Simple high-pass filter implementation
    const filtered = new Float32Array(width * height)
    const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1] // High-pass kernel
    const kernelSize = 3
    const radius = Math.floor(kernelSize / 2)
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let sum = 0
        
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const pixelIdx = (y + ky) * width + (x + kx)
            const kernelIdx = (ky + radius) * kernelSize + (kx + radius)
            sum += signal[pixelIdx] * kernel[kernelIdx]
          }
        }
        
        filtered[y * width + x] = sum
      }
    }
    
    return filtered
  }

  /**
   * Extract multiplicative noise component
   */
  private extractMultiplicativeNoise(
    signal: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    const multiplicative = new Float32Array(width * height)
    
    // Estimate local mean intensity
    const localMean = this.computeLocalMean(signal, width, height, 8)
    
    for (let i = 0; i < width * height; i++) {
      // Extract multiplicative component: noise / (local_mean + epsilon)
      const epsilon = 1e-6
      multiplicative[i] = signal[i] / (localMean[i] + epsilon)
    }
    
    return multiplicative
  }

  /**
   * Compute local mean with specified window size
   */
  private computeLocalMean(
    signal: Float32Array,
    width: number,
    height: number,
    windowSize: number
  ): Float32Array {
    const localMean = new Float32Array(width * height)
    const radius = Math.floor(windowSize / 2)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0
        let count = 0
        
        const startY = Math.max(0, y - radius)
        const endY = Math.min(height - 1, y + radius)
        const startX = Math.max(0, x - radius)
        const endX = Math.min(width - 1, x + radius)
        
        for (let wy = startY; wy <= endY; wy++) {
          for (let wx = startX; wx <= endX; wx++) {
            sum += signal[wy * width + wx]
            count++
          }
        }
        
        localMean[y * width + x] = count > 0 ? sum / count : 0
      }
    }
    
    return localMean
  }

  /**
   * Statistical normalization of PRNU pattern
   */
  private statisticalNormalization(pattern: Float32Array): Float32Array {
    // Calculate mean and standard deviation
    let mean = 0
    for (let i = 0; i < pattern.length; i++) {
      mean += pattern[i]
    }
    mean /= pattern.length
    
    let variance = 0
    for (let i = 0; i < pattern.length; i++) {
      variance += (pattern[i] - mean) * (pattern[i] - mean)
    }
    variance /= pattern.length
    const stdDev = Math.sqrt(variance)
    
    // Normalize to zero mean, unit variance
    const normalized = new Float32Array(pattern.length)
    for (let i = 0; i < pattern.length; i++) {
      normalized[i] = stdDev > 0 ? (pattern[i] - mean) / stdDev : 0
    }
    
    return normalized
  }

  /**
   * Find matching sensor in database using correlation analysis
   */
  private async findSensorMatch(prnu: PRNUFingerprint): Promise<{
    sensorId: string | null
    score: number
    confidence: number
  }> {
    let bestMatch = { sensorId: null as string | null, score: 0, confidence: 0 }
    
    for (const [sensorId, reference] of this.sensorDatabase) {
      const correlation = this.computeNormalizedCorrelation(
        prnu.sensorPattern,
        reference.prnuPattern
      )
      
      const frequencyMatch = this.compareFrequencySignatures(
        prnu.frequencySignature,
        reference.noiseCharacteristics.spatialFrequency
      )
      
      const combinedScore = correlation * 0.7 + frequencyMatch * 0.3
      
      if (combinedScore > bestMatch.score) {
        bestMatch = {
          sensorId,
          score: combinedScore,
          confidence: this.calculateMatchConfidence(correlation, frequencyMatch, reference.metadata.quality)
        }
      }
    }
    
    return bestMatch
  }

  /**
   * Compute normalized correlation between two PRNU patterns
   */
  private computeNormalizedCorrelation(pattern1: Float32Array, pattern2: Float32Array): number {
    const minLength = Math.min(pattern1.length, pattern2.length)
    
    let correlation = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < minLength; i++) {
      correlation += pattern1[i] * pattern2[i]
      norm1 += pattern1[i] * pattern1[i]
      norm2 += pattern2[i] * pattern2[i]
    }
    
    const normProduct = Math.sqrt(norm1 * norm2)
    return normProduct > 0 ? correlation / normProduct : 0
  }

  /**
   * Detect GAN/diffusion artifacts in PRNU
   */
  private detectGANArtifactsInPRNU(prnu: PRNUFingerprint): {
    prnuDisruption: number
    patternInconsistency: number
    noiseArtifacts: number
  } {
    // Analyze PRNU disruption patterns typical in GAN images
    const prnuDisruption = this.analyzePRNUDisruption(prnu.sensorPattern, prnu.correlationMap)
    
    // Check for pattern inconsistencies
    const patternInconsistency = this.analyzePatternInconsistency(prnu.sensorPattern, prnu.spatialConsistency)
    
    // Detect artificial noise artifacts
    const noiseArtifacts = this.detectArtificialNoiseArtifacts(prnu.sensorPattern, prnu.frequencySignature)
    
    return {
      prnuDisruption,
      patternInconsistency,
      noiseArtifacts
    }
  }

  /**
   * Analyze PRNU disruption patterns
   */
  private analyzePRNUDisruption(pattern: Float32Array, correlationMap: Float32Array): number {
    // GAN images often have disrupted or missing PRNU patterns
    let disruptionScore = 0
    
    // Calculate local correlation strength variations
    const blockSize = 64
    const numBlocks = Math.floor(Math.sqrt(correlationMap.length / (blockSize * blockSize)))
    
    let lowCorrelationBlocks = 0
    let totalBlocks = 0
    
    for (let by = 0; by < numBlocks; by++) {
      for (let bx = 0; bx < numBlocks; bx++) {
        let blockCorrelation = 0
        let blockSize2 = blockSize * blockSize
        
        for (let i = 0; i < blockSize2; i++) {
          const idx = by * blockSize * numBlocks * blockSize + bx * blockSize + i
          if (idx < correlationMap.length) {
            blockCorrelation += Math.abs(correlationMap[idx])
          }
        }
        
        blockCorrelation /= blockSize2
        
        if (blockCorrelation < 0.1) { // Low correlation threshold
          lowCorrelationBlocks++
        }
        totalBlocks++
      }
    }
    
    disruptionScore = totalBlocks > 0 ? lowCorrelationBlocks / totalBlocks : 0
    
    return Math.min(1, disruptionScore * 2) // Scale to [0,1]
  }

  /**
   * Analyze pattern inconsistency typical in AI-generated images
   */
  private analyzePatternInconsistency(pattern: Float32Array, spatialConsistency: number): number {
    // Real camera sensors have consistent spatial patterns
    // AI generated images often lack this consistency
    
    const inconsistencyScore = 1 - spatialConsistency
    
    // Check for artificial periodicity (common in GAN outputs)
    const periodicityScore = this.detectArtificialPeriodicity(pattern)
    
    return Math.min(1, inconsistencyScore * 0.7 + periodicityScore * 0.3)
  }

  /**
   * Detect artificial noise artifacts in frequency domain
   */
  private detectArtificialNoiseArtifacts(pattern: Float32Array, frequencySignature: Float32Array): number {
    // AI-generated images often have unnatural frequency characteristics
    let artifactScore = 0
    
    // Check for frequency anomalies
    const frequencyVariance = this.computeVariance(frequencySignature)
    const expectedVariance = 0.1 // Typical for real camera noise
    
    if (frequencyVariance < expectedVariance * 0.5) {
      artifactScore += 0.4 // Too uniform (typical of AI)
    } else if (frequencyVariance > expectedVariance * 3) {
      artifactScore += 0.3 // Too chaotic (possible processing artifacts)
    }
    
    // Check for unnatural frequency peaks
    const unnaturalPeaks = this.detectUnnaturalFrequencyPeaks(frequencySignature)
    artifactScore += unnaturalPeaks * 0.3
    
    return Math.min(1, artifactScore)
  }

  /**
   * Detect artificial periodicity in PRNU pattern
   */
  private detectArtificialPeriodicity(pattern: Float32Array): number {
    // Compute autocorrelation to detect artificial periodicities
    const maxLag = Math.min(100, Math.floor(pattern.length / 4))
    let maxPeriodicCorrelation = 0
    
    for (let lag = 10; lag < maxLag; lag++) {
      let correlation = 0
      let count = 0
      
      for (let i = 0; i < pattern.length - lag; i++) {
        correlation += pattern[i] * pattern[i + lag]
        count++
      }
      
      if (count > 0) {
        correlation /= count
        maxPeriodicCorrelation = Math.max(maxPeriodicCorrelation, Math.abs(correlation))
      }
    }
    
    // High periodic correlation suggests artificial patterns
    return Math.min(1, maxPeriodicCorrelation * 5)
  }

  /**
   * Detect unnatural frequency peaks
   */
  private detectUnnaturalFrequencyPeaks(frequencySignature: Float32Array): number {
    let peakScore = 0
    const threshold = this.computeMean(frequencySignature) + 2 * Math.sqrt(this.computeVariance(frequencySignature))
    
    let peakCount = 0
    for (let i = 1; i < frequencySignature.length - 1; i++) {
      if (frequencySignature[i] > threshold &&
          frequencySignature[i] > frequencySignature[i-1] &&
          frequencySignature[i] > frequencySignature[i+1]) {
        peakCount++
      }
    }
    
    const normalizedPeakCount = peakCount / frequencySignature.length
    return Math.min(1, normalizedPeakCount * 10)
  }

  // Helper methods

  private convertToGrayscale(imageArray: Uint8Array, width: number, height: number): Float32Array {
    const grayImage = new Float32Array(width * height)
    
    for (let i = 0; i < width * height; i++) {
      const r = imageArray[i * 4] || 0
      const g = imageArray[i * 4 + 1] || 0
      const b = imageArray[i * 4 + 2] || 0
      
      // Standard grayscale conversion
      grayImage[i] = 0.299 * r + 0.587 * g + 0.114 * b
    }
    
    return grayImage
  }

  private computeNoiseVariance(noiseResidual: Float32Array): number {
    const mean = this.computeMean(noiseResidual)
    return this.computeVariance(noiseResidual)
  }

  private computeMean(array: Float32Array): number {
    let sum = 0
    for (let i = 0; i < array.length; i++) {
      sum += array[i]
    }
    return sum / array.length
  }

  private computeVariance(array: Float32Array): number {
    const mean = this.computeMean(array)
    let variance = 0
    for (let i = 0; i < array.length; i++) {
      variance += (array[i] - mean) * (array[i] - mean)
    }
    return variance / array.length
  }

  private analyzeSpatialConsistency(pattern: Float32Array, width: number, height: number): number {
    // Analyze spatial consistency of PRNU pattern
    const blockSize = 32
    const blocksX = Math.floor(width / blockSize)
    const blocksY = Math.floor(height / blockSize)
    
    let consistencySum = 0
    let blockCount = 0
    
    for (let by = 0; by < blocksY - 1; by++) {
      for (let bx = 0; bx < blocksX - 1; bx++) {
        const block1Mean = this.computeBlockMean(pattern, width, bx * blockSize, by * blockSize, blockSize)
        const block2Mean = this.computeBlockMean(pattern, width, (bx + 1) * blockSize, by * blockSize, blockSize)
        const block3Mean = this.computeBlockMean(pattern, width, bx * blockSize, (by + 1) * blockSize, blockSize)
        
        const consistency = 1 - Math.abs(block1Mean - block2Mean) - Math.abs(block1Mean - block3Mean)
        consistencySum += Math.max(0, consistency)
        blockCount++
      }
    }
    
    return blockCount > 0 ? consistencySum / blockCount : 0
  }

  private computeBlockMean(pattern: Float32Array, width: number, startX: number, startY: number, blockSize: number): number {
    let sum = 0
    let count = 0
    
    for (let y = startY; y < startY + blockSize; y++) {
      for (let x = startX; x < startX + blockSize; x++) {
        const idx = y * width + x
        if (idx < pattern.length) {
          sum += pattern[idx]
          count++
        }
      }
    }
    
    return count > 0 ? sum / count : 0
  }

  private generateCorrelationMap(pattern: Float32Array, width: number, height: number): Float32Array {
    const correlationMap = new Float32Array(width * height)
    const windowSize = 16
    const radius = Math.floor(windowSize / 2)
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        // Compute local correlation
        let correlation = 0
        let count = 0
        
        for (let wy = -radius; wy <= radius; wy++) {
          for (let wx = -radius; wx <= radius; wx++) {
            const idx1 = y * width + x
            const idx2 = (y + wy) * width + (x + wx)
            
            if (idx1 < pattern.length && idx2 < pattern.length) {
              correlation += pattern[idx1] * pattern[idx2]
              count++
            }
          }
        }
        
        correlationMap[y * width + x] = count > 0 ? correlation / count : 0
      }
    }
    
    return correlationMap
  }

  private extractFrequencySignature(pattern: Float32Array, width: number, height: number): Float32Array {
    // Simple FFT approximation for frequency analysis
    const signatureSize = 64
    const signature = new Float32Array(signatureSize)
    
    // Compute power spectrum approximation
    for (let i = 0; i < signatureSize; i++) {
      let sum = 0
      let count = 0
      
      const freqBand = i / signatureSize
      const startIdx = Math.floor(freqBand * pattern.length)
      const endIdx = Math.floor((freqBand + 1/signatureSize) * pattern.length)
      
      for (let j = startIdx; j < endIdx && j < pattern.length; j++) {
        sum += pattern[j] * pattern[j]
        count++
      }
      
      signature[i] = count > 0 ? sum / count : 0
    }
    
    return signature
  }

  private calculatePatternStrength(pattern: Float32Array, noiseVariance: number): number {
    const patternVariance = this.computeVariance(pattern)
    return noiseVariance > 0 ? Math.min(1, patternVariance / noiseVariance) : 0
  }

  private generateSensorId(pattern: Float32Array, frequencySignature: Float32Array): string {
    // Generate unique sensor ID based on pattern characteristics
    let hash = 0
    
    // Hash pattern characteristics
    for (let i = 0; i < Math.min(100, pattern.length); i += 10) {
      hash = ((hash << 5) - hash + Math.floor(pattern[i] * 1000)) | 0
    }
    
    // Include frequency characteristics
    for (let i = 0; i < frequencySignature.length; i += 4) {
      hash = ((hash << 3) - hash + Math.floor(frequencySignature[i] * 100)) | 0
    }
    
    return `SENSOR_${Math.abs(hash).toString(16).toUpperCase()}`
  }

  private compareFrequencySignatures(sig1: Float32Array, sig2: number[]): number {
    let correlation = 0
    const minLength = Math.min(sig1.length, sig2.length)
    
    for (let i = 0; i < minLength; i++) {
      correlation += sig1[i] * sig2[i]
    }
    
    return Math.max(0, Math.min(1, correlation / minLength))
  }

  private calculateMatchConfidence(correlation: number, frequencyMatch: number, quality: number): number {
    return (correlation * 0.5 + frequencyMatch * 0.3 + quality * 0.2)
  }

  private detectPRNUAnomalies(prnu: PRNUFingerprint, dimensions: { width: number; height: number }): PRNUAnomaly[] {
    const anomalies: PRNUAnomaly[] = []
    
    // Detect correlation drops
    const correlationAnomalies = this.detectCorrelationAnomalies(prnu.correlationMap, dimensions)
    anomalies.push(...correlationAnomalies)
    
    // Detect pattern disruptions
    const patternAnomalies = this.detectPatternDisruptions(prnu.sensorPattern, dimensions)
    anomalies.push(...patternAnomalies)
    
    return anomalies
  }

  private detectCorrelationAnomalies(correlationMap: Float32Array, dimensions: { width: number; height: number }): PRNUAnomaly[] {
    const anomalies: PRNUAnomaly[] = []
    const threshold = 0.05
    const blockSize = 64
    
    const blocksX = Math.floor(dimensions.width / blockSize)
    const blocksY = Math.floor(dimensions.height / blockSize)
    
    for (let by = 0; by < blocksY; by++) {
      for (let bx = 0; bx < blocksX; bx++) {
        const blockCorr = this.computeBlockMean(correlationMap, dimensions.width, bx * blockSize, by * blockSize, blockSize)
        
        if (blockCorr < threshold) {
          anomalies.push({
            type: 'correlation_drop',
            location: {
              x: bx * blockSize,
              y: by * blockSize,
              width: blockSize,
              height: blockSize
            },
            severity: 1 - blockCorr / threshold,
            description: `Low PRNU correlation detected (${blockCorr.toFixed(3)})`,
            confidence: 0.8
          })
        }
      }
    }
    
    return anomalies
  }

  private detectPatternDisruptions(pattern: Float32Array, dimensions: { width: number; height: number }): PRNUAnomaly[] {
    const anomalies: PRNUAnomaly[] = []
    // Implementation for pattern disruption detection
    return anomalies
  }

  private calculateAuthenticityScore(
    prnu: PRNUFingerprint,
    sensorMatch: any,
    ganDetection: any,
    anomalies: PRNUAnomaly[]
  ): { score: number; confidence: number; evidence: string[] } {
    const evidence: string[] = []
    let authenticityScore = 0.5 // Start neutral
    
    // Sensor match contribution
    if (sensorMatch.score > this.correlationThreshold) {
      authenticityScore += 0.3
      evidence.push(`Strong sensor correlation detected (${sensorMatch.score.toFixed(3)})`)
    } else {
      authenticityScore -= 0.2
      evidence.push(`No clear sensor fingerprint found`)
    }
    
    // GAN detection contribution
    const ganScore = (ganDetection.prnuDisruption + ganDetection.patternInconsistency + ganDetection.noiseArtifacts) / 3
    authenticityScore -= ganScore * 0.4
    
    if (ganScore > 0.5) {
      evidence.push(`AI generation artifacts detected in PRNU`)
    }
    
    // Anomaly contribution
    const anomalyPenalty = Math.min(0.3, anomalies.length * 0.05)
    authenticityScore -= anomalyPenalty
    
    if (anomalies.length > 0) {
      evidence.push(`${anomalies.length} PRNU anomalies detected`)
    }
    
    // Pattern strength contribution
    if (prnu.patternStrength > 0.3) {
      authenticityScore += 0.2
      evidence.push(`Strong PRNU pattern detected`)
    }
    
    authenticityScore = Math.max(0, Math.min(1, authenticityScore))
    const confidence = Math.max(0.6, 1 - Math.abs(0.5 - authenticityScore))
    
    return {
      score: authenticityScore,
      confidence,
      evidence
    }
  }

  private initializeSensorDatabase(): void {
    // Initialize with common camera sensor patterns
    console.log(`[PRNUDatabase] Initializing sensor fingerprint database`)
  }

  private loadKnownCameraFingerprints(): void {
    // Load known camera PRNU patterns (simulated)
    const commonCameras = [
      { id: 'CANON_EOS_R5', manufacturer: 'Canon', model: 'EOS R5' },
      { id: 'SONY_A7R5', manufacturer: 'Sony', model: 'Alpha 7R V' },
      { id: 'NIKON_Z9', manufacturer: 'Nikon', model: 'Z9' },
      { id: 'IPHONE_15_PRO', manufacturer: 'Apple', model: 'iPhone 15 Pro' },
      { id: 'SAMSUNG_S24', manufacturer: 'Samsung', model: 'Galaxy S24' }
    ]
    
    for (const camera of commonCameras) {
      const prnuPattern = this.generateReferencePRNU(camera.id)
      
      const reference: SensorReference = {
        sensorId: camera.id,
        manufacturer: camera.manufacturer,
        model: camera.model,
        prnuPattern,
        noiseCharacteristics: {
          variance: 0.05 + Math.random() * 0.1,
          distribution: 'gaussian',
          spatialFrequency: this.generateFrequencyProfile()
        },
        metadata: {
          samples: 100,
          quality: 0.8 + Math.random() * 0.2,
          lastUpdated: new Date()
        }
      }
      
      this.sensorDatabase.set(camera.id, reference)
    }
    
    console.log(`[PRNUDatabase] Loaded ${this.sensorDatabase.size} sensor references`)
  }

  private generateReferencePRNU(sensorId: string): Float32Array {
    // Generate characteristic PRNU pattern for reference sensor
    const patternSize = 1024 * 1024 // 1MP reference pattern
    const pattern = new Float32Array(patternSize)
    
    // Generate sensor-specific pattern based on ID
    let seed = this.hashString(sensorId)
    
    for (let i = 0; i < patternSize; i++) {
      // Generate deterministic but sensor-specific pattern
      seed = (seed * 9301 + 49297) % 233280
      pattern[i] = (seed / 233280 - 0.5) * 0.1 // Small amplitude PRNU
    }
    
    return pattern
  }

  private generateFrequencyProfile(): number[] {
    const profile = new Array(64)
    for (let i = 0; i < 64; i++) {
      // Typical camera noise frequency profile
      profile[i] = Math.exp(-i / 20) * (0.5 + Math.random() * 0.5)
    }
    return profile
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Public methods for external access
  public getSensorDatabase(): Map<string, SensorReference> {
    return new Map(this.sensorDatabase)
  }

  public addSensorReference(reference: SensorReference): void {
    this.sensorDatabase.set(reference.sensorId, reference)
    console.log(`[PRNUDatabase] Added sensor reference: ${reference.sensorId}`)
  }

  public getAnalysisCache(): Map<string, PRNUAnalysisResult> {
    return new Map(this.analysisCache)
  }

  public clearCache(): void {
    this.analysisCache.clear()
    console.log(`[PRNUAnalyzer] Analysis cache cleared`)
  }
}

// Export the PRNU analyzer
export const prnuAnalyzer = new PRNUAnalyzer()