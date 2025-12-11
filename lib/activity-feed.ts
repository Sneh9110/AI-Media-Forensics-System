/**
 * Activity Feed Service
 * Tracks and manages activity logs for workspaces and analyses
 */

export type ActivityType = 
  | "analysis_created"
  | "analysis_shared"
  | "comment_added"
  | "annotation_added"
  | "member_joined"
  | "member_left"
  | "member_role_changed"
  | "export_generated"
  | "batch_completed"
  | "workspace_created"

export interface ActivityEvent {
  id: string
  type: ActivityType
  workspaceId: string
  userId: string
  userName: string
  userAvatar?: string
  timestamp: Date
  description: string
  target: {
    type: "analysis" | "workspace" | "member" | "comment"
    id: string
    name: string
  }
  metadata?: Record<string, any>
  isPublic: boolean
}

export interface ActivityFeed {
  workspaceId: string
  events: ActivityEvent[]
}

class ActivityFeedService {
  private activityFeeds: Map<string, ActivityEvent[]> = new Map()
  private userActivityFeeds: Map<string, ActivityEvent[]> = new Map()
  private MAX_FEED_SIZE = 1000

  /**
   * Log activity event
   */
  logActivity(
    workspaceId: string,
    userId: string,
    userName: string,
    type: ActivityType,
    description: string,
    target: { type: "analysis" | "workspace" | "member" | "comment"; id: string; name: string },
    metadata?: Record<string, any>,
    isPublic: boolean = true
  ): ActivityEvent {
    const eventId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const event: ActivityEvent = {
      id: eventId,
      type,
      workspaceId,
      userId,
      userName,
      timestamp: new Date(),
      description,
      target,
      metadata,
      isPublic,
    }

    // Add to workspace feed
    if (!this.activityFeeds.has(workspaceId)) {
      this.activityFeeds.set(workspaceId, [])
    }
    const workspaceFeed = this.activityFeeds.get(workspaceId)!
    workspaceFeed.unshift(event)
    if (workspaceFeed.length > this.MAX_FEED_SIZE) {
      workspaceFeed.pop()
    }

    // Add to user feed
    if (!this.userActivityFeeds.has(userId)) {
      this.userActivityFeeds.set(userId, [])
    }
    const userFeed = this.userActivityFeeds.get(userId)!
    userFeed.unshift(event)
    if (userFeed.length > this.MAX_FEED_SIZE) {
      userFeed.pop()
    }

    return event
  }

  /**
   * Get workspace activity feed
   */
  getWorkspaceActivityFeed(workspaceId: string, limit: number = 50, offset: number = 0): ActivityEvent[] {
    const feed = this.activityFeeds.get(workspaceId) || []
    return feed.slice(offset, offset + limit)
  }

  /**
   * Get user activity feed
   */
  getUserActivityFeed(userId: string, limit: number = 50, offset: number = 0): ActivityEvent[] {
    const feed = this.userActivityFeeds.get(userId) || []
    return feed.slice(offset, offset + limit)
  }

  /**
   * Get activity for specific analysis
   */
  getAnalysisActivity(workspaceId: string, analysisId: string): ActivityEvent[] {
    const feed = this.activityFeeds.get(workspaceId) || []
    return feed.filter((event) => event.target.id === analysisId)
  }

  /**
   * Get activity by type
   */
  getActivityByType(workspaceId: string, type: ActivityType, limit: number = 50): ActivityEvent[] {
    const feed = this.activityFeeds.get(workspaceId) || []
    return feed.filter((event) => event.type === type).slice(0, limit)
  }

