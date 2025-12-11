"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"

export default function LoginPage() {
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
                <h1 className="text-2xl font-bold">AI Media Forensics</h1>
                <p className="text-sm text-muted-foreground">Detect AI-generated content</p>
              </div>
            </div>
          </div>

          <LoginForm />

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <Card className="p-4 bg-white/50 backdrop-blur-sm border-white/20">
              <p className="text-2xl font-bold text-primary">97%</p>
              <p className="text-xs text-muted-foreground">Detection Accuracy</p>
            </Card>
            <Card className="p-4 bg-white/50 backdrop-blur-sm border-white/20">
              <p className="text-2xl font-bold text-primary">474ms</p>
              <p className="text-xs text-muted-foreground">Avg Processing</p>
            </Card>
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
