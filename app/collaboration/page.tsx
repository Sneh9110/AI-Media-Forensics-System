"use client"

import { useState } from "react"
import { ArrowLeft, Users, MessageSquare, Activity, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ActivityTimeline } from "@/components/activity-timeline"
import { TeamWorkspaceSelector } from "@/components/team-workspace-selector"
import Link from "next/link"
import type { Workspace, TeamMember } from "@/lib/collaboration-service"
import type { ActivityEvent } from "@/lib/activity-feed"

// Mock data
const mockCurrentUser: TeamMember = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  role: "admin",
  joinedAt: new Date("2024-01-01"),
  lastActive: new Date(),
  avatar: undefined,
}

const mockWorkspace: Workspace = {
  id: "workspace_1",
  name: "AI Forensics Team",
  description: "Collaborative workspace for media analysis",
  owner: mockCurrentUser,
  members: [
    mockCurrentUser,
    {
      id: "user_2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "editor",
      joinedAt: new Date("2024-02-01"),
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      avatar: undefined,
    },
    {
      id: "user_3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "viewer",
      joinedAt: new Date("2024-03-01"),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: undefined,
    },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date(),
  isPublic: false,
  settings: {
    allowComments: true,
    allowExport: true,
    defaultAnalysisVisibility: "workspace",
  },
}

const mockActivities: ActivityEvent[] = [
  {
    id: "activity_1",
    type: "analysis_created",
    workspaceId: "workspace_1",
    userId: "user_2",
    userName: "Jane Smith",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    description: "Created new analysis",
    target: { type: "analysis", id: "analysis_1", name: "Social Media Images" },
    isPublic: true,
  },
  {
    id: "activity_2",
    type: "comment_added",
    workspaceId: "workspace_1",
    userId: "user_1",
    userName: "John Doe",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    description: "Added a comment",
    target: { type: "comment", id: "comment_1", name: "Analysis Discussion" },
    isPublic: true,
  },
  {
    id: "activity_3",
    type: "analysis_shared",
    workspaceId: "workspace_1",
    userId: "user_1",
    userName: "John Doe",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    description: "Shared analysis with team",
    target: { type: "analysis", id: "analysis_2", name: "Synthetic Detection Results" },
    isPublic: true,
  },
]

export default function CollaborationPage() {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(mockWorkspace)
  const [workspaces] = useState<Workspace[]>([mockWorkspace])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/upload">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Team Collaboration</h1>
                <p className="text-xs text-muted-foreground">Workspace management and activity tracking</p>
              </div>
            </div>
          </div>
          {currentWorkspace && (
            <TeamWorkspaceSelector
              currentWorkspace={currentWorkspace}
              workspaces={workspaces}
              currentUser={mockCurrentUser}
              onWorkspaceChange={setCurrentWorkspace}
            />
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentWorkspace ? (
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <ActivityTimeline
                activities={mockActivities}
                workspace={{
                  name: currentWorkspace.name,
                  memberCount: currentWorkspace.members.length,
                }}
              />
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-6">
              <div className="grid gap-6">
                {/* Workspace Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{currentWorkspace.name}</CardTitle>
                    <CardDescription>{currentWorkspace.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Created</p>
                        <p className="text-sm text-muted-foreground">{currentWorkspace.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Members</p>
                        <p className="text-sm text-muted-foreground">{currentWorkspace.members.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Members List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Team Members
                      <Badge>{currentWorkspace.members.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentWorkspace.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={member.role === "admin" ? "default" : "outline"}
                            className="capitalize"
                          >
                            {member.role === "admin" ? "Owner" : member.role}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Active{Math.floor((Date.now() - member.lastActive.getTime()) / (1000 * 60))}m ago
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Collaboration Tab */}
            <TabsContent value="collaboration" className="mt-6">
              <div className="grid gap-6">
                {/* Collaboration Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-xs text-muted-foreground">across all analyses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Shared Analyses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">active collaborations</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Discussions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">42</div>
                      <p className="text-xs text-muted-foreground">active threads</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Discussions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Recent Discussions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        title: "Confidence Thresholds",
                        participants: 3,
                        messages: 12,
                      },
                      {
                        title: "PRNU Detection Issues",
                        participants: 2,
                        messages: 8,
                      },
                      {
                        title: "Batch Processing Results",
                        participants: 4,
                        messages: 15,
                      },
                    ].map((discussion, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{discussion.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {discussion.participants} participants • {discussion.messages} messages
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Privacy</p>
                    <p className="text-sm text-muted-foreground">
                      {currentWorkspace.isPublic ? "Public workspace" : "Private workspace"}
                    </p>
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <p className="font-semibold text-sm">Features</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Allow Comments</span>
                        <Badge variant={currentWorkspace.settings.allowComments ? "default" : "secondary"}>
                          {currentWorkspace.settings.allowComments ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Allow Export</span>
                        <Badge variant={currentWorkspace.settings.allowExport ? "default" : "secondary"}>
                          {currentWorkspace.settings.allowExport ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Workspace Selected</h3>
              <p className="text-sm text-muted-foreground">Create or join a workspace to collaborate with your team</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
