/**
 * Keyboard Shortcuts Service
 * Global keyboard shortcut management system
 */

export interface Shortcut {
  id: string
  name: string
  description: string
  keys: string[]
  action: () => void
  category: 'navigation' | 'file' | 'analysis' | 'view' | 'help'
  enabled: boolean
}

export class KeyboardShortcutsManager {
  private shortcuts: Map<string, Shortcut> = new Map()
  private isListening = false

  constructor() {
    this.initializeDefaultShortcuts()
  }

  /**
   * Initialize default shortcuts
   */
  private initializeDefaultShortcuts(): void {
    this.registerShortcut({
      id: 'upload',
      name: 'Upload File',
      description: 'Go to upload page',
      keys: ['ctrl', 'u'],
      action: () => window.location.href = '/upload',
      category: 'navigation',
      enabled: true,
    })

    this.registerShortcut({
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Go to dashboard',
      keys: ['ctrl', 'd'],
      action: () => window.location.href = '/dashboard',
      category: 'navigation',
      enabled: true,
    })

    this.registerShortcut({
      id: 'api-docs',
      name: 'API Docs',
      description: 'Go to API documentation',
      keys: ['ctrl', 'shift', 'a'],
      action: () => window.location.href = '/api-docs',
      category: 'navigation',
      enabled: true,
    })

    this.registerShortcut({
      id: 'help',
      name: 'Help',
      description: 'Show keyboard shortcuts help',
      keys: ['?'],
      action: () => this.showHelpModal(),
      category: 'help',
      enabled: true,
    })

    this.registerShortcut({
      id: 'home',
      name: 'Home',
      description: 'Go to home page',
      keys: ['ctrl', 'h'],
      action: () => window.location.href = '/',
      category: 'navigation',
      enabled: true,
    })

    this.registerShortcut({
      id: 'focus-search',
      name: 'Focus Search',
      description: 'Focus on search input',
      keys: ['ctrl', 'f'],
      action: () => this.focusSearch(),
      category: 'file',
      enabled: true,
    })

    this.registerShortcut({
      id: 'escape',
      name: 'Close Modal',
      description: 'Close any open modal or dialog',
      keys: ['escape'],
      action: () => this.closeModal(),
      category: 'view',
      enabled: true,
    })
  }

  /**
   * Register a new shortcut
   */
  registerShortcut(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.id, shortcut)
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: string): Shortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category)
  }

  /**
   * Start listening for keyboard events
   */
  startListening(): void {
    if (this.isListening) return

    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    this.isListening = true
  }

  /**
   * Stop listening for keyboard events
   */
  stopListening(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    this.isListening = false
  }

  /**
   * Handle keyboard down event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return
    }

    const pressedKeys = this.getModifierKeys(event)

    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.enabled && this.matchesShortcut(pressedKeys, shortcut.keys)) {
        event.preventDefault()
        shortcut.action()
        return
      }
    }
  }

  /**
   * Get modifier keys being pressed
   */
  private getModifierKeys(event: KeyboardEvent): string[] {
    const keys: string[] = []

    if (event.ctrlKey || event.metaKey) keys.push('ctrl')
    if (event.shiftKey) keys.push('shift')
    if (event.altKey) keys.push('alt')

    // Add the actual key
    keys.push(event.key.toLowerCase())

    return keys
  }

  /**
   * Check if pressed keys match shortcut keys
   */
  private matchesShortcut(pressed: string[], shortcut: string[]): boolean {
    if (pressed.length !== shortcut.length) return false
    return shortcut.every(key => pressed.includes(key))
  }

  /**
   * Show help modal (can be overridden by app)
   */
  private showHelpModal(): void {
    // This would dispatch an event or call a callback
    window.dispatchEvent(new CustomEvent('show-shortcuts-help'))
  }

  /**
   * Focus search input
   */
  private focusSearch(): void {
    const searchInput = document.querySelector('[data-shortcut="search"]') as HTMLInputElement
    if (searchInput) searchInput.focus()
  }

  /**
   * Close modal
   */
  private closeModal(): void {
    const modal = document.querySelector('[role="dialog"]')
    if (modal) {
      const closeButton = modal.querySelector('[data-dismiss="modal"]') as HTMLButtonElement
      if (closeButton) closeButton.click()
    }
  }
}

/**
 * Create and export singleton instance
 */
export const keyboardShortcuts = new KeyboardShortcutsManager()
