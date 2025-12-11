"use client"

import { useState } from "react"
import { ChevronDown, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Workspace, TeamMember } from "@/lib/collaboration-service"

interface TeamWorkspaceSelectorProps {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  currentUser: TeamMember
  onWorkspaceChange?: (workspace: Workspace) => void
  onCreateWorkspace?: () => void
}

export function TeamWorkspaceSelector({
  currentWorkspace,
  workspaces,
  currentUser,
  onWorkspaceChange,
  onCreateWorkspace,
}: TeamWorkspaceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getUserRoleInWorkspace = (workspace: Workspace): string => {
    if (workspace.owner.id === currentUser.id) return "Owner"
    return workspace.members.find((m) => m.id === currentUser.id)?.role || "Member"
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "bg-purple-500/20 text-purple-700"
      case "admin":
        return "bg-red-500/20 text-red-700"
      case "editor":
        return "bg-blue-500/20 text-blue-700"
      case "viewer":
        return "bg-gray-500/20 text-gray-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-48">
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm truncate">
              {currentWorkspace?.name || "No Workspace"}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentWorkspace?.members.length || 0} members
            </p>
          </div>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Workspace List */}
        <div className="max-h-64 overflow-y-auto">
          {workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => {
                  onWorkspaceChange?.(workspace)
                  setIsOpen(false)
                }}
                className="cursor-pointer flex items-center justify-between py-2"
              >
                <div>
                  <p className="font-medium text-sm">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground">{workspace.members.length} members</p>
                </div>
                <Badge className={getRoleBadgeColor(getUserRoleInWorkspace(workspace))}>
                  {getUserRoleInWorkspace(workspace)}
                </Badge>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-2 text-sm text-muted-foreground text-center">
              No workspaces yet
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuItem onClick={() => onCreateWorkspace?.()} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
