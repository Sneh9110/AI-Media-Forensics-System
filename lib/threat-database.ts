/**
 * Threat Intelligence Database
 * Pattern signatures, threat catalogs, attack vectors, and threat scoring
 * Research-backed threat intelligence for forensic analysis
 */

export interface ThreatSignature {
  signatureId: string
  name: string
  category: "gan" | "diffusion" | "face_swap" | "voice_cloning" | "video_interpolation" | "other"
  description: string
  artifacts: string[] // Detectable artifacts
  confidence: number // Typical detection confidence (0-1)
  firstDetected: Date
  lastSeen: Date
  frequency: number // Times detected in system
  references: string[] // Academic papers or CVEs
  mitigation?: string
}

export interface AttackVector {
  vectorId: string
  name: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  affectedDomains: string[]
  exploitedSignatures: string[]
  realWorldIncidents: number
  mitigationStrategy: string
}

export interface ThreatIntelligenceEntry {
  entryId: string
  threatName: string
  threatLevel: "low" | "medium" | "high" | "critical"
  description: string
  signatures: ThreatSignature[]
  attackVectors: AttackVector[]
  indicatorsOfCompromise: string[]
  lastUpdated: Date
  sourceCredibility: "low" | "medium" | "high"
  references: string[]
}

export interface DetectionPattern {
  patternId: string
  name: string
  generativeModel: string // "StyleGAN", "DALL-E", "Midjourney", "Stable Diffusion", etc.
  artifacts: {
    frequencyDomain: string[]
    spatialDomain: string[]
    colorAnalysis: string[]
  }
  accuracyOnDataset: number
  commonUseCase: string
  detectability: "easy" | "moderate" | "difficult" | "very_difficult"
  lastModified: Date
}

export interface ThreatsDatabase {
  signatures: Map<string, ThreatSignature>
  threatIntelligence: Map<string, ThreatIntelligenceEntry>
  detectionPatterns: Map<string, DetectionPattern>
  attackVectors: Map<string, AttackVector>
}

class ThreatDatabaseService {
  private database: ThreatsDatabase = {
    signatures: new Map(),
    threatIntelligence: new Map(),
    detectionPatterns: new Map(),
    attackVectors: new Map(),
  }

  constructor() {
    this.initializeThreatDatabase()
  }

  /**
   * Initialize threat database with known threats
   */
  private initializeThreatDatabase(): void {
    // StyleGAN Signatures
    this.addSignature({
      signatureId: "SIG_STYLEGAN_001",
      name: "StyleGAN Face Generation",
      category: "gan",
      description:
        "Signature artifacts from StyleGAN face generation including characteristic frequency patterns",
      artifacts: [
        "Concentric circle patterns in frequency domain",
        "Regular DCT block boundaries",
        "Smooth skin texture anomalies",
      ],
      confidence: 0.92,
      firstDetected: new Date("2020-01-01"),
      lastSeen: new Date(),
      frequency: 15420,
      references: [
        "Karras et al., 2018 - A Style-Based Generator Architecture for Generative Adversarial Networks",
      ],
    })

    // Diffusion Model Signatures
    this.addSignature({
      signatureId: "SIG_DIFFUSION_001",
      name: "Diffusion Model Artifacts",
      category: "diffusion",
      description:
        "Characteristic artifacts from DDPM and latent diffusion model outputs including smooth gradients",
      artifacts: [
        "Smooth transition patterns",
        "Reduced noise variance",
        "Lower high-frequency content",
        "Overly smooth textures",
      ],
      confidence: 0.88,
      firstDetected: new Date("2022-06-01"),
      lastSeen: new Date(),
      frequency: 23150,
      references: [
        "Ho et al., 2020 - Denoising Diffusion Probabilistic Models",
        "Rombach et al., 2022 - High-Resolution Image Synthesis with Latent Diffusion Models",
      ],
    })

    // Face Swap Signatures
    this.addSignature({
      signatureId: "SIG_FACESWAP_001",
      name: "DeepFaceLab Face Swap",
      category: "face_swap",
      description:
        "Artifacts from face replacement using DeepFaceLab and similar face-swapping techniques",
      artifacts: [
        "Face boundary seam artifacts",
        "Color channel mismatch at boundaries",
        "Unnatural eye reflections",
        "Asymmetrical face features",
      ],
      confidence: 0.85,
      firstDetected: new Date("2018-06-01"),
      lastSeen: new Date(),
      frequency: 8920,
      references: ["DeepFaceLab detection research"],
    })

    // Add threat intelligence entries
    this.addThreatIntelligence({
      entryId: "THREAT_DEEPFAKE_2024",
      threatName: "Deepfake Media Campaign",
      threatLevel: "critical",
      description:
        "Organized deepfake generation and distribution campaign targeting public figures",
      signatures: [
        this.database.signatures.get("SIG_STYLEGAN_001")!,
        this.database.signatures.get("SIG_FACESWAP_001")!,
      ],
      attackVectors: [],
      indicatorsOfCompromise: [
        "Multiple StyleGAN-generated faces from same seed",
        "Coordinate face-swap attacks",
        "Rapid distribution across social media",
      ],
      lastUpdated: new Date(),
      sourceCredibility: "high",
      references: [
        "NIST Deepfake Detection Challenge 2023",
        "Media Forensics Research Publications",
      ],
    })

    // Add detection patterns
    this.addDetectionPattern({
      patternId: "PAT_STYLEGAN_FACES",
      name: "StyleGAN-Generated Faces",
      generativeModel: "StyleGAN / StyleGAN2 / StyleGAN3",
      artifacts: {
        frequencyDomain: ["Concentric circle patterns", "Low-frequency concentration"],
        spatialDomain: ["Overly smooth skin", "Unnatural symmetry", "Perfect hair structure"],
        colorAnalysis: ["Consistent color channels", "Reduced color noise"],
      },
      accuracyOnDataset: 0.94,
      commonUseCase: "Profile pictures, social engineering, synthetic identity creation",
      detectability: "easy",
      lastModified: new Date(),
    })

    this.addDetectionPattern({
      patternId: "PAT_DALLE_IMAGES",
      name: "DALL-E Generated Images",
      generativeModel: "DALL-E 2 / DALL-E 3",
      artifacts: {
        frequencyDomain: ["Diffusion-specific noise patterns", "Smooth transitions"],
        spatialDomain: ["Text rendering failures", "Impossible object geometries"],
        colorAnalysis: ["Gradient anomalies", "Oversaturated colors in some regions"],
      },
      accuracyOnDataset: 0.91,
      commonUseCase: "Marketing imagery, social media content, stock photo replacement",
      detectability: "moderate",
      lastModified: new Date(),
    })

    this.addDetectionPattern({
      patternId: "PAT_STABLE_DIFF",
      name: "Stable Diffusion Generated Images",
      generativeModel: "Stable Diffusion v1.x / v2.x",
      artifacts: {
        frequencyDomain: ["Diffusion patterns", "Energy concentration"],
        spatialDomain: ["Text scrambling", "Hand anomalies", "Repeated pattern artifacts"],
        colorAnalysis: ["Color bleeding at edges", "Inconsistent saturation"],
      },
      accuracyOnDataset: 0.89,
      commonUseCase: "Art generation, meme creation, blog imagery",
      detectability: "moderate",
      lastModified: new Date(),
    })
  }

