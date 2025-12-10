"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-documentation"

export function APIDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'GET':
        return 'default'
      case 'POST':
        return 'secondary'
      case 'PATCH':
        return 'outline'
      case 'DELETE':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-600 border-blue-500'
      case 'POST':
        return 'bg-green-500/10 text-green-600 border-green-500'
      case 'PATCH':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500'
      case 'DELETE':
        return 'bg-red-500/10 text-red-600 border-red-500'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Complete reference for the AI Media Forensics API endpoints and integration examples
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm bg-secondary p-2 rounded block">
              http://localhost:3000
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Public API - No auth required</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Rate Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">10-30 requests per minute</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Endpoints</h2>

        {API_ENDPOINTS.map((endpoint, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardHeader className="bg-secondary/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`font-mono ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                  </div>
                  <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                  <CardDescription className="mt-1">{endpoint.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Rate Limit</h4>
                  <p className="text-sm text-muted-foreground">{endpoint.rateLimit}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    {endpoint.auth ? 'Required' : 'Not required'}
                  </p>
                </div>
              </div>

              {endpoint.params && endpoint.params.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.params.map((param, pIdx) => (
                      <div
                        key={pIdx}
                        className="text-sm p-3 bg-secondary rounded border border-border"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <code className="font-mono text-foreground">{param.name}</code>
                          <Badge variant="outline" className="text-xs">
                            {param.type}
                          </Badge>
                          {param.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{param.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm mb-3">Response (200)</h4>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{endpoint.response.description}</p>
                  <div className="bg-secondary p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-foreground">
                      {JSON.stringify(endpoint.response.example, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {endpoint.errors && endpoint.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3">Error Responses</h4>
                  <div className="space-y-2">
                    {endpoint.errors.map((error, eIdx) => (
                      <div key={eIdx} className="text-sm p-3 bg-red-500/5 rounded border border-red-500/20">
                        <span className="font-mono font-semibold text-red-600">
                          {error.status}
                        </span>
                        <p className="text-muted-foreground">{error.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm mb-3">Code Examples</h4>
                <Tabs defaultValue="curl" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>

                  <TabsContent value="curl" className="space-y-2">
                    <div className="bg-secondary p-4 rounded-lg overflow-x-auto relative">
                      <pre className="text-xs text-foreground font-mono">
                        {endpoint.examples.curl}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(endpoint.examples.curl, `curl-${idx}`)}
                      >
                        {copiedCode === `curl-${idx}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="javascript" className="space-y-2">
                    <div className="bg-secondary p-4 rounded-lg overflow-x-auto relative">
                      <pre className="text-xs text-foreground font-mono">
                        {endpoint.examples.javascript}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(endpoint.examples.javascript, `js-${idx}`)
                        }
                      >
                        {copiedCode === `js-${idx}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="python" className="space-y-2">
                    <div className="bg-secondary p-4 rounded-lg overflow-x-auto relative">
                      <pre className="text-xs text-foreground font-mono">
                        {endpoint.examples.python}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(endpoint.examples.python, `python-${idx}`)
                        }
                      >
                        {copiedCode === `python-${idx}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
