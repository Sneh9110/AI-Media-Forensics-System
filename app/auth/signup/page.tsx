"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SignupForm } from "@/components/signup-form"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check if already logged in
    const token = localStorage.getItem("accessToken")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

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
              Back Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Join AI Forensics</h1>
                <p className="text-sm text-muted-foreground">Start detecting AI-generated content</p>
              </div>
            </div>
          </div>

          <SignupForm />

          {/* Features */}
          <div className="mt-8 space-y-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <p className="text-sm font-medium text-foreground">What you'll get:</p>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Advanced AI detection with 97% accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Real-time analysis with heatmap visualization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Team collaboration workspace</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Batch processing and analytics</span>
              </li>
            </ul>
          </div>
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
            </Link>{" "}
            •{" "}
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
