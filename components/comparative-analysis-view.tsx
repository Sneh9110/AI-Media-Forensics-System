"use client"

import { BarChart3, GitCompare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ComparativeAnalysisViewProps {
  batchId?: string
  totalAnalyses?: number
  syntheticPercentage?: number
  realPercentage?: number
  confidenceDistribution?: { range: string; count: number }[]
  detectionMethodBreakdown?: { airia: number; pytorch: number; prnu: number }
  comparisonBatches?: Array<{ name: string; syntheticRate: number; date: string }>
}

export function ComparativeAnalysisView({
  batchId = "batch_001",
  totalAnalyses = 156,
  syntheticPercentage = 42.3,
  realPercentage = 57.7,
  confidenceDistribution = [
    { range: "0-20%", count: 8 },
    { range: "20-40%", count: 15 },
    { range: "40-60%", count: 32 },
    { range: "60-80%", count: 52 },
    { range: "80-100%", count: 49 },
  ],
  detectionMethodBreakdown = { airia: 68, pytorch: 72, prnu: 45 },
  comparisonBatches = [
    { name: "Batch A", syntheticRate: 38.5, date: "2024-12-05" },
    { name: "Batch B", syntheticRate: 45.2, date: "2024-12-08" },
    { name: "Current", syntheticRate: 42.3, date: "2024-12-11" },
  ],
}: ComparativeAnalysisViewProps) {
  const maxCount = Math.max(...(confidenceDistribution?.map((d) => d.count) || [1]))

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparative Analysis
          </CardTitle>
          <CardDescription>Batch {batchId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Synthetic vs Real */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Synthetic Detected</span>
                <span className="font-bold text-destructive">{syntheticPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={syntheticPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(totalAnalyses * (syntheticPercentage / 100))} of {totalAnalyses}</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Real Detected</span>
                <span className="font-bold text-green-600">{realPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={realPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(totalAnalyses * (realPercentage / 100))} of {totalAnalyses}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown Tabs */}
      <Tabs defaultValue="confidence" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="confidence">Confidence Distribution</TabsTrigger>
          <TabsTrigger value="methods">Detection Methods</TabsTrigger>
          <TabsTrigger value="comparison">Batch Comparison</TabsTrigger>
        </TabsList>

        {/* Confidence Distribution */}
        <TabsContent value="confidence" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Confidence Score Distribution</CardTitle>
              <CardDescription>How confident is the AI in each prediction?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {confidenceDistribution?.map((item) => (
                <div key={item.range}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.range}</span>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="w-full bg-secondary/30 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
                      {((item.count / totalAnalyses) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}

              <div className="bg-blue-500/5 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm font-semibold text-blue-700 mb-1">Insight</p>
                <p className="text-sm text-blue-600">
                  High concentration in the 60-100% range indicates confident predictions. {Math.round(((confidenceDistribution?.[3]?.count || 0 + confidenceDistribution?.[4]?.count || 0) / totalAnalyses) * 100)}% of results are highly confident.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detection Methods */}
        <TabsContent value="methods" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detection Method Agreement</CardTitle>
              <CardDescription>Performance across different detection algorithms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Badge variant="outline">AIRIA AI</Badge>
                  </span>
                  <span className="font-bold">{detectionMethodBreakdown?.airia || 0}%</span>
                </div>
                <Progress value={detectionMethodBreakdown?.airia || 0} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">Detected synthetic in {Math.round(totalAnalyses * ((detectionMethodBreakdown?.airia || 0) / 100))} analyses</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Badge variant="outline">PyTorch ML</Badge>
                  </span>
                  <span className="font-bold">{detectionMethodBreakdown?.pytorch || 0}%</span>
                </div>
                <Progress value={detectionMethodBreakdown?.pytorch || 0} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">Detected synthetic in {Math.round(totalAnalyses * ((detectionMethodBreakdown?.pytorch || 0) / 100))} analyses</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Badge variant="outline">PRNU Fingerprint</Badge>
                  </span>
                  <span className="font-bold">{detectionMethodBreakdown?.prnu || 0}%</span>
                </div>
                <Progress value={detectionMethodBreakdown?.prnu || 0} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">Found sensor fingerprints in {Math.round(totalAnalyses * ((detectionMethodBreakdown?.prnu || 0) / 100))} analyses</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Consensus</p>
                  <p className="font-bold">2/3</p>
                  <p className="text-xs text-muted-foreground">methods agree</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Avg Agreement</p>
                  <p className="font-bold">68%</p>
                  <p className="text-xs text-muted-foreground">across methods</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <p className="font-bold">High</p>
                  <p className="text-xs text-muted-foreground">results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Comparison */}
        <TabsContent value="comparison" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historical Batch Comparison</CardTitle>
              <CardDescription>How does this batch compare to recent analyses?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {comparisonBatches?.map((batch, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-sm">{batch.name}</p>
                      <p className="text-xs text-muted-foreground">{batch.date}</p>
                    </div>
                    {batch.name === "Current" && <Badge>Latest</Badge>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Synthetic Rate</span>
                      <span className="font-bold">{batch.syntheticRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={batch.syntheticRate} className="h-2" />
                  </div>
                </div>
              ))}

              <div className="bg-green-500/5 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-sm font-semibold text-green-700 mb-1">Comparison Summary</p>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>✓ Current batch is within historical range</li>
                  <li>✓ Synthetic detection consistent with recent patterns</li>
                  <li>✓ No significant anomalies compared to previous batches</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
