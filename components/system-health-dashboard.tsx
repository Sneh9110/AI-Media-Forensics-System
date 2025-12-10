"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Server,
  Database,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { systemHealthMonitor } from "@/lib/system-health"

export function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [healthScore, setHealthScore] = useState(0)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const updateData = () => {
      setMetrics(systemHealthMonitor.getCurrentMetrics())
      setServices(systemHealthMonitor.getServicesStatus())
      setHealthScore(systemHealthMonitor.getHealthScore())
      setStats(systemHealthMonitor.getSystemStats())
    }

    updateData()
    const interval = setInterval(updateData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (!metrics || !services.length) {
    return <div>Loading system status...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online':
        return 'default'
      case 'warning':
        return 'secondary'
      case 'offline':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Overall Health */}
        <Card className={`bg-gradient-to-br ${healthScore >= 95 ? 'from-green-500/10 to-emerald-500/10 border-green-500/30' : healthScore >= 80 ? 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30' : 'from-red-500/10 to-pink-500/10 border-red-500/30'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Health</span>
              <Activity className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">
                {healthScore.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {systemHealthMonitor.getHealthStatusLabel()}
              </p>
            </div>
            <Progress value={healthScore} className="h-2" />
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {stats?.overallUptime.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">All services average</p>
          </CardContent>
        </Card>

        {/* Active Connections */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats?.activeUsers}</p>
            <p className="text-xs text-muted-foreground mt-2">Current users online</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Real-time status of all system services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {services.map((service, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} animate-pulse`}
                />
                <div>
                  <p className="font-medium text-sm text-foreground">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Response: {service.responseTime}ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(service.status)}>
                  {service.uptime.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-4 w-4" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{metrics.cpuUsage}%</span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{metrics.memoryUsage}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className="text-sm text-muted-foreground">{metrics.averageResponseTime}ms</span>
              </div>
              <Progress value={Math.min(100, (metrics.averageResponseTime / 1000) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-4 w-4" />
              Analysis Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-foreground">Successful Analyses</span>
              </div>
              <span className="font-semibold text-foreground">
                {stats?.successfulAnalyses}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-500/10 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-foreground">Failed Analyses</span>
              </div>
              <span className="font-semibold text-foreground">
                {stats?.failedAnalyses}
              </span>
            </div>
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-muted-foreground mb-2">Success Rate</p>
              <div className="flex items-center gap-2">
                <Progress value={metrics.successRate} className="h-2" />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {metrics.successRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database & Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Storage & Database</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Database Size</p>
            <p className="text-2xl font-bold text-foreground">{metrics.databaseSize} MB</p>
            <p className="text-xs text-muted-foreground">Total data stored</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Total Analyses</p>
            <p className="text-2xl font-bold text-foreground">{metrics.totalAnalyses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">All-time processed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
