"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, Download, Eye, Hash, Brain, Zap, Target, Cpu, TrendingUp } from "lucide-react"
import Link from "next/link"

interface AnalysisResultsProps {
  result: {
    prediction: "real" | "synthetic"
    confidence: number
    metadata?: {
      spatialScore: number
      frequencyScore: number
      metadataScore: number
      aiGenerationScore?: number
      deepfakeScore?: number
      manipulationScore?: number
      temporalConsistency?: number
      prnuSensorScore?: number
      patchAnalysisScore?: number
      spectrumAugmentationScore?: number
      trainingAccuracy?: number
      robustnessScore?: number
    }
    branchScores?: {
      spatial: number
      frequency: number
      metadata: number
    }
    detectionDetails?: {
      elaArtifacts: number
      ganFingerprints: number
      metadataConsistency: number
      fusionScore: number
    }
    technicalDetails?: {
      algorithmsUsed: string[]
      networkArchitecture?: string
      modelVersion: string
      features?: string[]
      processingTime?: number
    }
    riskFactors?: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      location?: { x: number; y: number; width: number; height: number }
    }>
    analysisId?: string
    detectionMethod?: string
  }
  fileInfo: {
    name: string
    size: number
    type: string
    md5: string
    sha256: string
  }
}

export function AnalysisResults({ result, fileInfo }: AnalysisResultsProps) {
  const isReal = result.prediction === "real"
  const confidencePercentage = Math.round(result.confidence * 100)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <Card className={`border-2 ${isReal ? "border-green-500/30" : "border-red-500/30"}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            {isReal ? (
              <Shield className="mr-2 h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="mr-2 h-6 w-6 text-red-500" />
            )}
            Authenticity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div>
              <Badge
                variant={isReal ? "default" : "destructive"}
                className={`text-lg px-4 py-2 ${isReal ? "bg-green-500/20 text-green-500 border-green-500/30" : ""}`}
              >
                {isReal ? "AUTHENTIC" : "SYNTHETIC"}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{confidencePercentage}% Confidence</p>
              <Progress value={confidencePercentage} className="mt-2 h-3" />
            </div>
            <p className="text-muted-foreground">
              {isReal
                ? "This media appears to be authentic based on our analysis."
                : "This media shows signs of AI generation or manipulation."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      {result.metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Eye className="mr-2 h-5 w-5 text-accent" />
              Detailed Analysis Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Spatial Residual Analysis</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(result.metadata.spatialScore * 100)}%
                  </span>
                </div>
                <Progress value={result.metadata.spatialScore * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Frequency Domain Analysis</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(result.metadata.frequencyScore * 100)}%
                  </span>
                </div>
                <Progress value={result.metadata.frequencyScore * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Metadata Consistency</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(result.metadata.metadataScore * 100)}%
                  </span>
                </div>
                <Progress value={result.metadata.metadataScore * 100} className="h-2" />
              </div>

              {/* Ultra-Accuracy Metrics */}
              {result.metadata.aiGenerationScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center">
                      <Brain className="mr-1 h-4 w-4 text-purple-500" />
                      AI Generation Probability
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.metadata.aiGenerationScore * 100)}%
                    </span>
                  </div>
                  <Progress value={result.metadata.aiGenerationScore * 100} className="h-2" />
                </div>
              )}

              {result.metadata.deepfakeScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center">
                      <Zap className="mr-1 h-4 w-4 text-orange-500" />
                      Deepfake/GAN Detection
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.metadata.deepfakeScore * 100)}%
                    </span>
                  </div>
                  <Progress value={result.metadata.deepfakeScore * 100} className="h-2" />
                </div>
              )}

              {result.metadata.manipulationScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center">
                      <Target className="mr-1 h-4 w-4 text-red-500" />
                      Manipulation Detection
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.metadata.manipulationScore * 100)}%
                    </span>
                  </div>
                  <Progress value={result.metadata.manipulationScore * 100} className="h-2" />
                </div>
              )}

              {result.metadata.prnuSensorScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center">
                      <Cpu className="mr-1 h-4 w-4 text-blue-500" />
                      PRNU Sensor Fingerprint
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.metadata.prnuSensorScore * 100)}%
                    </span>
                  </div>
                  <Progress value={result.metadata.prnuSensorScore * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Camera sensor pattern consistency analysis
                  </p>
                </div>
              )}

              {result.metadata.patchAnalysisScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center">
                      <Target className="mr-1 h-4 w-4 text-purple-500" />
                      Patch-Level Analysis
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.metadata.patchAnalysisScore * 100)}%
                    </span>
                  </div>
                  <Progress value={result.metadata.patchAnalysisScore * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Localized artifact detection via patch training
                  </p>
                </div>
              )}

              {result.metadata.spectrumAugmentationScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center">
                      <Zap className="mr-1 h-4 w-4 text-orange-500" />
                      Spectrum Augmentation
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.metadata.spectrumAugmentationScore * 100)}%
                    </span>
                  </div>
                  <Progress value={result.metadata.spectrumAugmentationScore * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Frequency domain robustness analysis
                  </p>
                </div>
              )}

              {result.metadata.trainingAccuracy !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center">
                      <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                      Training Accuracy
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.metadata.trainingAccuracy * 100)}%
                    </span>
                  </div>
                  <Progress value={result.metadata.trainingAccuracy * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enhanced model training performance
                  </p>
                </div>
              )}

              {result.metadata.robustnessScore !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center">
                      <Shield className="mr-1 h-4 w-4 text-cyan-500" />
                      Robustness Score
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.metadata.robustnessScore * 100)}%
                    </span>
                  </div>
                  <Progress value={result.metadata.robustnessScore * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Adversarial manipulation resistance
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-Branch Network Results */}
      {result.branchScores && result.detectionDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              Multi-Branch Network Analysis
              {result.technicalDetails?.networkArchitecture && (
                <Badge variant="outline" className="ml-2">
                  {result.technicalDetails.networkArchitecture}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Branch Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-background/50 rounded-lg border">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Branch A: Spatial CNN</p>
                    <p className="text-lg font-bold text-blue-600">
                      {Math.round(result.branchScores.spatial * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">ELA + Compression</p>
                  </div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Branch B: Frequency</p>
                    <p className="text-lg font-bold text-purple-600">
                      {Math.round(result.branchScores.frequency * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">DCT/FFT Analysis</p>
                  </div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Branch C: Metadata</p>
                    <p className="text-lg font-bold text-green-600">
                      {Math.round(result.branchScores.metadata * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">EXIF Encoder</p>
                  </div>
                </div>
              </div>

              {/* Detection Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Advanced Detection Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-foreground">ELA Artifacts</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.detectionDetails.elaArtifacts * 100)}%
                      </span>
                    </div>
                    <Progress value={result.detectionDetails.elaArtifacts * 100} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-foreground">GAN Fingerprints</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((1 - result.detectionDetails.ganFingerprints) * 100)}%
                      </span>
                    </div>
                    <Progress value={(1 - result.detectionDetails.ganFingerprints) * 100} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-foreground">Metadata Consistency</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.detectionDetails.metadataConsistency * 100)}%
                      </span>
                    </div>
                    <Progress value={result.detectionDetails.metadataConsistency * 100} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-foreground">Fusion Score</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.detectionDetails.fusionScore * 100)}%
                      </span>
                    </div>
                    <Progress value={result.detectionDetails.fusionScore * 100} className="h-1.5" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Factors */}
      {result.riskFactors && result.riskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-background/50 rounded-lg border">
                  <Badge 
                    variant={risk.severity === 'high' ? 'destructive' : risk.severity === 'medium' ? 'default' : 'secondary'}
                    className="mt-0.5"
                  >
                    {risk.severity.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{risk.type}</p>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Hash className="mr-2 h-5 w-5 text-chart-4" />
            File Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-foreground mb-1">File Name</p>
              <p className="text-muted-foreground break-all">{fileInfo.name}</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">File Size</p>
              <p className="text-muted-foreground">{formatFileSize(fileInfo.size)}</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">File Type</p>
              <p className="text-muted-foreground">{fileInfo.type}</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Analysis Time</p>
              <p className="text-muted-foreground">{new Date().toLocaleString()}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-foreground mb-1">MD5 Hash</p>
              <p className="text-muted-foreground font-mono text-xs break-all">{fileInfo.md5}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-foreground mb-1">SHA-256 Hash</p>
              <p className="text-muted-foreground font-mono text-xs break-all">{fileInfo.sha256}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Report (PDF)
            </Button>
            <Link href={`/heatmap/${result.analysisId || "demo"}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <Eye className="mr-2 h-4 w-4" />
                View Interactive Heatmap
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
