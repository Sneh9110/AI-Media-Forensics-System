/**
 * Authentication Service
 * Handles user registration, login, JWT tokens, sessions, and password management
 */

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: "admin" | "user" | "researcher"
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  emailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpiry?: Date
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  avatar?: string
  phone?: string
  organization?: string
  department?: string
  metadata?: Record<string, any>
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: "Bearer"
}

export interface AuthSession {
  userId: string
  email: string
  name: string
  role: string
  avatar?: string
  accessToken: string
  refreshToken: string
  createdAt: Date
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  sessionId: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  organization?: string
  department?: string
  agreeToTerms: boolean
}

export interface PasswordResetRequest {
  email: string
}

export interface VerificationResult {
  success: boolean
  message: string
  user?: User
  token?: AuthToken
}

export interface AuthConfig {
  jwtSecret: string
  refreshTokenSecret: string
  accessTokenExpiry: number // in seconds
  refreshTokenExpiry: number // in seconds
  emailVerificationExpiry: number // in hours
  passwordResetExpiry: number // in hours
  maxLoginAttempts: number
  lockoutDuration: number // in minutes
}

class AuthenticationService {
  private users: Map<string, User> = new Map()
  private sessions: Map<string, AuthSession> = new Map()
  private loginAttempts: Map<string, { count: number; timestamp: Date }> = new Map()
  private refreshTokenBlacklist: Set<string> = new Set()

  private config: AuthConfig = {
    jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key",
    accessTokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 604800, // 7 days
    emailVerificationExpiry: 24,
    passwordResetExpiry: 1,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
  }

  /**
   * Hash password (simulated - in production use bcryptjs)
   */
  private hashPassword(password: string): string {
    // In production, use proper bcryptjs hashing
    // For demo: simple base64 encoding (DO NOT use in production!)
    return Buffer.from(password + ":" + this.config.jwtSecret).toString("base64")
  }

