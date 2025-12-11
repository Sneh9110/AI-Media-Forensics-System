"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Clock, Pause, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BatchJob, BatchStatistics } from "@/lib/batch-processor"

interface BatchProgressTrackerProps {
  batch: BatchJob
  onCancel?: () => void
  onPause?: () => void
  onViewResults?: () => void
}

export function BatchProgressTracker({ batch, onCancel, onPause, onViewResults }: BatchProgressTrackerProps) {
  const [stats, setStats] = useState<BatchStatistics | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-500/20 text-blue-700"
      case "completed":
        return "bg-green-500/20 text-green-700"
      case "failed":
        return "bg-red-500/20 text-red-700"
      case "cancelled":
        return "bg-gray-500/20 text-gray-700"
      default:
        return "bg-yellow-500/20 text-yellow-700"
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{batch.name}</CardTitle>
              <CardDescription className="mt-1">Batch ID: {batch.id.substring(0, 20)}...</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(batch.status)}>
                {getStatusIcon(batch.status)}
                <span className="ml-1">{batch.status.toUpperCase()}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(batch.progress)}%</span>
            </div>
            <Progress value={batch.progress} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-card-secondary p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Files</p>
              <p className="text-2xl font-bold">{batch.totalFiles}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Processed</p>
              <p className="text-2xl font-bold text-green-600">{batch.processedFiles}</p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{batch.failedFiles}</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Time Remaining</p>
              <p className="text-sm font-bold text-blue-600">{batch.estimatedTimeRemaining}s</p>
            </div>
          </div>

          {/* Time Info */}
          <div className="flex justify-between text-sm text-muted-foreground border-t pt-3">
            <span>Time Elapsed: {formatTime(timeElapsed)}</span>
            <span>Estimated Completion: {new Date(Date.now() + batch.estimatedTimeRemaining * 1000).toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Errors Alert */}
      {batch.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{batch.errors.length} files failed to process</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">Results ({batch.results.length})</TabsTrigger>
          <TabsTrigger value="errors">Errors ({batch.errors.length})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Results Tab */}
        <TabsContent value="results">
          {batch.results.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Prediction</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batch.results.slice(0, 10).map((result, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-sm">{result.fileName}</TableCell>
                          <TableCell>
                            <Badge variant={result.prediction === "synthetic" ? "destructive" : "default"}>
                              {result.prediction.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{(result.processingTime / 1000).toFixed(2)}s</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {batch.results.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">Showing 10 of {batch.results.length} results</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">No results yet. Processing in progress...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors">
          {batch.errors.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {batch.errors.map((error, idx) => (
                    <div key={idx} className="p-3 bg-red-500/5 border border-red-200 rounded-lg">
                      <p className="font-medium text-sm">{error.fileName}</p>
                      <p className="text-xs text-red-600 mt-1">{error.error}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">No errors so far. Processing smoothly!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Created At</p>
                  <p className="text-sm">{batch.createdAt.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Priority</p>
                  <Badge variant="outline">{batch.metadata.priority.toUpperCase()}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{batch.metadata.description || "No description provided"}</p>
                </div>
                {batch.metadata.tags.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {batch.metadata.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {batch.status === "processing" && (
          <>
            <Button variant="outline" onClick={onPause} className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button variant="destructive" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </>
        )}
        {batch.status === "completed" && (
          <Button onClick={onViewResults} className="gap-2">
            View Full Report
          </Button>
        )}
      </div>
    </div>
  )
}
