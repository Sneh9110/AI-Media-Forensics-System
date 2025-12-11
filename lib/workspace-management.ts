/**
 * Workspace Management Service
 * Manages team workspaces, member lifecycle, and workspace settings
 */

import type { Workspace, TeamMember } from "./collaboration-service"

export interface WorkspaceInvite {
  id: string
  workspaceId: string
  email: string
  invitedBy: TeamMember
  createdAt: Date
  expiresAt: Date
  status: "pending" | "accepted" | "rejected" | "expired"
  role: "admin" | "editor" | "viewer"
}

export interface WorkspaceAuditLog {
  id: string
  workspaceId: string
  action: string
  actor: TeamMember
  affectedUser?: TeamMember
  timestamp: Date
  details: Record<string, any>
}

class WorkspaceManagementService {
  private workspaceInvites: Map<string, WorkspaceInvite> = new Map()
  private auditLogs: Map<string, WorkspaceAuditLog[]> = new Map()
  private workspaceMemberStats: Map<string, any> = new Map()

  /**
   * Invite user to workspace
   */
  createWorkspaceInvite(
    workspaceId: string,
    email: string,
    invitedBy: TeamMember,
    role: "admin" | "editor" | "viewer" = "editor"
  ): WorkspaceInvite {
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7-day expiry

    const invite: WorkspaceInvite = {
      id: inviteId,
      workspaceId,
      email,
      invitedBy,
      createdAt: new Date(),
      expiresAt,
      status: "pending",
      role,
    }

    this.workspaceInvites.set(inviteId, invite)
    return invite
  }

  /**
   * Accept workspace invite
   */
  acceptWorkspaceInvite(inviteId: string): WorkspaceInvite | null {
    const invite = this.workspaceInvites.get(inviteId)
    if (!invite || invite.status !== "pending" || new Date() > invite.expiresAt) {
      return null
    }

    invite.status = "accepted"
    return invite
  }

  /**
   * Reject workspace invite
   */
  rejectWorkspaceInvite(inviteId: string): boolean {
    const invite = this.workspaceInvites.get(inviteId)
    if (!invite) return false

    invite.status = "rejected"
    return true
  }

  /**
   * Get pending invites for user
   */
  getPendingInvitesForUser(email: string): WorkspaceInvite[] {
    return Array.from(this.workspaceInvites.values()).filter(
      (invite) =>
        invite.email === email &&
        invite.status === "pending" &&
        new Date() <= invite.expiresAt
    )
  }

  /**
   * Get all invites for workspace
   */
  getWorkspaceInvites(workspaceId: string): WorkspaceInvite[] {
    return Array.from(this.workspaceInvites.values()).filter((invite) => invite.workspaceId === workspaceId)
  }

  /**
   * Log audit event
   */
  logAuditEvent(
    workspaceId: string,
    action: string,
    actor: TeamMember,
    details: Record<string, any>,
    affectedUser?: TeamMember
  ): WorkspaceAuditLog {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const auditLog: WorkspaceAuditLog = {
      id: logId,
      workspaceId,
      action,
      actor,
      affectedUser,
      timestamp: new Date(),
      details,
    }

    if (!this.auditLogs.has(workspaceId)) {
      this.auditLogs.set(workspaceId, [])
    }

    this.auditLogs.get(workspaceId)!.push(auditLog)
    return auditLog
  }

  /**
   * Get audit logs for workspace
   */
  getWorkspaceAuditLogs(workspaceId: string, limit: number = 100): WorkspaceAuditLog[] {
    const logs = this.auditLogs.get(workspaceId) || []
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
  }

  /**
   * Get audit logs for specific user in workspace
   */
  getUserAuditLogsInWorkspace(workspaceId: string, userId: string, limit: number = 50): WorkspaceAuditLog[] {
    const logs = this.auditLogs.get(workspaceId) || []
    return logs
      .filter((log) => log.actor.id === userId || log.affectedUser?.id === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Get workspace statistics
   */
  getWorkspaceStats(workspace: Workspace) {
    const stats = {
      workspaceId: workspace.id,
      totalMembers: workspace.members.length,
      activeMembers: workspace.members.filter((m) => {
        const hoursAgo = (Date.now() - m.lastActive.getTime()) / (1000 * 60 * 60)
        return hoursAgo < 24
      }).length,
      admins: workspace.members.filter((m) => m.role === "admin").length,
      editors: workspace.members.filter((m) => m.role === "editor").length,
      viewers: workspace.members.filter((m) => m.role === "viewer").length,
      createdAt: workspace.createdAt,
      lastUpdated: workspace.updatedAt,
      daysActive: Math.floor((Date.now() - workspace.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    }

    this.workspaceMemberStats.set(workspace.id, stats)
    return stats
  }

  /**
   * Get member activity summary
   */
  getMemberActivitySummary(workspaceId: string, memberId: string) {
    const auditLogs = this.getAuditLogsInWorkspace(workspaceId, memberId)

    const actionCounts: Record<string, number> = {}
    let lastActivity = null

    auditLogs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
      if (!lastActivity || log.timestamp > lastActivity) {
        lastActivity = log.timestamp
      }
    })

    return {
      memberId,
      totalActions: auditLogs.length,
      actionBreakdown: actionCounts,
      lastActivity,
    }
  }

  /**
   * Bulk invite users to workspace
   */
  bulkInviteUsers(
    workspaceId: string,
    emails: string[],
    invitedBy: TeamMember,
    role: "admin" | "editor" | "viewer" = "editor"
  ): WorkspaceInvite[] {
    return emails.map((email) => this.createWorkspaceInvite(workspaceId, email, invitedBy, role))
  }

  /**
   * Get pending invites count for workspace
   */
  getPendingInvitesCount(workspaceId: string): number {
    return this.getWorkspaceInvites(workspaceId).filter((invite) => invite.status === "pending").length
  }

  /**
   * Archive workspace
   */
  archiveWorkspace(workspaceId: string): boolean {
    // In production, this would update database
    console.log(`[Archive] Workspace ${workspaceId} archived`)
    return true
  }

  /**
   * Delete workspace
   */
  deleteWorkspace(workspaceId: string): boolean {
    this.workspaceInvites = new Map(
      Array.from(this.workspaceInvites.entries()).filter(([_, invite]) => invite.workspaceId !== workspaceId)
    )

    this.auditLogs.delete(workspaceId)
    this.workspaceMemberStats.delete(workspaceId)

    console.log(`[Delete] Workspace ${workspaceId} deleted`)
    return true
  }

  /**
   * Private helper
   */
  private getAuditLogsInWorkspace(workspaceId: string, userId: string): WorkspaceAuditLog[] {
    return this.auditLogs.get(workspaceId)?.filter((log) => log.actor.id === userId) || []
  }

  /**
   * Export workspace member list
   */
  exportMemberList(workspace: Workspace): string {
    const headers = ["Name", "Email", "Role", "Joined At", "Last Active"]
    const rows = workspace.members.map((member) => [
      member.name,
      member.email,
      member.role,
      member.joinedAt.toISOString(),
      member.lastActive.toISOString(),
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    return csv
  }
}

// Export singleton instance
export const workspaceManagement = new WorkspaceManagementService()
