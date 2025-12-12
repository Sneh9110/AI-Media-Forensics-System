/**
 * Logger Utility
 * Centralized logging with severity levels and structured output
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs: number = 1000
  private minLevel: LogLevel = LogLevel.DEBUG

  /**
   * Log message at specified level
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
    }

    this.logs.push(entry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output
    this.consolelog(entry)
  }

  /**
   * Debug level
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Info level
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Warning level
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Error level
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  /**
   * Critical level
   */
  critical(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.CRITICAL, message, context, error)
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level)
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Get log statistics
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    for (const level of Object.values(LogLevel)) {
      stats[level] = this.getLogsByLevel(level).length
    }
    return stats
  }

  /**
   * Console output with formatting
   */
  private consolelog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString()
    const prefix = `[${timestamp}] ${entry.level}`

    const logData = {
      message: entry.message,
      context: entry.context,
      error: entry.error ? { message: entry.error.message, stack: entry.error.stack } : undefined,
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context)
        break
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context)
        break
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.context)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, logData)
        break
    }
  }

  /**
   * Export logs as JSON
   */
  exportAsJson(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Export logs as CSV
   */
  exportAsCsv(): string {
    const headers = ["Timestamp", "Level", "Message", "Context", "Error"]
    const rows = this.logs.map((log) => [
      log.timestamp.toISOString(),
      log.level,
      log.message,
      JSON.stringify(log.context || {}),
      log.error ? log.error.message : "",
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    return csv
  }
}

// Singleton instance
export const logger = new Logger()
