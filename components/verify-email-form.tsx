"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"

interface VerifyEmailFormProps {
  email?: string
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const token = code.join("")
    if (token.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Verification failed")
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Email Verified!
          </CardTitle>
          <CardDescription>Your email has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-900">
              You can now log in to your account and start using AI Media Forensics.
            </p>
          </div>

          <Link href="/auth/login">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {email || "your email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Label className="text-sm font-medium">Verification Code</Label>
            <div className="flex gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="h-12 w-12 text-center text-lg font-semibold"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || code.join("").length !== 6}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Didn't receive the code?{" "}
              <button type="button" className="text-primary hover:underline">
                Resend
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
