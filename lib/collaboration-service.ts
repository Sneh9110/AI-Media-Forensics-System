/**
 * Collaboration Service
 * Handles team workspaces, permissions, and shared analysis sessions
 */

export type UserRole = "admin" | "editor" | "viewer"
export type Permission = "view" | "edit" | "delete" | "share" | "admin"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  joinedAt: Date
  avatar?: string
  lastActive: Date
}

export interface Workspace {
  id: string
  name: string
  description: string
  owner: TeamMember
  members: TeamMember[]
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  settings: {
    allowComments: boolean
    allowExport: boolean
    autoDeleteAnalysisAfterDays?: number
    defaultAnalysisVisibility: "private" | "workspace" | "public"
  }
}

export interface SharedAnalysis {
  analysisId: string
  workspaceId: string
  sharedBy: TeamMember
  sharedAt: Date
  accessLevel: "view" | "edit"
  expiresAt?: Date
  viewers: TeamMember[]
  editors: TeamMember[]
}

export interface AnalysisComment {
  id: string
  analysisId: string
  author: TeamMember
  content: string
  createdAt: Date
  updatedAt: Date
  replies: AnalysisComment[]
  likes: string[] // User IDs
}

export interface AnalysisAnnotation {
  id: string
  analysisId: string
  author: TeamMember
  type: "highlight" | "note" | "flag" | "question"
  content: string
  coordinates?: { x: number; y: number } // For image annotations
  createdAt: Date
  resolved: boolean
}

export interface CollaborationSession {
  id: string
  workspaceId: string
  analysisId: string
  activeUsers: TeamMember[]
  startedAt: Date
  messages: SessionMessage[]
  status: "active" | "archived"
}

export interface SessionMessage {
  id: string
  author: TeamMember
  content: string
  timestamp: Date
  type: "message" | "action" // e.g., "User X opened analysis Y"
}

class CollaborationService {
  private workspaces: Map<string, Workspace> = new Map()
  private sharedAnalyses: Map<string, SharedAnalysis> = new Map()
  private comments: Map<string, AnalysisComment[]> = new Map()
  private annotations: Map<string, AnalysisAnnotation[]> = new Map()
  private collaborationSessions: Map<string, CollaborationSession> = new Map()

  /**
   * Create a new workspace
   */
  createWorkspace(
    name: string,
    owner: TeamMember,
    options?: {
      description?: string
      isPublic?: boolean
    }
  ): Workspace {
    const workspaceId = `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const workspace: Workspace = {
      id: workspaceId,
      name,
      description: options?.description || "",
      owner,
      members: [owner],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: options?.isPublic || false,
      settings: {
        allowComments: true,
        allowExport: true,
        defaultAnalysisVisibility: "workspace",
      },
    }

    this.workspaces.set(workspaceId, workspace)
    return workspace
  }

  /**
   * Get workspace by ID
   */
  getWorkspace(workspaceId: string): Workspace | undefined {
    return this.workspaces.get(workspaceId)
  }

  /**
   * Add member to workspace
   */
  addMemberToWorkspace(workspaceId: string, member: TeamMember, role: UserRole = "editor"): boolean {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) return false

    const exists = workspace.members.some((m) => m.id === member.id)
    if (exists) return false

    const newMember = { ...member, role, joinedAt: new Date() }
    workspace.members.push(newMember)
    workspace.updatedAt = new Date()
    return true
  }

  /**
   * Remove member from workspace
   */
  removeMemberFromWorkspace(workspaceId: string, memberId: string): boolean {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) return false

    if (workspace.owner.id === memberId) return false // Cannot remove owner

    const initialLength = workspace.members.length
    workspace.members = workspace.members.filter((m) => m.id !== memberId)
    workspace.updatedAt = new Date()
    return workspace.members.length < initialLength
  }

  /**
   * Update member role
   */
  updateMemberRole(workspaceId: string, memberId: string, newRole: UserRole): boolean {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) return false

    if (workspace.owner.id === memberId) return false // Cannot change owner role

    const member = workspace.members.find((m) => m.id === memberId)
    if (!member) return false

    member.role = newRole
    workspace.updatedAt = new Date()
    return true
  }

  /**
   * Share analysis with workspace members
   */
  shareAnalysisWithWorkspace(
    analysisId: string,
    workspaceId: string,
    sharedBy: TeamMember,
    accessLevel: "view" | "edit" = "view"
  ): SharedAnalysis | null {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) return null

    const sharedAnalysisId = `shared_${analysisId}_${workspaceId}`

    const shared: SharedAnalysis = {
      analysisId,
      workspaceId,
      sharedBy,
      sharedAt: new Date(),
      accessLevel,
      viewers: workspace.members.filter((m) => m.id !== sharedBy.id),
      editors: accessLevel === "edit" ? workspace.members.filter((m) => m.id !== sharedBy.id) : [],
    }

    this.sharedAnalyses.set(sharedAnalysisId, shared)
    return shared
  }

  /**
   * Add comment to analysis
   */
  addCommentToAnalysis(
    analysisId: string,
    author: TeamMember,
    content: string,
    parentCommentId?: string
  ): AnalysisComment | null {
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const comment: AnalysisComment = {
      id: commentId,
      analysisId,
      author,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      likes: [],
    }

    if (!this.comments.has(analysisId)) {
      this.comments.set(analysisId, [])
    }

    if (parentCommentId) {
      const parentComment = this.findCommentById(analysisId, parentCommentId)
      if (parentComment) {
        parentComment.replies.push(comment)
        return comment
      }
    }

    this.comments.get(analysisId)!.push(comment)
    return comment
  }

  /**
   * Get all comments for analysis
   */
  getCommentsForAnalysis(analysisId: string): AnalysisComment[] {
    return this.comments.get(analysisId) || []
  }

  /**
   * Like/unlike a comment
   */
  toggleCommentLike(analysisId: string, commentId: string, userId: string): boolean {
    const comment = this.findCommentById(analysisId, commentId)
    if (!comment) return false

    const index = comment.likes.indexOf(userId)
    if (index > -1) {
      comment.likes.splice(index, 1)
    } else {
      comment.likes.push(userId)
    }

    return true
  }

  /**
   * Add annotation to analysis
   */
  addAnnotationToAnalysis(
    analysisId: string,
    author: TeamMember,
    type: "highlight" | "note" | "flag" | "question",
    content: string,
    coordinates?: { x: number; y: number }
  ): AnalysisAnnotation {
    const annotationId = `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const annotation: AnalysisAnnotation = {
      id: annotationId,
      analysisId,
      author,
      type,
      content,
      coordinates,
      createdAt: new Date(),
      resolved: false,
    }

    if (!this.annotations.has(analysisId)) {
      this.annotations.set(analysisId, [])
    }

    this.annotations.get(analysisId)!.push(annotation)
    return annotation
  }

