"use client"

import { useState } from "react"
import { Send, ThumbsUp, Reply, MessageCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { AnalysisComment, TeamMember } from "@/lib/collaboration-service"

interface CollaborationPanelProps {
  analysisId: string
  currentUser: TeamMember
  comments?: AnalysisComment[]
  onCommentAdded?: (comment: AnalysisComment) => void
  readOnly?: boolean
}

export function CollaborationPanel({
  analysisId,
  currentUser,
  comments = [],
  onCommentAdded,
  readOnly = false,
}: CollaborationPanelProps) {
  const [commentText, setCommentText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  const handleSubmitComment = () => {
    if (!commentText.trim()) return

    const newComment: AnalysisComment = {
      id: `comment_${Date.now()}`,
      analysisId,
      author: currentUser,
      content: commentText,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      likes: [],
    }

    onCommentAdded?.(newComment)
    setCommentText("")
    setReplyingTo(null)
  }

  const handleLikeComment = (commentId: string) => {
    const newLiked = new Set(likedComments)
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId)
    } else {
      newLiked.add(commentId)
    }
    setLikedComments(newLiked)
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

  return (
    <div className="space-y-4">
      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Discussion</CardTitle>
          <CardDescription>{comments.length} comment(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment Input */}
          {!readOnly && (
            <div className="space-y-2 pb-4 border-b">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={handleSubmitComment} disabled={!commentText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {replyingTo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => {
                        setReplyingTo(null)
                        setCommentText("")
                      }}
                    >
                      Cancel reply
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  isLiked={likedComments.has(comment.id)}
                  onLike={() => handleLikeComment(comment.id)}
                  onReply={() => {
                    setReplyingTo(comment.id)
                    setCommentText(`@${comment.author.name} `)
                  }}
                  readOnly={readOnly}
                  formatTime={formatTime}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Start the discussion!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Comment Thread Component
function CommentThread({
  comment,
  currentUser,
  isLiked,
  onLike,
  onReply,
  readOnly,
  formatTime,
}: {
  comment: AnalysisComment
  currentUser: TeamMember
  isLiked: boolean
  onLike: () => void
  onReply: () => void
  readOnly: boolean
  formatTime: (date: Date) => string
}) {
  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
            </div>
            {comment.author.id === currentUser.id && !readOnly && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

          {/* Comment Actions */}
          {!readOnly && (
            <div className="flex gap-4 mt-2 pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 gap-1 ${isLiked ? "text-primary" : ""}`}
                onClick={onLike}
              >
                <ThumbsUp className={`h-3 w-3 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-xs">{comment.likes.length}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-6 gap-1" onClick={onReply}>
                <Reply className="h-3 w-3" />
                <span className="text-xs">Reply</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-11 space-y-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarImage src={reply.author.avatar} />
                <AvatarFallback>{reply.author.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-secondary/30 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs">{reply.author.name}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(reply.createdAt)}</span>
                </div>
                <p className="text-xs whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
