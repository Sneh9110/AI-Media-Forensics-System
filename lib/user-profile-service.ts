/**
 * User Profile Service
 * Manages user profiles, preferences, settings, and avatars
 */

export interface UserPreferences {
  theme: "light" | "dark" | "auto"
  language: string
  emailNotifications: boolean
  analysisNotifications: boolean
  collaborationNotifications: boolean
  notificationFrequency: "immediate" | "daily" | "weekly"
  timezone: string
  privacyLevel: "public" | "workspace" | "private"
}

export interface UserSettings {
  twoFactorEnabled: boolean
  apiKeyEnabled: boolean
  apiKey?: string
  dataRetentionDays: number
  allowDataSharing: boolean
  autoDeleteOldAnalyses: boolean
  subscriptionPlan: "free" | "pro" | "enterprise"
  subscriptionStatus: "active" | "inactive" | "cancelled"
}

export interface UserStatistics {
  analysesCompleted: number
  averageProcessingTime: number
  totalFilesAnalyzed: number
  favoriteAnalysisTypes: string[]
  lastAnalysisDate?: Date
  collaborationsCount: number
  workspacesCount: number
  teamsCount: number
  contributionsThisMonth: number
}

export interface UserProfile {
  userId: string
  avatar?: string
  avatarColor?: string
  bio?: string
  phone?: string
  organization?: string
  department?: string
  position?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  preferences: UserPreferences
  settings: UserSettings
  statistics: UserStatistics
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ProfileUpdateRequest {
  bio?: string
  avatar?: string
  phone?: string
  organization?: string
  department?: string
  position?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

class UserProfileService {
  private profiles: Map<string, UserProfile> = new Map()
  private apiKeys: Map<string, { userId: string; createdAt: Date; lastUsed?: Date }> = new Map()

  /**
   * Create user profile
   */
  createProfile(userId: string): UserProfile {
    const profile: UserProfile = {
      userId,
      avatar: this.generateDefaultAvatar(userId),
      avatarColor: this.generateRandomColor(),
      bio: "",
      preferences: {
        theme: "auto",
        language: "en",
        emailNotifications: true,
        analysisNotifications: true,
        collaborationNotifications: true,
        notificationFrequency: "immediate",
        timezone: "UTC",
        privacyLevel: "workspace",
      },
      settings: {
        twoFactorEnabled: false,
        apiKeyEnabled: false,
        dataRetentionDays: 90,
        allowDataSharing: false,
        autoDeleteOldAnalyses: false,
        subscriptionPlan: "free",
        subscriptionStatus: "active",
      },
      statistics: {
        analysesCompleted: 0,
        averageProcessingTime: 0,
        totalFilesAnalyzed: 0,
        favoriteAnalysisTypes: [],
        collaborationsCount: 0,
        workspacesCount: 0,
        teamsCount: 0,
        contributionsThisMonth: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.profiles.set(userId, profile)
    return profile
  }

  /**
   * Get user profile
   */
  getProfile(userId: string): UserProfile | null {
    return this.profiles.get(userId) || null
  }

  /**
   * Update profile
   */
  updateProfile(userId: string, updates: ProfileUpdateRequest): UserProfile | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    Object.assign(profile, updates)
    profile.updatedAt = new Date()

    return profile
  }

  /**
   * Update preferences
   */
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): UserProfile | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    Object.assign(profile.preferences, preferences)
    profile.updatedAt = new Date()

    return profile
  }

  /**
   * Update settings
   */
  updateSettings(userId: string, settings: Partial<UserSettings>): UserProfile | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    Object.assign(profile.settings, settings)
    profile.updatedAt = new Date()

    return profile
  }

  /**
   * Upload profile avatar
   */
  uploadAvatar(userId: string, imageData: string): UserProfile | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    profile.avatar = imageData
    profile.updatedAt = new Date()

