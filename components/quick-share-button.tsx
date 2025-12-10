"use client"

import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { copyAnalysisToClipboard } from "@/lib/clipboard-service"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface QuickShareButtonProps {
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
}

export function QuickShareButton({
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
}: QuickShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyAnalysisToClipboard({
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
    })

    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`gap-2 transition-all ${
              copied ? 'bg-green-500/10 text-green-600 border-green-600' : ''
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Report
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy formatted analysis report to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