  /**
   * Add signature to database
   */
  addSignature(signature: ThreatSignature): void {
    this.database.signatures.set(signature.signatureId, signature)
  }

  /**
   * Add threat intelligence entry
   */
  addThreatIntelligence(entry: ThreatIntelligenceEntry): void {
    this.database.threatIntelligence.set(entry.entryId, entry)
  }

  /**
   * Add detection pattern
   */
  addDetectionPattern(pattern: DetectionPattern): void {
    this.database.detectionPatterns.set(pattern.patternId, pattern)
  }

  /**
   * Search signatures by category
   */
  getSignaturesByCategory(category: string): ThreatSignature[] {
    return Array.from(this.database.signatures.values()).filter((sig) => sig.category === category)
  }

  /**
   * Search for matching signatures in analysis
   */
  matchDetectionPatterns(artifacts: string[]): DetectionPattern[] {
    const matches: DetectionPattern[] = []

    this.database.detectionPatterns.forEach((pattern) => {
      const allArtifacts = [
        ...pattern.artifacts.frequencyDomain,
        ...pattern.artifacts.spatialDomain,
        ...pattern.artifacts.colorAnalysis,
      ]

      const matchCount = artifacts.filter((artifact) =>
        allArtifacts.some((a) => a.toLowerCase().includes(artifact.toLowerCase()))
      ).length

      if (matchCount > 0) {
        matches.push(pattern)
      }
    })

    return matches.sort((a, b) => b.accuracyOnDataset - a.accuracyOnDataset)
  }

  /**
   * Get threat intelligence for detected signature
   */
  getThreatLevel(signatureId: string): "low" | "medium" | "high" | "critical" {
    const signature = this.database.signatures.get(signatureId)
    if (!signature) return "low"

    // Higher frequency = more common threat
    if (signature.frequency > 10000) return "high"
    if (signature.frequency > 5000) return "medium"
    return "low"
  }

