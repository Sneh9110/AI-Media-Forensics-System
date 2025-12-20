/**
 * Audit Logging System
 * Tracks user actions and system events for compliance and security
 */

export interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  action: string
  resource: string
  resourceId?: string
  status: "success" | "failure"
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export class AuditLogger {
  private logs: AuditLog[] = []
  private readonly MAX_LOGS = 10000

  logAction(
    userId: string,
    action: string,
    resource: string,
    status: "success" | "failure" = "success",
    resourceId?: string,
    details?: Record<string, any>
  ): AuditLog {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      action,
      resource,
      resourceId,
      status,
      details,
    }

    this.logs.unshift(log)

    // Maintain max size
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS)
    }

    return log
  }

  getLogs(filters?: { userId?: string; action?: string; status?: "success" | "failure" }): AuditLog[] {
    let filtered = [...this.logs]

    if (filters?.userId) {
      filtered = filtered.filter((log) => log.userId === filters.userId)
    }

    if (filters?.action) {
      filtered = filtered.filter((log) => log.action === filters.action)
    }

    if (filters?.status) {
      filtered = filtered.filter((log) => log.status === filters.status)
    }

    return filtered
  }

  getLogsByDateRange(startDate: Date, endDate: Date): AuditLog[] {
    return this.logs.filter((log) => log.timestamp >= startDate && log.timestamp <= endDate)
  }

  getStatistics(): { totalLogs: number; successCount: number; failureCount: number; uniqueUsers: number } {
    const users = new Set(this.logs.map((log) => log.userId))
    const successCount = this.logs.filter((log) => log.status === "success").length
    const failureCount = this.logs.filter((log) => log.status === "failure").length

    return {
      totalLogs: this.logs.length,
      successCount,
      failureCount,
      uniqueUsers: users.size,
    }
  }

  clearLogs(daysOld: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    this.logs = this.logs.filter((log) => log.timestamp > cutoffDate)
  }

  exportLogs(format: "json" | "csv" = "json"): string {
    if (format === "json") {
      return JSON.stringify(this.logs, null, 2)
    } else {
      const headers = ["ID", "Timestamp", "User ID", "Action", "Resource", "Status"]
      const rows = this.logs.map((log) => [
        log.id,
        log.timestamp.toISOString(),
        log.userId,
        log.action,
        log.resource,
        log.status,
      ])

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
      return csv
    }
  }
}

export const auditLogger = new AuditLogger()
