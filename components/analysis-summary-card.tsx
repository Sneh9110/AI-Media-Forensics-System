"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Zap } from "lucide-react"

interface AnalysisSummaryCardProps {
  fileName: string
  prediction: 'real' | 'synthetic'
  confidence: number
  processingTime: number
  uploadedAt: string
  ensembleScore?: number
  consensusStrength?: number
  detectorsUsed?: number
}

export function AnalysisSummaryCard({
  fileName,
  prediction,
  confidence,
  processingTime,
  uploadedAt,
  ensembleScore,
  consensusStrength,
  detectorsUsed,
}: AnalysisSummaryCardProps) {
  const confidencePercent = (confidence * 100).toFixed(1)
  const isAuthentic = prediction === 'real'
  const isSynthetic = prediction === 'synthetic'

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high'
  let riskColor: string
  let riskMessage: string

  if (isSynthetic) {
    if (confidence > 0.9) {
      riskLevel = 'high'
      riskColor = 'destructive'
      riskMessage = 'High risk of AI-generated content'
    } else if (confidence > 0.7) {
      riskLevel = 'medium'
      riskColor = 'yellow'
      riskMessage = 'Moderate risk detected'
    } else {
      riskLevel = 'low'
      riskColor = 'secondary'
      riskMessage = 'Low probability of synthetic content'
    }
  } else {
    if (confidence > 0.9) {
      riskLevel = 'low'
      riskColor = 'green'
      riskMessage = 'Likely authentic content'
    } else if (confidence > 0.7) {
      riskLevel = 'medium'
      riskColor = 'yellow'
      riskMessage = 'Moderate authenticity confidence'
    } else {
      riskLevel = 'medium'
      riskColor = 'yellow'
      riskMessage = 'Low confidence - manual review recommended'
    }
  }

  return (
    <Card className="border-l-4" style={{
      borderLeftColor: isAuthentic ? '#22c55e' : '#ef4444'
    }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-foreground">
              {isAuthentic ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Quick Summary
            </CardTitle>
            <CardDescription className="mt-1 text-xs truncate">
              {fileName}
            </CardDescription>
          </div>
          <Badge
            variant={prediction === 'synthetic' ? 'destructive' : 'default'}
            className="ml-2"
          >
            {prediction.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Confidence</span>
            <span className="text-lg font-bold text-foreground">{confidencePercent}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isAuthentic ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
            <Badge
              variant="outline"
              className={`${
                riskLevel === 'high'
                  ? 'bg-red-500/10 text-red-700 border-red-500'
                  : riskLevel === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500'
                    : 'bg-green-500/10 text-green-700 border-green-500'
              }`}
            >
              {riskLevel.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{riskMessage}</p>
        </div>

        {/* Processing Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Processing Time</p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {processingTime}ms
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Analyzed</p>
            <p className="text-sm font-semibold text-foreground">
              {new Date(uploadedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Ensemble Info */}
        {ensembleScore && (
          <div className="pt-2 border-t border-border space-y-1">
            <p className="text-xs text-muted-foreground">Ensemble Detection</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Score</p>
                <p className="font-semibold">{(ensembleScore * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Consensus</p>
                <p className="font-semibold">
                  {consensusStrength ? (consensusStrength * 100).toFixed(0) : 'N/A'}%
                </p>
              </div>
            </div>
            {detectorsUsed && (
              <p className="text-xs text-muted-foreground mt-2">
                {detectorsUsed} detector{detectorsUsed !== 1 ? 's' : ''} used
              </p>
            )}
          </div>
        )}

        {/* Confidence Indicator */}
        <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border">
          {confidence > 0.85
            ? '✅ High confidence result'
            : confidence > 0.7
              ? '⚠️ Moderate confidence - review recommended'
              : '❓ Low confidence - manual review strongly recommended'}
        </div>
      </CardContent>
    </Card>
  )
}
