"use client"

import { useState } from "react"
import { TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdvancedAnalyticsDashboardProps {
  batchId?: string
  analysesCount?: number
  syntheticRate?: number
  patterns?: any[]
  anomalies?: any[]
  trends?: any[]
}

export function AdvancedAnalyticsDashboard({
  batchId = "batch_1",
  analysesCount = 125,
  syntheticRate = 42.5,
  patterns = [],
  anomalies = [],
  trends = [],
}: AdvancedAnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("daily")

  const mockPatterns = patterns.length > 0 ? patterns : [
    {
      id: "pattern_1",
      name: "High Confidence Synthetic",
      frequency: 45,
      confidence: 0.92,
      characteristics: ["frequency_anomalies", "high_confidence"],
    },
    {
      id: "pattern_2",
      name: "Mixed Detection Results",
      frequency: 18,
      confidence: 0.65,
      characteristics: ["low_consensus", "requires_review"],
    },
    {
      id: "pattern_3",
      name: "PRNU Signature Detected",
      frequency: 32,
      confidence: 0.88,
      characteristics: ["prnu_signature", "camera_authenticated"],
    },
  ]

  const mockAnomalies = anomalies.length > 0 ? anomalies : [
    {
      id: "anomaly_1",
      type: "unusual_confidence",
      severity: "high",
      description: "8 analyses with unusual confidence scores detected",
    },
    {
      id: "anomaly_2",
      type: "pattern_spike",
      severity: "medium",
      description: "35% change in detection rate detected",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analysesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">images processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Synthetic Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{syntheticRate.toFixed(1)}%</div>
            <Progress value={syntheticRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patterns Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockPatterns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">active patterns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{mockAnomalies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detected Patterns</CardTitle>
              <CardDescription>Recurring characteristics in analysis results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPatterns.length > 0 ? (
                mockPatterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{pattern.name}</h4>
                      <Badge variant="outline">{pattern.frequency} cases</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{pattern.description || "Pattern analysis"}</p>
                    <div className="flex gap-1 flex-wrap pt-2">
                      {pattern.characteristics?.map((char: string) => (
                        <Badge key={char} variant="secondary" className="text-xs">
                          {char.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Confidence</span>
                      <span className="font-semibold text-sm">{(pattern.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={pattern.confidence * 100} className="h-2" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No patterns detected yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Detected Anomalies
              </CardTitle>
              <CardDescription>Unusual patterns or deviations in analysis data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAnomalies.length > 0 ? (
                mockAnomalies.map((anomaly) => {
                  const severityColors = {
                    low: "bg-blue-500/10 border-blue-200 text-blue-700",
                    medium: "bg-yellow-500/10 border-yellow-200 text-yellow-700",
                    high: "bg-orange-500/10 border-orange-200 text-orange-700",
                    critical: "bg-red-500/10 border-red-200 text-red-700",
                  }

                  return (
                    <div key={anomaly.id} className={`border rounded-lg p-4 ${severityColors[anomaly.severity]}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4" />
                            <p className="font-semibold text-sm">{anomaly.type.replace(/_/g, " ").toUpperCase()}</p>
                          </div>
                          <p className="text-sm">{anomaly.description}</p>
                        </div>
                        <Badge className="capitalize">{anomaly.severity}</Badge>
                      </div>
                      <div className="mt-3 pt-3 border-t border-current/20">
                        <p className="text-xs font-semibold">Recommendation: Review these analyses manually for quality assurance</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600/50" />
                  <p className="text-sm text-muted-foreground">No anomalies detected. All metrics within normal parameters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analysis Trends
              </CardTitle>
              <CardDescription>Historical patterns and predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Trend Direction</p>
                  <p className="font-semibold text-sm">Stable</p>
                  <p className="text-xs text-muted-foreground mt-1">Consistent detection rate</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">7-Day Change</p>
                  <p className="font-semibold text-sm">+2.3%</p>
                  <p className="text-xs text-muted-foreground mt-1">slight increase</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Forecast</p>
                  <p className="font-semibold text-sm">43.8%</p>
                  <p className="text-xs text-muted-foreground mt-1">next 7 days</p>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-sm">Trend Analysis</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>✓ Synthetic detection rate remains consistent</li>
                  <li>✓ Model performance is stable</li>
                  <li>⚠ Minor fluctuation in confidence scores</li>
                  <li>✓ No significant anomalies detected</li>
                </ul>
              </div>

              <div className="bg-blue-500/5 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-700 mb-2">Recommendation</p>
                <p className="text-sm text-blue-600">
                  All metrics within normal parameters. Analysis quality is good. Continue monitoring with current safety measures.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