  /**
   * Generate threat report
   */
  generateThreatReport(
    detectedSignatures: string[],
    detectionArtifacts: string[]
  ): {
    summary: string
    threats: ThreatIntelligenceEntry[]
    patterns: DetectionPattern[]
    riskLevel: string
    recommendations: string[]
  } {
    const threats: ThreatIntelligenceEntry[] = []
    const patterns: DetectionPattern[] = []

    // Find matching threats
    this.database.threatIntelligence.forEach((threat) => {
      const matchingSignatures = detectedSignatures.filter((sigId) =>
        threat.signatures.some((sig) => sig.signatureId === sigId)
      )

      if (matchingSignatures.length > 0) {
        threats.push(threat)
      }
    })

    // Find matching patterns
    patterns.push(...this.matchDetectionPatterns(detectionArtifacts))

    // Determine risk level
    let riskLevel = "low"
    if (threats.some((t) => t.threatLevel === "critical")) {
      riskLevel = "critical"
    } else if (threats.some((t) => t.threatLevel === "high")) {
      riskLevel = "high"
    } else if (threats.some((t) => t.threatLevel === "medium")) {
      riskLevel = "medium"
    }

    const summary =
      threats.length === 0
        ? "No known threats detected"
        : `${threats.length} threat(s) detected with ${riskLevel} risk level`

    const recommendations = this.generateRecommendations(riskLevel, threats)

    return {
      summary,
      threats,
      patterns,
      riskLevel,
      recommendations,
    }
  }

  /**
   * Generate risk mitigation recommendations
   */
  private generateRecommendations(
    riskLevel: string,
    threats: ThreatIntelligenceEntry[]
  ): string[] {
    const recommendations: string[] = []

    if (riskLevel === "critical") {
      recommendations.push("URGENT: Escalate to security team immediately")
      recommendations.push("Preserve evidence with chain-of-custody documentation")
      recommendations.push("Notify relevant authorities if applicable")
      recommendations.push("Isolate and quarantine affected content")
    } else if (riskLevel === "high") {
      recommendations.push("Flag content for manual review by analysts")
      recommendations.push("Monitor for related content distribution")
      recommendations.push("Document detection results for legal proceedings if needed")
    } else if (riskLevel === "medium") {
      recommendations.push("Log detection event for audit trail")
      recommendations.push("Consider secondary verification analysis")
      recommendations.push("Monitor source for pattern changes")
    }

    // Threat-specific recommendations
    threats.forEach((threat) => {
      recommendations.push(`Threat "${threat.threatName}": ${threat.description}`)
    })

    recommendations.push("Maintain updated threat signatures")
    recommendations.push("Report new patterns to threat intelligence community")

    return recommendations
  }

  /**
   * Get all active threats
   */
  getAllThreats(): ThreatIntelligenceEntry[] {
    return Array.from(this.database.threatIntelligence.values())
  }

  /**
   * Get all detection patterns
   */
  getAllPatterns(): DetectionPattern[] {
    return Array.from(this.database.detectionPatterns.values())
  }

  /**
   * Update threat frequency (when detection occurs)
   */
  recordDetection(signatureId: string): void {
    const signature = this.database.signatures.get(signatureId)
    if (signature) {
      signature.frequency++
      signature.lastSeen = new Date()
    }
  }

  /**
   * Get threat statistics
   */
  getThreatStats(): {
    totalSignatures: number
    totalThreats: number
    totalPatterns: number
    criticalThreats: number
    recentDetections: number
  } {
    const allSignatures = Array.from(this.database.signatures.values())
    const allThreats = Array.from(this.database.threatIntelligence.values())

    // Count recent detections (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentDetections = allSignatures.filter((sig) => sig.lastSeen > thirtyDaysAgo).length

    return {
      totalSignatures: this.database.signatures.size,
      totalThreats: this.database.threatIntelligence.size,
      totalPatterns: this.database.detectionPatterns.size,
      criticalThreats: allThreats.filter((t) => t.threatLevel === "critical").length,
      recentDetections,
    }
  }

  /**
   * Export threat database
   */
  exportDatabase(): string {
    const lines: string[] = []

    lines.push("=== THREAT INTELLIGENCE DATABASE EXPORT ===")
    lines.push(`Exported: ${new Date().toISOString()}`)
    lines.push("")

    lines.push("THREAT SIGNATURES:")
    this.database.signatures.forEach((sig) => {
      lines.push(`[${sig.signatureId}] ${sig.name}`)
      lines.push(`  Category: ${sig.category}`)
      lines.push(`  Confidence: ${(sig.confidence * 100).toFixed(1)}%`)
      lines.push(`  Detections: ${sig.frequency}`)
      lines.push("")
    })

    lines.push("THREAT INTELLIGENCE ENTRIES:")
    this.database.threatIntelligence.forEach((threat) => {
      lines.push(`[${threat.entryId}] ${threat.threatName}`)
      lines.push(`  Level: ${threat.threatLevel}`)
      lines.push(`  Signatures: ${threat.signatures.map((s) => s.signatureId).join(", ")}`)
      lines.push("")
    })

    lines.push("DETECTION PATTERNS:")
    this.database.detectionPatterns.forEach((pattern) => {
      lines.push(`[${pattern.patternId}] ${pattern.name}`)
      lines.push(`  Model: ${pattern.generativeModel}`)
      lines.push(`  Accuracy: ${(pattern.accuracyOnDataset * 100).toFixed(1)}%`)
      lines.push(`  Detectability: ${pattern.detectability}`)
      lines.push("")
    })

    return lines.join("\n")
  }
}

// Export singleton
export const threatDatabase = new ThreatDatabaseService()