  /**
   * Get all annotations for analysis
   */
  getAnnotationsForAnalysis(analysisId: string): AnalysisAnnotation[] {
    return this.annotations.get(analysisId) || []
  }

  /**
   * Resolve annotation
   */
  resolveAnnotation(analysisId: string, annotationId: string): boolean {
    const annotation = this.annotations.get(analysisId)?.find((a) => a.id === annotationId)
    if (!annotation) return false

    annotation.resolved = true
    return true
  }

  /**
   * Start collaboration session
   */
  startCollaborationSession(
    workspaceId: string,
    analysisId: string,
    initiator: TeamMember
  ): CollaborationSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const session: CollaborationSession = {
      id: sessionId,
      workspaceId,
      analysisId,
      activeUsers: [initiator],
      startedAt: new Date(),
      messages: [],
      status: "active",
    }

    this.collaborationSessions.set(sessionId, session)
    return session
  }

  /**
   * Add user to active session
   */
  addUserToSession(sessionId: string, user: TeamMember): boolean {
    const session = this.collaborationSessions.get(sessionId)
    if (!session) return false

    const exists = session.activeUsers.some((u) => u.id === user.id)
    if (!exists) {
      session.activeUsers.push(user)
    }

    return true
  }

  /**
   * Add message to session
   */
  addSessionMessage(sessionId: string, author: TeamMember, content: string): SessionMessage | null {
    const session = this.collaborationSessions.get(sessionId)
    if (!session) return null

    const message: SessionMessage = {
      id: `msg_${Date.now()}`,
      author,
      content,
      timestamp: new Date(),
      type: "message",
    }

    session.messages.push(message)
    return message
  }

  /**
   * Get user permissions in workspace
   */
  getUserPermissionsInWorkspace(workspaceId: string, userId: string): Permission[] {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) return []

    if (workspace.owner.id === userId) {
      return ["view", "edit", "delete", "share", "admin"]
    }

    const member = workspace.members.find((m) => m.id === userId)
    if (!member) return []

    switch (member.role) {
      case "admin":
        return ["view", "edit", "delete", "share", "admin"]
      case "editor":
        return ["view", "edit", "share"]
      case "viewer":
        return ["view"]
      default:
        return []
    }
  }

  /**
   * Check if user can perform action
   */
  canUserPerformAction(workspaceId: string, userId: string, action: Permission): boolean {
    const permissions = this.getUserPermissionsInWorkspace(workspaceId, userId)
    return permissions.includes(action)
  }

  /**
   * Get all workspaces for user
   */
  getUserWorkspaces(userId: string): Workspace[] {
    return Array.from(this.workspaces.values()).filter(
      (workspace) => workspace.owner.id === userId || workspace.members.some((m) => m.id === userId)
    )
  }

  /**
   * Private helper: Find comment by ID recursively
   */
  private findCommentById(analysisId: string, commentId: string): AnalysisComment | undefined {
    const comments = this.comments.get(analysisId)
    if (!comments) return undefined

    for (const comment of comments) {
      if (comment.id === commentId) return comment
      if (comment.replies.length > 0) {
        const found = this.findInReplies(comment.replies, commentId)
        if (found) return found
      }
    }

    return undefined
  }

  /**
   * Private helper: Find in replies
   */
  private findInReplies(replies: AnalysisComment[], commentId: string): AnalysisComment | undefined {
    for (const reply of replies) {
      if (reply.id === commentId) return reply
      if (reply.replies.length > 0) {
        const found = this.findInReplies(reply.replies, commentId)
        if (found) return found
      }
    }
    return undefined
  }

  /**
   * Get activity feed for workspace
   */
  getWorkspaceActivityFeed(workspaceId: string, limit: number = 50) {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) return []

    const activities: any[] = []

    // Collect all comments
    for (const [analysisId, comments] of this.comments) {
      comments.forEach((comment) => {
        activities.push({
          type: "comment",
          timestamp: comment.createdAt,
          user: comment.author,
          content: `Commented on analysis`,
          analysisId,
        })
      })
    }

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return activities.slice(0, limit)
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService()
