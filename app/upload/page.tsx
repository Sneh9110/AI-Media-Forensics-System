"use client"

import { useState } from "react"
import { ArrowLeft, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadZone } from "@/components/upload-zone"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      console.log("[v0] No files to analyze")
      return
    }

    console.log("[v0] Starting analysis for", uploadedFiles.length, "files")
    setIsAnalyzing(true)

    try {
      // Create analysis entries for each file
      const analysisPromises = uploadedFiles.map(async (file) => {
        console.log("[v0] Analyzing file:", file.name)

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        })

        console.log("[v0] API response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] API error:", errorText)
          throw new Error(`Failed to analyze ${file.name}: ${errorText}`)
        }

        const result = await response.json()
        console.log("[v0] Analysis result:", result)
        return result
      })

      const results = await Promise.all(analysisPromises)
      console.log("[v0] All analyses completed:", results)

      // Redirect to analysis dashboard with the first result
      if (results.length > 0) {
        console.log("[v0] Redirecting to analysis:", results[0].id)
        router.push(`/analysis/${results[0].id}`)
      }
    } catch (error) {
      console.error("[v0] Analysis failed:", error)
      alert(`Analysis failed: ${error.message}`)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Media Analysis</h1>
            </div>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Upload Media for Analysis</h2>
            <p className="text-lg text-muted-foreground">
              Upload images or videos to detect AI-generated content using advanced forensic analysis
            </p>
          </div>

          {/* Upload Section */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <UploadZone onFilesUploaded={handleFilesUploaded} />

              {/* Analysis Controls */}
              {uploadedFiles.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <Zap className="mr-2 h-5 w-5 text-primary" />
                      Ready for Analysis
                    </CardTitle>
                    <CardDescription>
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} ready to be analyzed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={startAnalysis} disabled={isAnalyzing} size="lg" className="w-full pulse-glow">
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" />
                          Start Forensic Analysis
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Analysis Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Metadata Extraction</h4>
                      <p className="text-sm text-muted-foreground">Extract file properties and EXIF data</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Spatial Analysis</h4>
                      <p className="text-sm text-muted-foreground">Detect compression artifacts and residuals</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-chart-3/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-chart-3 rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Frequency Domain</h4>
                      <p className="text-sm text-muted-foreground">Analyze DCT and FFT patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-chart-4/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-chart-4 rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">ML Classification</h4>
                      <p className="text-sm text-muted-foreground">Generate authenticity prediction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Security Notice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All uploaded files are processed securely and automatically deleted after analysis. No data is
                    stored permanently without your consent.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
