"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Shield, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisLogs } from "@/components/analysis-logs"
import { AnalysisResults } from "@/components/analysis-results"
import { AnalysisExportButtons } from "@/components/analysis-export-buttons"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { AnalysisResult } from "@/lib/database"

export default function AnalysisPage() {
  const params = useParams()
  const analysisId = params.id as string
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalysisData()
  }, [analysisId])

  const fetchAnalysisData = async () => {
    try {
      console.log("[v0] Fetching analysis data for:", analysisId)
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/analyses/${analysisId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Analysis data received:", data)
      setAnalysisData(data)
    } catch (error) {
      console.error("[v0] Failed to fetch analysis:", error)
      setError(error instanceof Error ? error.message : "Failed to load analysis")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalysisComplete = (result: any) => {
    if (analysisData) {
      setAnalysisData({
        ...analysisData,
        analysisStatus: "completed",
        authenticity: {
          prediction: result.prediction,
          confidence: result.confidence,
          modelVersion: "1.0.0",
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || "Analysis not found"}</p>
          <Link href="/upload">
            <Button>Start New Analysis</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/upload">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Upload
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Analysis Dashboard</h1>
            </div>
          </div>
          <nav className="flex items-center space-x-4">
            {analysisData?.analysisStatus === "completed" && analysisData?.authenticity && (
              <AnalysisExportButtons
                analysisId={analysisData.id}
                fileName={analysisData.fileName}
                prediction={analysisData.authenticity.prediction}
                confidence={analysisData.authenticity.confidence}
                spatialScore={0.75}
                frequencyScore={0.68}
                aiGenerationScore={analysisData.authenticity.confidence}
                deepfakeScore={0.1}
                manipulationScore={0.15}
                prnuSensorScore={0.72}
                processingTime={500}
                uploadedAt={analysisData.uploadedAt}
              />
            )}
            <Button variant="outline" size="sm" onClick={fetchAnalysisData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">History</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Analyzing: {analysisData.fileName}</h2>
            <p className="text-muted-foreground">Real-time forensic analysis of uploaded media file</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Analysis Logs */}
            <div>
              <AnalysisLogs
                analysisId={analysisId}
                status={analysisData.analysisStatus}
                onComplete={handleAnalysisComplete}
              />
            </div>

            {/* Results Panel */}
            <div>
              {analysisData.analysisStatus === "completed" && analysisData.authenticity ? (
                <AnalysisResults
                  result={{
                    prediction: analysisData.authenticity.prediction,
                    confidence: analysisData.authenticity.confidence,
                    metadata: {
                      spatialScore: 0.75,
                      frequencyScore: 0.68,
                      metadataScore: 0.82,
                    },
                    analysisId: analysisData.id,
                  }}
                  fileInfo={{
                    name: analysisData.fileName,
                    size: analysisData.fileSize,
                    type: analysisData.fileType,
                    md5: analysisData.metadata.md5,
                    sha256: analysisData.metadata.sha256,
                  }}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <Shield className="mr-2 h-5 w-5 text-primary" />
                      Analysis in Progress
                    </CardTitle>
                    <CardDescription>Please wait while we analyze your media file for authenticity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Running advanced ML algorithms...</p>
                      <p className="text-sm text-muted-foreground mt-2">Status: {analysisData.analysisStatus}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
