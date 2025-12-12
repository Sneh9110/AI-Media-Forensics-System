/**
 * Error Handling Utilities
 * Standardized error handling and logging
 */

import { ERROR_CODES } from "./constants"

/**
 * Custom error class for forensic analysis
 */
export class ForensicAnalysisError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = "ForensicAnalysisError"
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Validation error
 */
export class ValidationError extends ForensicAnalysisError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ERROR_CODES.VALIDATION_ERROR, message, context)
    this.name = "ValidationError"
  }
}

/**
 * Model execution error
 */
export class ModelExecutionError extends ForensicAnalysisError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ERROR_CODES.MODEL_FAILURE, message, context)
    this.name = "ModelExecutionError"
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends ForensicAnalysisError {
  constructor(operation: string, timeout: number) {
    super(
      ERROR_CODES.TIMEOUT,
      `Operation "${operation}" exceeded timeout of ${timeout}ms`,
      { operation, timeout }
    )
    this.name = "TimeoutError"
  }
}

/**
 * Database error
 */
export class DatabaseError extends ForensicAnalysisError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ERROR_CODES.DATABASE_ERROR, message, context)
    this.name = "DatabaseError"
  }
}

/**
 * Try-catch wrapper with error handling
 * @param fn - Function to execute
 * @param fallback - Fallback value
 * @returns result or fallback
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error("Safe execution error:", error)
    return fallback
  }
}

/**
 * Retry logic with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum retry attempts
 * @param delay - Initial delay in ms
 * @returns result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError || new Error("Retry failed after all attempts")
}

/**
 * Assert condition, throw if false
 * @param condition - Condition to check
 * @param message - Error message
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new ValidationError(message)
  }
}

/**
 * Validate required field
 * @param value - Value to check
 * @param fieldName - Field name for error message
 */
export function requireField<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new ValidationError(`Required field missing: ${fieldName}`)
  }
  return value
}

/**
 * Validate range
 * @param value - Value to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Field name
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}, got ${value}`
    )
  }
}

/**
 * Log error with context
 * @param error - Error to log
 * @param context - Additional context
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString()
  const errorData = {
    timestamp,
    error:
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
    context,
  }

  console.error("Error logged:", JSON.stringify(errorData, null, 2))
}

/**
 * Create error summary for reports
 * @param error - Error object
 * @returns summary string
 */
export function getErrorSummary(error: unknown): string {
  if (error instanceof ForensicAnalysisError) {
    return `[${error.code}] ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
