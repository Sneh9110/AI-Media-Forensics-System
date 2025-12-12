"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FeatureImportance {
  feature: string
  importance: number
  evidence: string
  category: "frequency" | "spatial" | "color" | "other"
}

interface ExplanationViewerProps {
  explanation: {
    decision: "real" | "synthetic"
    confidence: number
    features: FeatureImportance[]
    counterfactuals?: string[]
    limitations?: string[]
  }
  forensicMode?: boolean
}

/**
 * Explanation Viewer Component
 * Displays LIME-based feature importance for AI detection decisions
 */
export function ExplanationViewer({ explanation, forensicMode = false }: ExplanationViewerProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const sortedFeatures = [...explanation.features].sort((a, b) => b.importance - a.importance)
  const topFeatures = sortedFeatures.slice(0, 5)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detection Explanation</CardTitle>
          <CardDescription>
            Feature importance analysis for {explanation.decision === "synthetic" ? "synthetic" : "authentic"}{" "}
            classification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Classification</span>
              <Badge variant={explanation.decision === "synthetic" ? "destructive" : "default"}>
                {explanation.decision.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Confidence Level</span>
                <span className="font-semibold text-gray-900">
                  {(explanation.confidence * 100).toFixed(2)}%
                </span>
              </div>
              <Progress value={explanation.confidence * 100} className="h-2" />
            </div>
          </div>

          {/* Top Contributing Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Top Contributing Features</h3>
            <div className="space-y-3">
              {topFeatures.map((feature, idx) => (
                <div key={feature.feature} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedFeature(expandedFeature === feature.feature ? null : feature.feature)
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">#{idx + 1}</span>
                        <span className="text-sm font-medium text-gray-700">{feature.feature}</span>
                        <Badge variant="outline" className="text-xs">
                          {feature.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={feature.importance * 100} className="h-1.5 flex-1" />
                        <span className="text-sm font-semibold text-gray-900 ml-2">
                          {(feature.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedFeature === feature.feature ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {expandedFeature === feature.feature && (
                    <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold">Evidence:</span> {feature.evidence}
                      </p>
                      {forensicMode && (
                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-900">
                          This feature is admissible in forensic analysis per peer-reviewed standards
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* All Features */}
          {sortedFeatures.length > topFeatures.length && (
            <div className="border-t pt-4">
              <details className="group">
                <summary className="cursor-pointer font-semibold text-gray-900 hover:text-indigo-600">
                  View all {sortedFeatures.length} features
                </summary>
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {sortedFeatures.slice(topFeatures.length).map((feature) => (
                    <div key={feature.feature} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{feature.feature}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={feature.importance * 100} className="h-1.5 w-24" />
                        <span className="text-xs font-semibold text-gray-900 w-12 text-right">
                          {(feature.importance * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Counterfactuals */}
      {explanation.counterfactuals && explanation.counterfactuals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What-If Scenarios</CardTitle>
            <CardDescription>Alternative outcomes if key features were different</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {explanation.counterfactuals.map((cf, idx) => (
                <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                  {cf}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Limitations */}
      {explanation.limitations && explanation.limitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Limitations & Caveats</CardTitle>
            <CardDescription>Important considerations for this analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {explanation.limitations.map((lim, idx) => (
                <div key={idx} className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{lim}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Feature Importance Chart Component
 * Displays feature importance as interactive bar chart
 */
interface FeatureImportanceChartProps {
  features: FeatureImportance[]
  maxFeatures?: number
}

export function FeatureImportanceChart({ features, maxFeatures = 10 }: FeatureImportanceChartProps) {
  const sortedFeatures = [...features].sort((a, b) => b.importance - a.importance)
  const displayFeatures = sortedFeatures.slice(0, maxFeatures)

  const colorMap: Record<string, string> = {
    frequency: "bg-purple-500",
    spatial: "bg-blue-500",
    color: "bg-red-500",
    other: "bg-gray-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Importance Ranking</CardTitle>
        <CardDescription>Top {displayFeatures.length} most important features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayFeatures.map((feature, idx) => (
            <div key={feature.feature}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-semibold text-sm text-gray-900">
                    {idx + 1}. {feature.feature}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">({feature.category})</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{(feature.importance * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-6 bg-gray-100 rounded overflow-hidden">
                <div
                  className={`h-full ${colorMap[feature.category] || colorMap.other} transition-all duration-500`}
                  style={{ width: `${feature.importance * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Attention Map Viewer Component
 * Visualizes heatmap of important regions in image
 */
interface AttentionMapViewerProps {
  imageUrl: string
  heatmapUrl: string
  title?: string
  description?: string
}

export function AttentionMapViewer({ imageUrl, heatmapUrl, title, description }: AttentionMapViewerProps) {
  const [overlayOpacity, setOverlayOpacity] = useState(0.6)
  const [showHeatmap, setShowHeatmap] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Attention Map Analysis"}</CardTitle>
        <CardDescription>
          {description || "Regions highlighted indicate areas most important to the classification decision"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image with Heatmap Overlay */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
          <img src={imageUrl} alt="Analysis" className="w-full h-full object-cover" />
          {showHeatmap && (
            <img
              src={heatmapUrl}
              alt="Heatmap"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: overlayOpacity }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">Heatmap Opacity</label>
              <span className="text-sm text-gray-600">{(overlayOpacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {showHeatmap ? "Hide" : "Show"} Heatmap
          </button>
        </div>

        {/* Color Legend */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Interpretation</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>High importance (strong indicator)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>Medium importance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Low importance</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Model Comparison Component
 * Display predictions from multiple models side-by-side
 */
interface ModelPredictionComparison {
  modelName: string
  prediction: "real" | "synthetic"
  confidence: number
  processingTime: number
  explanation: string[]
}

interface ModelComparisonProps {
  predictions: ModelPredictionComparison[]
  finalDecision?: "real" | "synthetic"
}

export function ModelComparison({ predictions, finalDecision }: ModelComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Ensemble Comparison</CardTitle>
        <CardDescription>Individual model predictions and confidence levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((pred) => (
            <div
              key={pred.modelName}
              className={`p-4 rounded-lg border-2 ${
                pred.prediction === "synthetic"
                  ? "border-red-300 bg-red-50"
                  : "border-green-300 bg-green-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{pred.modelName}</h4>
                  <p className="text-sm text-gray-600">{pred.processingTime}ms processing time</p>
                </div>
                <Badge
                  variant={pred.prediction === "synthetic" ? "destructive" : "default"}
                  className="text-sm"
                >
                  {pred.prediction.toUpperCase()}
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">Confidence</span>
                  <span className="font-semibold text-gray-900">
                    {(pred.confidence * 100).toFixed(2)}%
                  </span>
                </div>
                <Progress value={pred.confidence * 100} />
              </div>

              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  View explanation
                </summary>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  {pred.explanation.map((exp, idx) => (
                    <p key={idx} className="bullet">
                      • {exp}
                    </p>
                  ))}
                </div>
              </details>
            </div>
          ))}

          {finalDecision && (
            <div className="mt-4 p-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg">
              <p className="text-sm text-gray-600">Final Ensemble Decision</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-gray-900">
                  {finalDecision.toUpperCase()}
                </span>
                <Badge variant={finalDecision === "synthetic" ? "destructive" : "default"}>
                  Consensus
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
