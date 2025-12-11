"use client"

import { Shield, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ThreatIntelligenceCardProps {
  threatScore?: number
  threatLevel?: "safe" | "low_risk" | "medium_risk" | "high_risk" | "critical_risk"
  confidenceInDetection?: number
  likelyManipulations?: string[]
  recommendations?: string[]
  compact?: boolean
}

export function ThreatIntelligenceCard({
  threatScore = 42,
  threatLevel = "low_risk",
  confidenceInDetection = 0.78,
  likelyManipulations = [],
  recommendations = [],
  compact = false,
}: ThreatIntelligenceCardProps) {
  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical_risk":
        return {
          bg: "bg-red-500/10",
          border: "border-red-200",
          text: "text-red-700",
          badge: "bg-red-500/20 text-red-700",
        }
      case "high_risk":
        return {
          bg: "bg-orange-500/10",
          border: "border-orange-200",
          text: "text-orange-700",
          badge: "bg-orange-500/20 text-orange-700",
        }
      case "medium_risk":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-200",
          text: "text-yellow-700",
          badge: "bg-yellow-500/20 text-yellow-700",
        }
      case "low_risk":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-500/20 text-blue-700",
        }
      default:
        return {
          bg: "bg-green-500/10",
          border: "border-green-200",
          text: "text-green-700",
          badge: "bg-green-500/20 text-green-700",
        }
    }
  }

  const getThreatIcon = (level: string) => {
    switch (level) {
      case "critical_risk":
      case "high_risk":
        return <AlertTriangle className="h-5 w-5" />
      case "safe":
        return <CheckCircle2 className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  const colors = getThreatColor(threatLevel)
  const mockManipulations = likelyManipulations.length > 0 ? likelyManipulations : [
    "Frequency Domain Artifacts",
    "Missing PRNU Signature",
    "Unusual Color Distribution",
  ]

  const mockRecommendations = recommendations.length > 0 ? recommendations : [
    "Content shows moderate risk indicators",
    "Human review recommended before publishing",
    "Consider requesting source metadata",
  ]

  if (compact) {
    return (
      <Card className={`${colors.bg} border ${colors.border}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getThreatIcon(threatLevel)}
              <div>
                <p className="font-semibold text-sm capitalize">{threatLevel.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground">Threat Assessment</p>
              </div>
            </div>
            <Badge className={`text-lg font-bold ${colors.badge}`}>{threatScore}</Badge>
          </div>
          <Progress value={threatScore} className="h-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${colors.bg} border ${colors.border}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getThreatIcon(threatLevel)}
            <div>
              <CardTitle className={`capitalize ${colors.text}`}>{threatLevel.replace(/_/g, " ")}</CardTitle>
              <CardDescription>Threat Intelligence Assessment</CardDescription>
            </div>
          </div>
          <Badge className={`text-xl font-bold ${colors.badge}`}>{threatScore}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Threat Score Bar */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Threat Score</span>
            <span className="text-sm text-muted-foreground">{threatScore}/100</span>
          </div>
          <Progress value={threatScore} className="h-3" />
        </div>

        {/* Detection Confidence */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Detection Confidence</span>
            <span className="text-sm text-muted-foreground">{(confidenceInDetection * 100).toFixed(1)}%</span>
          </div>
          <Progress value={confidenceInDetection * 100} className="h-3" />
        </div>

        {/* Likely Manipulations */}
        <div>
          <p className="text-sm font-semibold mb-2">Detected Indicators</p>
          <div className="flex flex-wrap gap-2">
            {mockManipulations.map((manipulation, idx) => (
              <Badge key={idx} variant="outline" className={`text-xs ${colors.badge}`}>
                {manipulation}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-background/50 rounded-lg p-3">
          <p className="text-sm font-semibold mb-2 flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            Recommendations
          </p>
          <ul className="space-y-1">
            {mockRecommendations.slice(0, 3).map((rec, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                <span className="flex-shrink-0 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between p-2 bg-background/30 rounded">
          <span className="text-xs font-medium">Status</span>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                threatScore > 70 ? "bg-red-500" : threatScore > 50 ? "bg-yellow-500" : "bg-green-500"
              }`}
            />
            <span className="text-xs text-muted-foreground capitalize">{threatLevel.replace(/_/g, " ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
