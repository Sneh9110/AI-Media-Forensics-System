/**
 * Analysis Cache Manager
 * In-memory caching for analysis results to improve performance
 */

interface CacheEntry<T> {
  data: T
  timestamp: Date
  ttl: number // milliseconds
}

export class AnalysisCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private maxSize: number = 1000
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(cleanupIntervalMs: number = 60000) {
    this.startCleanup(cleanupIntervalMs)
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttlMs: number = 3600000): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl: ttlMs,
    })
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    // Check if expired
    const age = Date.now() - entry.timestamp.getTime()
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache) {
      const age = now - entry.timestamp.getTime()
      if (age > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Start automatic cleanup
   */
  private startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => this.cleanup(), intervalMs)
  }

  /**
   * Stop cleanup and clear cache
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    }
  }
}

// Singleton instance
export const analysisCache = new AnalysisCache()
