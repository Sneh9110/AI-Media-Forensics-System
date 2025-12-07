"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, AlertCircle, Zap, Eye, Hash, Waves } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  step: string
  status: "pending" | "processing" | "completed" | "error"
  message: string
  details?: string
  duration?: number
}

interface AnalysisLogsProps {
  analysisId: string
  status: "pending" | "processing" | "completed" | "failed"
  onComplete?: (result: any) => void
}

export function AnalysisLogs({ analysisId, status, onComplete }: AnalysisLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const analysisSteps = [
    {
      id: "metadata",
      name: "Metadata Extraction",
      icon: Hash,
      description: "Extracting file properties and EXIF data",
    },
    {
      id: "spatial",
      name: "Spatial Analysis",
      icon: Eye,
      description: "Analyzing compression artifacts and residuals",
    },
    {
      id: "frequency",
      name: "Frequency Domain",
      icon: Waves,
      description: "Performing DCT and FFT analysis",
    },
    {
      id: "classification",
      name: "ML Classification",
      icon: Zap,
      description: "Generating authenticity prediction",
    },
  ]

  useEffect(() => {
    if (status === "completed") {
      setCurrentStep(analysisSteps.length)
      return
    }

    if (status === "processing") {
      simulateAnalysis()
    }
  }, [analysisId, status])

  const simulateAnalysis = async () => {
    if (status === "completed") return

    for (let i = 0; i < analysisSteps.length; i++) {
      const step = analysisSteps[i]
      setCurrentStep(i)

      // Add processing log
      const processingLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString(),
        step: step.id,
        status: "processing",
        message: `Starting ${step.name.toLowerCase()}...`,
        details: step.description,
      }
      setLogs((prev) => [...prev, processingLog])

      // Simulate processing time
      const processingTime = 2000 + Math.random() * 3000
      await new Promise((resolve) => setTimeout(resolve, processingTime))

      // Add completion log
      const completedLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString(),
        step: step.id,
        status: "completed",
        message: `${step.name} completed successfully`,
        duration: Math.round(processingTime),
      }
      setLogs((prev) => [...prev, completedLog])
    }

    // Final completion
    const finalLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      step: "complete",
      status: "completed",
      message: "Analysis completed successfully",
    }
    setLogs((prev) => [...prev, finalLog])

    // Simulate getting results
    if (onComplete) {
      const mockResult = {
        prediction: Math.random() > 0.5 ? "real" : "synthetic",
        confidence: 0.75 + Math.random() * 0.2,
      }
      onComplete(mockResult)
    }
  }

  const getStatusIcon = (status: LogEntry["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: LogEntry["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
            Processing
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Zap className="mr-2 h-5 w-5 text-primary" />
            Analysis Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep && status === "processing"
              const isCompleted = index < currentStep || status === "completed"
              const isPending = index > currentStep && status !== "completed"

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 pulse-glow"
                      : isCompleted
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-muted-foreground"
                      }`}
                    />
                    <h3
                      className={`font-medium text-sm ${
                        isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {isActive && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-1">
                        <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: "60%" }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Eye className="mr-2 h-5 w-5 text-accent" />
            Real-time Analysis Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">{getStatusIcon(log.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{log.message}</p>
                      {getStatusBadge(log.status)}
                    </div>
                    {log.details && <p className="text-xs text-muted-foreground mb-1">{log.details}</p>}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {log.duration && <span>Duration: {log.duration}ms</span>}
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>Waiting for analysis to begin...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
