"use client"

import { Download, FileJson, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { exportAnalysisResult, exportToCSV, exportToJSON, downloadFile, generateFileName } from "@/lib/export-service"

interface AnalysisExportButtonsProps {
  analysisId: string
  fileName: string
  prediction: 'real' | 'synthetic'
  confidence: number
  spatialScore: number
  frequencyScore: number
  aiGenerationScore: number
  deepfakeScore: number
  manipulationScore: number
  prnuSensorScore: number
  processingTime: number
  uploadedAt: string
  ensembleScore?: number
  consensusStrength?: number
}

export function AnalysisExportButtons({
  analysisId,
  fileName,
  prediction,
  confidence,
  spatialScore,
  frequencyScore,
  aiGenerationScore,
  deepfakeScore,
  manipulationScore,
  prnuSensorScore,
  processingTime,
  uploadedAt,
  ensembleScore,
  consensusStrength,
}: AnalysisExportButtonsProps) {
  const result = {
    id: analysisId,
    fileName,
    uploadedAt,
    prediction,
    confidence,
    processingTime,
    metadata: {
      spatialScore,
      frequencyScore,
      aiGenerationScore,
      deepfakeScore,
      manipulationScore,
      prnuSensorScore,
    },
    ensembleAnalysis: ensembleScore ? {
      finalScore: ensembleScore,
      consensusStrength: consensusStrength || 0,
      detectorsUsed: 3,
    } : undefined,
  }

  const handleExportCSV = () => {
    const csvContent = exportToCSV(result)
    const csvFileName = generateFileName(fileName.replace(/\.[^/.]+$/, ''), 'csv')
    downloadFile(csvContent, csvFileName, 'text/csv')
  }

  const handleExportJSON = () => {
    const jsonContent = exportToJSON(result, true)
    const jsonFileName = generateFileName(fileName.replace(/\.[^/.]+$/, ''), 'json')
    downloadFile(jsonContent, jsonFileName, 'application/json')
  }

  const handleExportBoth = () => {
    exportAnalysisResult(result, 'both')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 hover:bg-primary/10"
        >
          <Download className="h-4 w-4" />
          Export Results
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4 text-yellow-500" />
          <span>Export as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportBoth} className="gap-2 cursor-pointer font-semibold">
          <Download className="h-4 w-4 text-green-500" />
          <span>Export Both (CSV + JSON)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
