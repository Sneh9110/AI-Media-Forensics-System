"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, TrendingUp, TrendingDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { advancedSearch, FilterCriteria } from "@/lib/advanced-search"
import type { AnalysisResult } from "@/lib/database"

interface AdvancedSearchProps {
  analyses: AnalysisResult[]
  onFilterChange: (filtered: AnalysisResult[]) => void
}

export function AdvancedSearchBar({ analyses, onFilterChange }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    searchTerm: "",
    prediction: "all",
    confidenceRange: { min: 0, max: 100 },
    status: "all",
    sortBy: "date",
    sortOrder: "desc",
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const filtered = advancedSearch.filterAnalyses(analyses, filters)
    onFilterChange(filtered)
    setStats(advancedSearch.getFilterStats(filtered))
  }, [filters, analyses, onFilterChange])

  const handleReset = () => {
    setFilters({
      searchTerm: "",
      prediction: "all",
      confidenceRange: { min: 0, max: 100 },
      status: "all",
      sortBy: "date",
      sortOrder: "desc",
    })
  }

  const isFiltered =
    filters.searchTerm ||
    filters.prediction !== "all" ||
    filters.confidenceRange?.min !== 0 ||
    filters.confidenceRange?.max !== 100 ||
    filters.status !== "all"

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename, ID, or type..."
            value={filters.searchTerm}
            onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button
          variant={showAdvanced ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Advanced
        </Button>
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Prediction Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prediction</label>
                <Select
                  value={filters.prediction}
                  onValueChange={value =>
                    setFilters({ ...filters, prediction: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="real">Authentic</SelectItem>
                    <SelectItem value="synthetic">AI-Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={value =>
                    setFilters({ ...filters, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={value =>
                    setFilters({ ...filters, sortBy: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={value =>
                    setFilters({ ...filters, sortOrder: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Confidence Range Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confidence Range: {filters.confidenceRange?.min}% - {filters.confidenceRange?.max}%
              </label>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[filters.confidenceRange?.min || 0, filters.confidenceRange?.max || 100]}
                onValueChange={([min, max]) =>
                  setFilters({
                    ...filters,
                    confidenceRange: { min, max },
                  })
                }
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Authentic</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{stats.realCount}</p>
                {stats.realCount > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">AI-Generated</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{stats.syntheticCount}</p>
                {stats.syntheticCount > 0 && <TrendingDown className="h-4 w-4 text-red-500" />}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">{stats.completedCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <p className="text-2xl font-bold text-foreground">
                {(stats.averageConfidence * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