    return profile
  }

  /**
   * Generate API key
   */
  generateAPIKey(userId: string): string | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    if (!profile.settings.apiKeyEnabled) {
      return null
    }

    const apiKey = `sk_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`

    this.apiKeys.set(apiKey, {
      userId,
      createdAt: new Date(),
    })

    profile.settings.apiKey = apiKey
    profile.updatedAt = new Date()

    return apiKey
  }

  /**
   * Revoke API key
   */
  revokeAPIKey(userId: string): boolean {
    const profile = this.profiles.get(userId)

    if (!profile || !profile.settings.apiKey) {
      return false
    }

    this.apiKeys.delete(profile.settings.apiKey)
    profile.settings.apiKey = undefined
    profile.updatedAt = new Date()

    return true
  }

  /**
   * Verify API key
   */
  verifyAPIKey(apiKey: string): { userId: string; valid: boolean } | null {
    const keyData = this.apiKeys.get(apiKey)

    if (!keyData) {
      return null
    }

    // Update last used timestamp
    keyData.lastUsed = new Date()

    return {
      userId: keyData.userId,
      valid: true,
    }
  }

  /**
   * Update statistics
   */
  updateStatistics(userId: string, updates: Partial<UserStatistics>): UserProfile | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    Object.assign(profile.statistics, updates)
    profile.updatedAt = new Date()

    return profile
  }

  /**
   * Increment analysis count
   */
  incrementAnalysisCount(userId: string, processingTime: number = 0): UserProfile | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    profile.statistics.analysesCompleted++
    profile.statistics.totalFilesAnalyzed++
    profile.statistics.lastAnalysisDate = new Date()

    // Update average processing time
    const totalTime =
      profile.statistics.averageProcessingTime * (profile.statistics.analysesCompleted - 1) + processingTime
    profile.statistics.averageProcessingTime = totalTime / profile.statistics.analysesCompleted

    // Update monthly contribution
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    if (!profile.updatedAt || profile.updatedAt >= monthStart) {
      profile.statistics.contributionsThisMonth++
    }

    profile.updatedAt = new Date()

    return profile
  }

  /**
   * Add favorite analysis type
   */
  addFavoriteType(userId: string, type: string): UserProfile | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    if (!profile.statistics.favoriteAnalysisTypes.includes(type)) {
      profile.statistics.favoriteAnalysisTypes.push(type)
    }

    profile.updatedAt = new Date()

    return profile
  }

  /**
   * Get user summary for dashboard
   */
  getUserSummary(userId: string): {
    profile: UserProfile | null
    recentActivity: string
    nextMilestone: string
  } | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    const stats = profile.statistics
    const recentActivity =
      stats.analysesCompleted === 0
        ? "No analyses yet"
        : `${stats.analysesCompleted} analyses completed this month`

    const nextMilestone =
      stats.analysesCompleted < 10
        ? `${10 - stats.analysesCompleted} analyses until Power User badge`
        : `${100 - stats.analysesCompleted} analyses until Expert badge`

    return {
      profile,
      recentActivity,
      nextMilestone,
    }
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(): UserProfile[] {
    return Array.from(this.profiles.values())
  }

  /**
   * Search users
   */
  searchUsers(query: string): UserProfile[] {
    const lowerQuery = query.toLowerCase()

    return Array.from(this.profiles.values()).filter(
      (profile) =>
        profile.userId.toLowerCase().includes(lowerQuery) ||
        profile.bio?.toLowerCase().includes(lowerQuery) ||
        profile.organization?.toLowerCase().includes(lowerQuery) ||
        profile.department?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Get user by API key
   */
  getUserByAPIKey(apiKey: string): UserProfile | null {
    const keyData = this.apiKeys.get(apiKey)

    if (!keyData) {
      return null
    }

    return this.profiles.get(keyData.userId) || null
  }

  /**
   * Reset password notification
   */
  recordPasswordReset(userId: string): boolean {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return false
    }

    profile.updatedAt = new Date()
    return true
  }

  /**
   * Export profile data
   */
  exportProfileData(userId: string): Record<string, any> | null {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return null
    }

    return {
      profile: {
        userId: profile.userId,
        avatar: "redacted",
        bio: profile.bio,
        organization: profile.organization,
        department: profile.department,
        position: profile.position,
        location: profile.location,
        website: profile.website,
      },
      statistics: profile.statistics,
      preferences: profile.preferences,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
  }

  /**
   * Generate profile badge
   */
  generateBadges(userId: string): string[] {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return []
    }

    const badges: string[] = []
    const stats = profile.statistics

    if (stats.analysesCompleted >= 1) badges.push("first-analysis")
    if (stats.analysesCompleted >= 10) badges.push("power-user")
    if (stats.analysesCompleted >= 50) badges.push("expert")
    if (stats.analysesCompleted >= 100) badges.push("master")
    if (stats.collaborationsCount >= 5) badges.push("collaborator")
    if (stats.workspacesCount >= 3) badges.push("team-builder")
    if (profile.settings.twoFactorEnabled) badges.push("secure")

    return badges
  }

  /**
   * Delete profile (soft delete)
   */
  deleteProfile(userId: string): boolean {
    const profile = this.profiles.get(userId)

    if (!profile) {
      return false
    }

    profile.deletedAt = new Date()
    return true
  }

  /**
   * Private: Generate default avatar URL
   */
  private generateDefaultAvatar(userId: string): string {
    // Use initials or avatar service
    const initial = userId.charAt(0).toUpperCase()
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23007BFF"/><text x="50" y="50" font-size="50" fill="white" text-anchor="middle" dy=".3em">${initial}</text></svg>`
  }

  /**
   * Private: Generate random color
   */
  private generateRandomColor(): string {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService()
