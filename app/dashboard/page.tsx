"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Shield, Eye, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import type { AnalysisResult } from "@/lib/database"

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [predictionFilter, setPredictionFilter] = useState<string>("all")

  useEffect(() => {
    fetchAnalyses()
  }, [])

  useEffect(() => {
    filterAnalyses()
  }, [analyses, searchTerm, statusFilter, predictionFilter])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch("/api/analyses")
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data)
      }
    } catch (error) {
      console.error("Failed to fetch analyses:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAnalyses = () => {
    let filtered = analyses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((analysis) => analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((analysis) => analysis.analysisStatus === statusFilter)
    }

    // Prediction filter
    if (predictionFilter !== "all") {
      filtered = filtered.filter((analysis) => analysis.authenticity?.prediction === predictionFilter)
    }

    setFilteredAnalyses(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive",
    } as const

    const colors = {
      pending: "bg-chart-4/20 text-chart-4",
      processing: "bg-primary/20 text-primary",
      completed: "bg-chart-3/20 text-chart-3",
      failed: "bg-destructive/20 text-destructive",
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPredictionBadge = (prediction: string | undefined) => {
    if (!prediction) return null

    const colors = {
      real: "bg-chart-3/20 text-chart-3",
      synthetic: "bg-destructive/20 text-destructive",
    }

    return (
      <Badge className={colors[prediction as keyof typeof colors]}>
        {prediction === "real" ? "Authentic" : "AI-Generated"}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
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
              <h1 className="text-xl font-bold text-foreground">Analysis Dashboard</h1>
            </div>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/upload">
              <Button>New Analysis</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analyses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">
                {analyses.filter((a) => a.analysisStatus === "completed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI-Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {analyses.filter((a) => a.authenticity?.prediction === "synthetic").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Authentic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">
                {analyses.filter((a) => a.authenticity?.prediction === "real").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={predictionFilter} onValueChange={setPredictionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="real">Authentic</SelectItem>
                  <SelectItem value="synthetic">AI-Generated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Analysis History</CardTitle>
            <CardDescription>View and manage your media forensic analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No analyses found</p>
                <Link href="/upload">
                  <Button className="mt-4">
                    <Shield className="mr-2 h-4 w-4" />
                    Start Your First Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell className="font-medium">{analysis.fileName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{analysis.fileType.split("/")[1].toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(analysis.fileSize)}</TableCell>
                        <TableCell>{getStatusBadge(analysis.analysisStatus)}</TableCell>
                        <TableCell>
                          {analysis.authenticity ? getPredictionBadge(analysis.authenticity.prediction) : "-"}
                        </TableCell>
                        <TableCell>
                          {analysis.authenticity ? `${Math.round(analysis.authenticity.confidence * 100)}%` : "-"}
                        </TableCell>
                        <TableCell>{formatDate(analysis.uploadedAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {analysis.analysisStatus === "completed" && (
                              <>
                                <Link href={`/analysis/${analysis.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                {analysis.heatmapData && (
                                  <Link href={`/heatmap/${analysis.id}`}>
                                    <Button variant="ghost" size="sm">
                                      <Shield className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
