"use client"

import { useState } from "react"
import { ArrowLeft, BarChart3, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvancedAnalyticsDashboard } from "@/components/advanced-analytics-dashboard"
import { ThreatIntelligenceCard } from "@/components/threat-intelligence-card"
import { ComparativeAnalysisView } from "@/components/comparative-analysis-view"
import Link from "next/link"

export default function AnalyticsPage() {
  const [selectedBatch, setSelectedBatch] = useState("batch_001")

  const recentBatches = [
    { id: "batch_001", name: "Social Media Images - Dec 11", date: "2024-12-11", analyses: 156 },
    { id: "batch_002", name: "User Submissions - Dec 10", date: "2024-12-10", analyses: 89 },
    { id: "batch_003", name: "Bulk Import - Dec 09", date: "2024-12-09", analyses: 234 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/upload">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Advanced Analytics & Intelligence</h1>
                <p className="text-xs text-muted-foreground">Pattern detection, anomaly analysis, threat assessment</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Pattern Analysis</TabsTrigger>
            <TabsTrigger value="threat">Threat Intelligence</TabsTrigger>
            <TabsTrigger value="comparative">Comparative View</TabsTrigger>
          </TabsList>

          {/* Pattern Analysis Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Batch Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Select Analysis Batch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {recentBatches.map((batch) => (
                      <button
                        key={batch.id}
                        onClick={() => setSelectedBatch(batch.id)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          selectedBatch === batch.id
                            ? "bg-primary/10 border-primary"
                            : "bg-secondary/50 border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-semibold text-sm">{batch.name}</p>
                        <p className="text-xs text-muted-foreground">{batch.analyses} analyses</p>
                        <p className="text-xs text-muted-foreground mt-1">{batch.date}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Analytics */}
              <AdvancedAnalyticsDashboard
                batchId={selectedBatch}
                analysesCount={156}
                syntheticRate={42.5}
                patterns={[
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
                ]}
                anomalies={[
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
                ]}
              />
            </div>
          </TabsContent>

          {/* Threat Intelligence Tab */}
          <TabsContent value="threat" className="mt-6">
            <div className="space-y-6">
              {/* Threat Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Critical Threats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive">12</div>
                    <p className="text-xs text-muted-foreground mt-1">requiring immediate action</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Threat Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Risk Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">Stable</div>
                    <p className="text-xs text-muted-foreground mt-1">7-day outlook</p>
                  </CardContent>
                </Card>
              </div>

              {/* Individual Threat Assessments */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Sample Threat Assessments</h3>
                <ThreatIntelligenceCard
                  threatScore={78}
                  threatLevel="high_risk"
                  confidenceInDetection={0.89}
                  likelyManipulations={["Frequency Domain Artifacts", "Missing PRNU Signature", "Unusual Color Distribution"]}
                  recommendations={[
                    "Content shows high risk indicators",
                    "Human review strongly recommended",
                    "Consider removing from platform",
                  ]}
                />
                <ThreatIntelligenceCard
                  threatScore={42}
                  threatLevel="medium_risk"
                  confidenceInDetection={0.72}
                  likelyManipulations={["Compression Artifacts", "Minor Frequency Anomalies"]}
                  recommendations={[
                    "Content shows moderate risk indicators",
                    "Human review recommended",
                    "Request source metadata",
                  ]}
                />
                <ThreatIntelligenceCard
                  threatScore={15}
                  threatLevel="safe"
                  confidenceInDetection={0.95}
                  likelyManipulations={[]}
                  recommendations={[
                    "Content appears authentic",
                    "Safe to publish",
                    "Excellent quality indicators",
                  ]}
                />
              </div>
            </div>
          </TabsContent>

          {/* Comparative View Tab */}
          <TabsContent value="comparative" className="mt-6">
            <ComparativeAnalysisView
              batchId={selectedBatch}
              totalAnalyses={156}
              syntheticPercentage={42.3}
              realPercentage={57.7}
              confidenceDistribution={[
                { range: "0-20%", count: 8 },
                { range: "20-40%", count: 15 },
                { range: "40-60%", count: 32 },
                { range: "60-80%", count: 52 },
                { range: "80-100%", count: 49 },
              ]}
              detectionMethodBreakdown={{ airia: 68, pytorch: 72, prnu: 45 }}
              comparisonBatches={[
                { name: "Batch A", syntheticRate: 38.5, date: "2024-12-05" },
                { name: "Batch B", syntheticRate: 45.2, date: "2024-12-08" },
                { name: "Current", syntheticRate: 42.3, date: "2024-12-11" },
              ]}
            />
          </TabsContent>
        </Tabs>

        {/* Export Options */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Export Analytics</CardTitle>
            <CardDescription>Download detailed reports and intelligence assessments</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline">Export Analytics Report (JSON)</Button>
            <Button variant="outline">Export Threat Intelligence (PDF)</Button>
            <Button variant="outline">Export Comparative Analysis (CSV)</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
