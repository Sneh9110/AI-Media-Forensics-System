"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { keyboardShortcuts } from "@/lib/keyboard-shortcuts"

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const handleShowHelp = () => setOpen(true)
    window.addEventListener('show-shortcuts-help', handleShowHelp)

    return () => window.removeEventListener('show-shortcuts-help', handleShowHelp)
  }, [])

  const shortcuts = keyboardShortcuts.getAllShortcuts()
  const filteredShortcuts = shortcuts.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedShortcuts = {
    navigation: shortcuts.filter(s => s.category === 'navigation'),
    file: shortcuts.filter(s => s.category === 'file'),
    analysis: shortcuts.filter(s => s.category === 'analysis'),
    view: shortcuts.filter(s => s.category === 'view'),
    help: shortcuts.filter(s => s.category === 'help'),
  }

  const ShortcutGroup = ({
    title,
    shortcuts: groupShortcuts,
  }: {
    title: string
    shortcuts: typeof shortcuts
  }) => {
    const filtered = groupShortcuts.filter(
      s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filtered.length === 0) return null

    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <div className="space-y-2">
          {filtered.map(shortcut => (
            <div key={shortcut.id} className="flex items-center justify-between p-2 rounded hover:bg-secondary/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{shortcut.name}</p>
                <p className="text-xs text-muted-foreground">{shortcut.description}</p>
              </div>
              <div className="flex gap-1">
                {shortcut.keys.map(key => (
                  <Badge key={key} variant="secondary" className="font-mono text-xs">
                    {key.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Master keyboard shortcuts to navigate and control the application faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search shortcuts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-9"
          />

          <div className="space-y-6 max-h-[calc(80vh-200px)] overflow-y-auto pr-4">
            <ShortcutGroup title="🧭 Navigation" shortcuts={groupedShortcuts.navigation} />
            <ShortcutGroup title="📁 File Operations" shortcuts={groupedShortcuts.file} />
            <ShortcutGroup title="🔍 Analysis" shortcuts={groupedShortcuts.analysis} />
            <ShortcutGroup title="👁️ View" shortcuts={groupedShortcuts.view} />
            <ShortcutGroup title="❓ Help" shortcuts={groupedShortcuts.help} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
