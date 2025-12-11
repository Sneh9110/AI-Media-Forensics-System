"use client"

import { useState } from "react"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BatchUploadModal } from "@/components/batch-upload-modal"
import { BatchProgressTracker } from "@/components/batch-progress-tracker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import type { BatchJob } from "@/lib/batch-processor"

export default function BatchProcessingPage() {
  const [activeBatch, setActiveBatch] = useState<BatchJob | null>(null)
  const [batchHistory, setBatchHistory] = useState<BatchJob[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBatchCreated = (batch: BatchJob) => {
    setActiveBatch(batch)
    setBatchHistory((prev) => [batch, ...prev])
  }

  const handleCancelBatch = () => {
    if (activeBatch) {
      setActiveBatch(null)
    }
  }

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
                <h1 className="text-xl font-bold text-foreground">Batch Processing</h1>
                <p className="text-xs text-muted-foreground">Analyze multiple images in parallel</p>
              </div>
            </div>
          </div>
          <BatchUploadModal open={isModalOpen} onOpenChange={setIsModalOpen} onBatchCreated={handleBatchCreated} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Active Batch */}
        {activeBatch ? (
          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="progress">Active Batch</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="mt-6">
              <BatchProgressTracker
                batch={activeBatch}
                onCancel={handleCancelBatch}
                onPause={() => {
                  if (activeBatch) {
                    setActiveBatch({ ...activeBatch, status: "pending" })
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <HistoryView batches={batchHistory} onSelectBatch={setActiveBatch} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid gap-6">
            {/* Empty State */}
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No Active Batch</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create a new batch job to start processing multiple images in parallel
                </p>
                <BatchUploadModal open={isModalOpen} onOpenChange={setIsModalOpen} onBatchCreated={handleBatchCreated} />
              </CardContent>
            </Card>

            {/* Batch History */}
            {batchHistory.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Recent Batches</h2>
                <HistoryView batches={batchHistory} onSelectBatch={setActiveBatch} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Batch History Component
function HistoryView({
  batches,
  onSelectBatch,
}: {
  batches: BatchJob[]
  onSelectBatch: (batch: BatchJob) => void
}) {
  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          No batch history yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {batches.map((batch) => (
        <Card key={batch.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1" onClick={() => onSelectBatch(batch)}>
                <h3 className="font-semibold">{batch.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {batch.totalFiles} files • {batch.processedFiles} processed • {new Date(batch.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{Math.round(batch.progress)}%</div>
                <p className="text-xs text-muted-foreground capitalize">{batch.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