  /**
   * Compare password with hash
   */
  private comparePasswords(password: string, hash: string): boolean {
    const expectedHash = this.hashPassword(password)
    return expectedHash === hash
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, expirySeconds: number): string {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expirySeconds,
    }
    // Simplified token generation (use jsonwebtoken in production)
    return Buffer.from(JSON.stringify(payload)).toString("base64")
  }

  /**
   * Generate email verification token
   */
  private generateVerificationToken(): string {
    return Buffer.from(Math.random().toString()).toString("base64").substr(0, 32)
  }

  /**
   * Register new user
   */
  async register(request: RegisterRequest): Promise<VerificationResult> {
    // Validate input
    if (!request.email || !request.password || !request.name) {
      return {
        success: false,
        message: "Email, password, and name are required",
      }
    }

    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find((u) => u.email === request.email)
    if (existingUser) {
      return {
        success: false,
        message: "Email already registered",
      }
    }

    // Validate password strength
    if (request.password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters",
      }
    }

    // Create new user
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: request.email.toLowerCase(),
      name: request.name,
      passwordHash: this.hashPassword(request.password),
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      emailVerificationToken: this.generateVerificationToken(),
      twoFactorEnabled: false,
      organization: request.organization,
      department: request.department,
      metadata: {
        signupSource: "web_app",
        agreedToTermsAt: new Date(),
      },
    }

    this.users.set(user.id, user)

    return {
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: {
        ...user,
        passwordHash: "", // Don't return password hash
      },
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<VerificationResult> {
    const user = Array.from(this.users.values()).find((u) => u.emailVerificationToken === token)

    if (!user) {
      return {
        success: false,
        message: "Invalid verification token",
      }
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.updatedAt = new Date()

    return {
      success: true,
      message: "Email verified successfully",
      user: {
        ...user,
        passwordHash: "",
      },
    }
  }

  /**
   * Login user
   */
  async login(
    request: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<VerificationResult> {
    // Check login attempts
    const attempts = this.loginAttempts.get(request.email)
    if (attempts && attempts.count >= this.config.maxLoginAttempts) {
      const lockoutExpiry = new Date(attempts.timestamp.getTime() + this.config.lockoutDuration * 60000)
      if (new Date() < lockoutExpiry) {
        return {
          success: false,
          message: "Account locked due to multiple failed login attempts. Try again later.",
        }
      }
      this.loginAttempts.delete(request.email)
    }

    // Find user
    const user = Array.from(this.users.values()).find(
      (u) => u.email === request.email.toLowerCase()
    )

    if (!user) {
      this.recordLoginAttempt(request.email)
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Check password
    if (!this.comparePasswords(request.password, user.passwordHash)) {
      this.recordLoginAttempt(request.email)
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Check email verification
    if (!user.emailVerified) {
      return {
        success: false,
        message: "Please verify your email before logging in",
      }
    }

    // Clear login attempts
    this.loginAttempts.delete(request.email)

    // Generate tokens
    const accessToken = this.generateToken(user.id, this.config.accessTokenExpiry)
    const refreshToken = this.generateToken(user.id, this.config.refreshTokenExpiry)

    // Create session
    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      accessToken,
      refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.accessTokenExpiry * 1000),
      ipAddress,
      userAgent,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    this.sessions.set(session.sessionId, session)

    // Update last login
    user.lastLogin = new Date()
    user.updatedAt = new Date()

    return {
      success: true,
      message: "Login successful",
      user: {
        ...user,
        passwordHash: "",
      },
      token: {
        accessToken,
        refreshToken,
        expiresIn: this.config.accessTokenExpiry,
        tokenType: "Bearer",
      },
    }
  }

  /**
   * Record failed login attempt
   */
  private recordLoginAttempt(email: string): void {
    const attempts = this.loginAttempts.get(email)
    if (attempts) {
      attempts.count++
      attempts.timestamp = new Date()
    } else {
      this.loginAttempts.set(email, { count: 1, timestamp: new Date() })
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<VerificationResult> {
    // Check if token is blacklisted
    if (this.refreshTokenBlacklist.has(refreshToken)) {
      return {
        success: false,
        message: "Refresh token has been revoked",
      }
    }

    // Find session
    const session = Array.from(this.sessions.values()).find((s) => s.refreshToken === refreshToken)

    if (!session) {
      return {
        success: false,
        message: "Invalid refresh token",
      }
    }

    // Get user
    const user = this.users.get(session.userId)
    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Generate new access token
    const newAccessToken = this.generateToken(user.id, this.config.accessTokenExpiry)
    session.accessToken = newAccessToken
    session.expiresAt = new Date(Date.now() + this.config.accessTokenExpiry * 1000)

    return {
      success: true,
      message: "Token refreshed",
      token: {
        accessToken: newAccessToken,
        refreshToken,
        expiresIn: this.config.accessTokenExpiry,
        tokenType: "Bearer",
      },
    }
  }

  /**
   * Logout user
   */
  async logout(sessionId: string, refreshToken: string): Promise<VerificationResult> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return {
        success: false,
        message: "Session not found",
      }
    }

    // Add refresh token to blacklist
    this.refreshTokenBlacklist.add(refreshToken)

    // Remove session
    this.sessions.delete(sessionId)

    return {
      success: true,
      message: "Logged out successfully",
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<VerificationResult> {
    const user = Array.from(this.users.values()).find((u) => u.email === email.toLowerCase())

    if (!user) {
      return {
        success: false,
        message: "If email exists in our system, a reset link will be sent",
      }
    }

    // Generate reset token
    const resetToken = this.generateVerificationToken()
    user.passwordResetToken = resetToken
    user.passwordResetExpiry = new Date(Date.now() + this.config.passwordResetExpiry * 60 * 60 * 1000)
    user.updatedAt = new Date()

    return {
      success: true,
      message: "Password reset link sent to your email",
      user: {
        ...user,
        passwordHash: "",
      },
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<VerificationResult> {
    const user = Array.from(this.users.values()).find((u) => u.passwordResetToken === token)

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired reset token",
      }
    }

    if (!user.passwordResetExpiry || new Date() > user.passwordResetExpiry) {
      return {
        success: false,
        message: "Reset token has expired",
      }
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters",
      }
    }

    user.passwordHash = this.hashPassword(newPassword)
    user.passwordResetToken = undefined
    user.passwordResetExpiry = undefined
    user.updatedAt = new Date()

    return {
      success: true,
      message: "Password reset successfully",
      user: {
        ...user,
        passwordHash: "",
      },
    }
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | null {
    const user = this.users.get(userId)
    return user
      ? {
          ...user,
          passwordHash: "",
        }
      : null
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | null {
    const user = Array.from(this.users.values()).find((u) => u.email === email.toLowerCase())
    return user
      ? {
          ...user,
          passwordHash: "",
        }
      : null
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): AuthSession | null {
    return this.sessions.get(sessionId) || null
  }

  /**
   * Get all active sessions for user
   */
  getUserActiveSessions(userId: string): AuthSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.userId === userId && s.expiresAt > new Date())
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<Omit<User, "id" | "email" | "passwordHash" | "createdAt">>
  ): Promise<VerificationResult> {
    const user = this.users.get(userId)

    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    Object.assign(user, updates)
    user.updatedAt = new Date()

    return {
      success: true,
      message: "Profile updated successfully",
      user: {
        ...user,
        passwordHash: "",
      },
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<VerificationResult> {
    const user = this.users.get(userId)

    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    if (!this.comparePasswords(currentPassword, user.passwordHash)) {
      return {
        success: false,
        message: "Current password is incorrect",
      }
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters",
      }
    }

    user.passwordHash = this.hashPassword(newPassword)
    user.updatedAt = new Date()

    // Invalidate all sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.userId === userId) {
        this.sessions.delete(sessionId)
      }
    })

    return {
      success: true,
      message: "Password changed successfully. Please log in again.",
    }
  }

  /**
   * Enable 2FA
   */
  async enableTwoFactor(userId: string): Promise<VerificationResult> {
    const user = this.users.get(userId)

    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Generate 2FA secret (simplified - use speakeasy/qrcode in production)
    const secret = Math.random().toString(36).substring(2, 15)
    user.twoFactorSecret = secret
    user.twoFactorEnabled = false // Require verification
    user.updatedAt = new Date()

    return {
      success: true,
      message: "2FA setup initiated",
      user: {
        ...user,
        passwordHash: "",
      },
    }
  }

  /**
   * Verify 2FA token
   */
  async verifyTwoFactorToken(userId: string, token: string): Promise<VerificationResult> {
    const user = this.users.get(userId)

    if (!user || !user.twoFactorSecret) {
      return {
        success: false,
        message: "2FA not set up",
      }
    }

    // Simplified verification (use speakeasy in production)
    if (token === user.twoFactorSecret) {
      user.twoFactorEnabled = true
      user.updatedAt = new Date()

      return {
        success: true,
        message: "Two-factor authentication enabled",
      }
    }

    return {
      success: false,
      message: "Invalid 2FA token",
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<VerificationResult> {
    const user = this.users.get(userId)

    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Delete user
    this.users.delete(userId)

    // Revoke all sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.userId === userId) {
        this.sessions.delete(sessionId)
      }
    })

    return {
      success: true,
      message: "Account deleted successfully",
    }
  }

  /**
   * Get authentication statistics
   */
  getAuthStats() {
    return {
      totalUsers: this.users.size,
      activeSessions: this.sessions.size,
      verifiedUsers: Array.from(this.users.values()).filter((u) => u.emailVerified).length,
      adminUsers: Array.from(this.users.values()).filter((u) => u.role === "admin").length,
      researcherUsers: Array.from(this.users.values()).filter((u) => u.role === "researcher").length,
      twoFactorEnabled: Array.from(this.users.values()).filter((u) => u.twoFactorEnabled).length,
    }
  }
}

/**
 * Authentication error handler
 * Provides standardized error responses for auth failures
 */
export function handleAuthError(error: any): { code: string; message: string } {
  if (error.message.includes("Invalid credentials")) {
    return { code: "AUTH_001", message: "Invalid email or password" }
  }
  if (error.message.includes("User not found")) {
    return { code: "AUTH_002", message: "User account does not exist" }
  }
  if (error.message.includes("Email already registered")) {
    return { code: "AUTH_003", message: "Email is already registered" }
  }
  if (error.message.includes("Token expired")) {
    return { code: "AUTH_004", message: "Authentication token has expired" }
  }
  return { code: "AUTH_000", message: "Authentication failed" }
}

