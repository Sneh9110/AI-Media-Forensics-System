"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"

interface HeatmapViewerProps {
  imageUrl: string
  heatmapData: number[][]
  fileName: string
  prediction: "real" | "synthetic"
  confidence: number
}

export function HeatmapViewer({ imageUrl, heatmapData, fileName, prediction, confidence }: HeatmapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [opacity, setOpacity] = useState([0.6])
  const [zoom, setZoom] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Draw heatmap overlay if enabled
      if (showHeatmap && heatmapData.length > 0) {
        drawHeatmap(ctx, heatmapData, canvas.width, canvas.height, opacity[0])
      }
    }
    img.src = imageUrl
  }, [imageUrl, heatmapData, showHeatmap, opacity, imageLoaded])

  const drawHeatmap = (
    ctx: CanvasRenderingContext2D,
    data: number[][],
    width: number,
    height: number,
    alpha: number,
  ) => {
    const cellWidth = width / data[0].length
    const cellHeight = height / data.length

    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < data[y].length; x++) {
        const intensity = data[y][x]
        if (intensity > 0.1) {
          // Only show significant suspicious regions
          const red = Math.floor(255 * intensity)
          const green = Math.floor(255 * (1 - intensity))
          ctx.fillStyle = `rgba(${red}, ${green}, 0, ${alpha * intensity})`
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
        }
      }
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const downloadHeatmap = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${fileName}_heatmap.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const resetView = () => {
    setZoom(1)
    setOpacity([0.6])
    setShowHeatmap(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center">
              <Eye className="mr-2 h-5 w-5 text-accent" />
              Heatmap Visualization
            </div>
            <Badge
              variant={prediction === "real" ? "default" : "destructive"}
              className={prediction === "real" ? "bg-green-500/20 text-green-500 border-green-500/30" : ""}
            >
              {prediction === "real" ? "AUTHENTIC" : "SYNTHETIC"} ({Math.round(confidence * 100)}%)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {prediction === "synthetic"
              ? "Red/orange regions indicate areas with high probability of AI generation or manipulation."
              : "Minimal suspicious regions detected, indicating authentic content."}
          </p>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
              <label className="text-sm font-medium text-foreground">Show Heatmap</label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Opacity</label>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
                disabled={!showHeatmap}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Zoom</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-12 text-center">{zoom}x</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={downloadHeatmap}>
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative overflow-auto max-h-96 border border-border rounded-lg">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ display: imageLoaded ? "block" : "none" }}
              />
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={fileName}
                onLoad={handleImageLoad}
                style={{ display: "none" }}
                crossOrigin="anonymous"
              />
              {!imageLoaded && (
                <div className="flex items-center justify-center h-64 bg-muted">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading image...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Heatmap Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm text-foreground">Low Suspicion (0-30%)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-sm text-foreground">Medium Suspicion (30-70%)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm text-foreground">High Suspicion (70-100%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
