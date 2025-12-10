/**
 * Favorites Service
 * Manage favorite/bookmarked analyses
 */

import { AnalysisResult } from "./database"

export interface FavoriteAnalysis {
  analysisId: string
  fileName: string
  prediction: 'real' | 'synthetic'
  confidence: number
  addedAt: string
  notes?: string
  tags?: string[]
}

class FavoritesService {
  private storageKey = 'ai_forensics_favorites'

  /**
   * Add analysis to favorites
   */
  addFavorite(analysis: AnalysisResult): void {
    const favorites = this.getFavorites()
    const exists = favorites.some(f => f.analysisId === analysis.id)

    if (!exists) {
      const favorite: FavoriteAnalysis = {
        analysisId: analysis.id,
        fileName: analysis.fileName,
        prediction: analysis.authenticity?.prediction || 'real',
        confidence: analysis.authenticity?.confidence || 0,
        addedAt: new Date().toISOString(),
      }
      favorites.push(favorite)
      this.saveFavorites(favorites)
    }
  }

  /**
   * Remove analysis from favorites
   */
  removeFavorite(analysisId: string): void {
    const favorites = this.getFavorites()
    const filtered = favorites.filter(f => f.analysisId !== analysisId)
    this.saveFavorites(filtered)
  }

  /**
   * Check if analysis is favorited
   */
  isFavorited(analysisId: string): boolean {
    return this.getFavorites().some(f => f.analysisId === analysisId)
  }

  /**
   * Get all favorites
   */
  getFavorites(): FavoriteAnalysis[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load favorites:', error)
      return []
    }
  }

  /**
   * Add note to favorite
   */
  addNote(analysisId: string, note: string): void {
    const favorites = this.getFavorites()
    const favorite = favorites.find(f => f.analysisId === analysisId)
    if (favorite) {
      favorite.notes = note
      this.saveFavorites(favorites)
    }
  }

  /**
   * Add tags to favorite
   */
  addTags(analysisId: string, tags: string[]): void {
    const favorites = this.getFavorites()
    const favorite = favorites.find(f => f.analysisId === analysisId)
    if (favorite) {
      favorite.tags = [...(favorite.tags || []), ...tags]
      this.saveFavorites(favorites)
    }
  }

  /**
   * Get favorites by tag
   */
  getFavoritesByTag(tag: string): FavoriteAnalysis[] {
    return this.getFavorites().filter(f => f.tags?.includes(tag))
  }

  /**
   * Get all tags from favorites
   */
  getAllTags(): string[] {
    const tags = new Set<string>()
    this.getFavorites().forEach(f => {
      f.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  /**
   * Clear all favorites
   */
  clearAllFavorites(): void {
    this.saveFavorites([])
  }

  /**
   * Export favorites as JSON
   */
  exportFavorites(): string {
    return JSON.stringify(this.getFavorites(), null, 2)
  }

  /**
   * Import favorites from JSON
   */
  importFavorites(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      if (Array.isArray(data)) {
        this.saveFavorites(data)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to import favorites:', error)
      return false
    }
  }

  /**
   * Save favorites to localStorage
   */
  private saveFavorites(favorites: FavoriteAnalysis[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(favorites))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }
}

export const favoritesService = new FavoritesService()
