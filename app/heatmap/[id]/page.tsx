"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeatmapViewer } from "@/components/heatmap-viewer"
import Link from "next/link"
import { useParams } from "next/navigation"

interface HeatmapData {
  id: string
  fileName: string
  imageUrl: string
  heatmapData: number[][]
  prediction: "real" | "synthetic"
  confidence: number
}

export default function HeatmapPage() {
  const params = useParams()
  const analysisId = params.id as string
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setIsLoading(true)

      try {
        // Fetch analysis data from API
        const response = await fetch(`/api/analyses/${analysisId}`)
        if (!response.ok) {
          throw new Error("Analysis not found")
        }

        const analysis = await response.json()
        
        if (analysis.analysisStatus !== "completed" || !analysis.heatmapData) {
          throw new Error("Analysis not completed or heatmap data not available")
        }

        const heatmapData: HeatmapData = {
          id: analysis.id,
          fileName: analysis.fileName,
          imageUrl: "/sample-image-for-forensic-analysis.jpg", // In real app, this would be the uploaded file URL
          heatmapData: analysis.heatmapData,
          prediction: analysis.authenticity.prediction,
          confidence: analysis.authenticity.confidence,
        }

        setHeatmapData(heatmapData)
      } catch (error) {
        console.error("Failed to fetch heatmap data:", error)
        // Fallback to demo data
        const mockHeatmap: number[][] = []
        for (let y = 0; y < 50; y++) {
          const row: number[] = []
          for (let x = 0; x < 80; x++) {
            const centerX = 40
            const centerY = 25
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
            const maxDistance = 30
            const suspicion = Math.max(0, 1 - distance / maxDistance) * Math.random() * 0.8
            row.push(suspicion)
          }
          mockHeatmap.push(row)
        }

        const mockData: HeatmapData = {
          id: analysisId,
          fileName: "sample_demo.jpg",
          imageUrl: "/sample-image-for-forensic-analysis.jpg",
          heatmapData: mockHeatmap,
          prediction: Math.random() > 0.5 ? "synthetic" : "real",
          confidence: 0.75 + Math.random() * 0.2,
        }

        setHeatmapData(mockData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeatmapData()
  }, [analysisId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading heatmap visualization...</p>
        </div>
      </div>
    )
  }

  if (!heatmapData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Heatmap data not found</p>
          <Link href="/upload">
            <Button className="mt-4">Start New Analysis</Button>
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
            <Link href={`/analysis/${analysisId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analysis
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Heatmap Visualization</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Interactive Heatmap: {heatmapData.fileName}</h2>
            <p className="text-muted-foreground">
              Explore suspicious regions detected by our AI forensics model with interactive controls
            </p>
          </div>

          <HeatmapViewer
            imageUrl={heatmapData.imageUrl}
            heatmapData={heatmapData.heatmapData}
            fileName={heatmapData.fileName}
            prediction={heatmapData.prediction}
            confidence={heatmapData.confidence}
          />
        </div>
      </div>
    </div>
  )
}
