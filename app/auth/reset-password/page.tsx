"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PasswordResetForm } from "@/components/password-reset-form"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">AI Forensics</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <PasswordResetForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/30 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>{" "}
            •{" "}
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
