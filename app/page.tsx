import { Shield, Zap, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI Media Forensics</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/upload">
              <Button variant="outline">Upload & Analyze</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
              Detect AI-Generated Media with <span className="text-primary">Advanced Forensics</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Professional-grade tool for law enforcement, journalists, and researchers to verify the authenticity of
              images and videos using cutting-edge machine learning technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="pulse-glow">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Analysis
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <Eye className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Advanced Detection Capabilities</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  Multi-Modal Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Combines spatial residual analysis, frequency domain detection, and metadata examination for
                  comprehensive authenticity verification.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Eye className="mr-2 h-5 w-5 text-accent" />
                  Heatmap Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive heatmaps highlight suspicious regions in uploaded media, providing clear visual evidence
                  of potential manipulation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Zap className="mr-2 h-5 w-5 text-chart-3" />
                  Real-Time Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fast analysis with real-time progress tracking and detailed logs of each detection step for complete
                  transparency.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Users className="mr-2 h-5 w-5 text-chart-4" />
                  Professional Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate comprehensive PDF reports with metadata, analysis results, and visualizations suitable for
                  legal and professional use.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Shield className="mr-2 h-5 w-5 text-chart-5" />
                  Secure Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Enterprise-grade security with file sanitization, size limits, and malicious content scanning for safe
                  analysis.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Zap className="mr-2 h-5 w-5 text-primary" />
                  Multiple Formats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Support for images (JPG, PNG) and videos (MP4, MOV, AVI) with specialized detection algorithms for
                  each media type.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-6">Ready to Verify Media Authenticity?</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Join law enforcement agencies, news organizations, and research institutions using our advanced AI
              detection technology.
            </p>
            <Link href="/upload">
              <Button size="lg" className="pulse-glow">
                <Shield className="mr-2 h-5 w-5" />
                Start Your Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 AI Media Forensics. Professional tool for detecting synthetic media content.
          </p>
        </div>
      </footer>
    </div>
  )
}
