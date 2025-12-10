"use client"

import { useState } from "react"
import { Heart, Trash2, Tag, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { favoritesService, FavoriteAnalysis } from "@/lib/favorites-service"

interface FavoriteButtonProps {
  analysisId: string
  fileName: string
  prediction: 'real' | 'synthetic'
  confidence: number
  onFavoriteChange?: (isFavorited: boolean) => void
}

export function FavoriteButton({
  analysisId,
  fileName,
  prediction,
  confidence,
  onFavoriteChange,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(() =>
    favoritesService.isFavorited(analysisId)
  )
  const [openNotes, setOpenNotes] = useState(false)
  const [openTags, setOpenTags] = useState(false)
  const [notes, setNotes] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const handleToggleFavorite = () => {
    if (isFavorited) {
      favoritesService.removeFavorite(analysisId)
      setIsFavorited(false)
    } else {
      favoritesService.addFavorite({
        id: analysisId,
        fileName,
        authenticity: { prediction, confidence, modelVersion: "1.0.0" },
        uploadedAt: new Date().toISOString(),
        fileSize: 0,
        fileType: "",
        analysisStatus: "completed",
        metadata: { md5: "", sha256: "" },
        userId: "anonymous",
      } as any)
      setIsFavorited(true)
    }
    onFavoriteChange?.(!isFavorited)
  }

  const handleSaveNotes = () => {
    if (notes.trim()) {
      favoritesService.addNote(analysisId, notes)
      setOpenNotes(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
        favoritesService.addTags(analysisId, [newTag])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    const updatedTags = tags.filter(t => t !== tag)
    setTags(updatedTags)
    // Note: Ideally, we'd have a removeTag method in the service
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isFavorited ? "default" : "outline"}
        size="sm"
        onClick={handleToggleFavorite}
        className={isFavorited ? "bg-red-500 hover:bg-red-600" : ""}
      >
        <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        {isFavorited ? "Favorited" : "Favorite"}
      </Button>

      {isFavorited && (
        <>
          <Dialog open={openNotes} onOpenChange={setOpenNotes}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Notes</DialogTitle>
                <DialogDescription>Add personal notes to this favorite analysis</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add notes about this analysis..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button onClick={handleSaveNotes} className="w-full">
                  Save Notes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openTags} onOpenChange={setOpenTags}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tags</DialogTitle>
                <DialogDescription>Organize your favorites with tags</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tag name..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} size="sm">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