  /**
   * Get activity in date range
   */
  getActivityInDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): ActivityEvent[] {
    const feed = this.activityFeeds.get(workspaceId) || []
    return feed
      .filter((event) => event.timestamp >= startDate && event.timestamp <= endDate)
      .slice(0, limit)
  }

  /**
   * Get user activity in workspace
   */
  getUserActivityInWorkspace(workspaceId: string, userId: string, limit: number = 50): ActivityEvent[] {
    const feed = this.activityFeeds.get(workspaceId) || []
    return feed.filter((event) => event.userId === userId).slice(0, limit)
  }

  /**
   * Get activity statistics for workspace
   */
  getWorkspaceActivityStats(workspaceId: string) {
    const feed = this.activityFeeds.get(workspaceId) || []

    const stats = {
      totalEvents: feed.length,
      eventsByType: {} as Record<ActivityType, number>,
      eventsByUser: {} as Record<string, number>,
      todayEvents: 0,
      thisWeekEvents: 0,
      thisMonthEvents: 0,
      mostActiveUser: "",
      mostActiveUserCount: 0,
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    feed.forEach((event) => {
      // Count by type
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1

      // Count by user
      stats.eventsByUser[event.userId] = (stats.eventsByUser[event.userId] || 0) + 1

      // Count by time period
      if (event.timestamp >= today) stats.todayEvents++
      if (event.timestamp >= weekAgo) stats.thisWeekEvents++
      if (event.timestamp >= monthAgo) stats.thisMonthEvents++
    })

    // Find most active user
    Object.entries(stats.eventsByUser).forEach(([userId, count]) => {
      if (count > stats.mostActiveUserCount) {
        stats.mostActiveUser = userId
        stats.mostActiveUserCount = count
      }
    })

    return stats
  }

  /**
   * Get activity heatmap (activity by hour of day)
   */
  getActivityHeatmap(workspaceId: string): Record<number, number> {
    const feed = this.activityFeeds.get(workspaceId) || []
    const heatmap: Record<number, number> = {}

    for (let i = 0; i < 24; i++) {
      heatmap[i] = 0
    }

    feed.forEach((event) => {
      const hour = event.timestamp.getHours()
      heatmap[hour]++
    })

    return heatmap
  }

  /**
   * Get user contribution chart
   */
  getUserContributionChart(workspaceId: string, limit: number = 10) {
    const stats = this.getWorkspaceActivityStats(workspaceId)
    return Object.entries(stats.eventsByUser)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([userId, count]) => ({
        userId,
        activityCount: count,
        percentage: ((count / stats.totalEvents) * 100).toFixed(2),
      }))
  }

  /**
   * Clear old activities (older than N days)
   */
  clearOldActivities(workspaceId: string, daysOld: number = 90): number {
    const feed = this.activityFeeds.get(workspaceId)
    if (!feed) return 0

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const beforeCount = feed.length
    const filtered = feed.filter((event) => event.timestamp >= cutoffDate)
    this.activityFeeds.set(workspaceId, filtered)

    return beforeCount - filtered.length
  }

  /**
   * Export activity feed as JSON
   */
  exportActivityFeed(workspaceId: string): string {
    const feed = this.activityFeeds.get(workspaceId) || []
    return JSON.stringify(
      {
        workspaceId,
        exportedAt: new Date().toISOString(),
        totalEvents: feed.length,
        events: feed,
      },
      null,
      2
    )
  }

  /**
   * Export activity feed as CSV
   */
  exportActivityFeedAsCSV(workspaceId: string): string {
    const feed = this.activityFeeds.get(workspaceId) || []
    const headers = ["Timestamp", "Type", "User Name", "Description", "Target", "Target ID"]

    const rows = feed.map((event) => [
      event.timestamp.toISOString(),
      event.type,
      event.userName,
      event.description,
      event.target.name,
      event.target.id,
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    return csv
  }

  /**
   * Get real-time activity (last N minutes)
   */
  getRecentActivity(workspaceId: string, minutesBack: number = 5): ActivityEvent[] {
    const feed = this.activityFeeds.get(workspaceId) || []
    const cutoffTime = new Date(Date.now() - minutesBack * 60 * 1000)
    return feed.filter((event) => event.timestamp >= cutoffTime)
  }
}

// Export singleton instance
export const activityFeedService = new ActivityFeedService()
