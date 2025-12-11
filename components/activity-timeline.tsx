"use client"

import { useState, useEffect } from "react"
import { Activity, Users, MessageSquare, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ActivityEvent } from "@/lib/activity-feed"
import type { TeamMember } from "@/lib/collaboration-service"

interface ActivityTimelineProps {
  activities: ActivityEvent[]
  workspace?: { name: string; memberCount: number }
}

export function ActivityTimeline({ activities, workspace }: ActivityTimelineProps) {
  const [displayedActivities, setDisplayedActivities] = useState<ActivityEvent[]>([])

  useEffect(() => {
    setDisplayedActivities(activities.slice(0, 20))
  }, [activities])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "analysis_created":
        return <Activity className="h-4 w-4" />
      case "member_joined":
        return <Users className="h-4 w-4" />
      case "comment_added":
        return <MessageSquare className="h-4 w-4" />
      case "analysis_shared":
        return <Share2 className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "analysis_created":
        return "bg-blue-500/20 text-blue-700"
      case "member_joined":
        return "bg-green-500/20 text-green-700"
      case "comment_added":
        return "bg-purple-500/20 text-purple-700"
      case "analysis_shared":
        return "bg-orange-500/20 text-orange-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const groupActivitiesByDate = (activities: ActivityEvent[]) => {
    const grouped: { [key: string]: ActivityEvent[] } = {}

    activities.forEach((activity) => {
      const dateKey = activity.timestamp.toLocaleDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(activity)
    })

    return grouped
  }

  const groupedActivities = groupActivitiesByDate(displayedActivities)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">events logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                activities.filter((a) => {
                  const today = new Date()
                  return a.timestamp.toDateString() === today.toDateString()
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                activities.filter((a) => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return a.timestamp >= weekAgo
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                new Set(activities.map((a) => a.userId)).size
              }
            </div>
            <p className="text-xs text-muted-foreground">contributors</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Recent workspace activity and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedActivities).length > 0 ? (
              Object.entries(groupedActivities).map(([date, dayActivities]) => (
                <div key={date}>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">{date}</h4>
                  <div className="space-y-3">
                    {dayActivities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={activity.userAvatar} />
                              <AvatarFallback>{activity.userName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{activity.userName}</p>
                              <p className="text-xs text-muted-foreground">{activity.description}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground ml-8">
                            {activity.target.type}: <span className="font-medium">{activity.target.name}</span>
                          </p>
                          <p className="text-xs text-muted-foreground ml-8 mt-1">{formatTime(activity.timestamp)}</p>
                        </div>

                        {/* Activity badge */}
                        <Badge variant="outline" className="flex-shrink-0">
                          {activity.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            )}
          </div>

          {activities.length > displayedActivities.length && (
            <button
              onClick={() => setDisplayedActivities(activities.slice(0, displayedActivities.length + 10))}
              className="w-full mt-4 text-sm text-primary hover:underline"
            >
              Load more activities
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
