"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateFile, formatFileSize } from "@/lib/file-utils"

interface UploadedFile {
  file: File
  id: string
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
}

interface UploadZoneProps {
  onFilesUploaded: (files: File[]) => void
  maxFiles?: number
}

export function UploadZone({ onFilesUploaded, maxFiles = 5 }: UploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("[v0] Files dropped:", acceptedFiles.length)

      const newFiles: UploadedFile[] = acceptedFiles.map((file) => {
        const validation = validateFile(file)
        console.log("[v0] File validation:", file.name, validation)

        return {
          file,
          id: Math.random().toString(36).substring(2, 15),
          status: validation.valid ? "pending" : "error",
          progress: 0,
          error: validation.error,
        }
      })

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Only pass valid files to parent
      const validFiles = newFiles.filter((f) => f.status === "pending").map((f) => f.file)
      console.log("[v0] Valid files:", validFiles.length)

      if (validFiles.length > 0) {
        onFilesUploaded(validFiles)
      }
    },
    [onFilesUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
    maxFiles,
    multiple: true,
  })

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const clearAll = () => {
    setUploadedFiles([])
  }

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? "scale-105" : "hover:scale-102"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`p-4 rounded-full ${
                  isDragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                } transition-colors`}
              >
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragActive ? "Drop files here" : "Upload Media Files"}
                </h3>
                <p className="text-muted-foreground mb-4">Drag and drop your images or videos, or click to browse</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Supported formats: JPG, PNG, MP4, MOV, AVI</p>
                  <p>Maximum file size: 20MB</p>
                  <p>Maximum files: {maxFiles}</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 bg-transparent">
                <File className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Uploaded Files ({uploadedFiles.length})</h3>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0">
                    {uploadedFile.file.type.startsWith("image/") ? (
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                        <File className="h-6 w-6 text-accent" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{uploadedFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedFile.file.size)} • {uploadedFile.file.type}
                    </p>
                    {uploadedFile.status === "processing" && (
                      <Progress value={uploadedFile.progress} className="mt-2 h-2" />
                    )}
                    {uploadedFile.error && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{uploadedFile.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadedFile.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {uploadedFile.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                    <Button variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
