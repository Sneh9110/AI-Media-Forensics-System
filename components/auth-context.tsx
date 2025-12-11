"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user" | "researcher"
  avatar?: string
  emailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  signup: (data: SignupData) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  error: string | null
  clearError: () => void
}

export interface SignupData {
  name: string
  email: string
  password: string
  organization?: string
  department?: string
  agreeToTerms: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("accessToken")

        if (storedUser && token) {
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error("Error checking auth:", err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store tokens
      localStorage.setItem("accessToken", data.token.accessToken)
      localStorage.setItem("refreshToken", data.token.refreshToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const refreshToken = localStorage.getItem("refreshToken")
      const sessionId = localStorage.getItem("sessionId")

      // Call logout endpoint
      if (sessionId && refreshToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, refreshToken }),
        })
      }

      // Clear local storage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("sessionId")

      setUser(null)
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupData) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      // Store email for verification
      localStorage.setItem("signupEmail", data.email)

      setUser(result.user)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    setError(null)

    try {
      const token = localStorage.getItem("accessToken")

      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Update failed")
      }

      const updatedUser = { ...user, ...updates } as User
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Update failed"
      setError(errorMessage)
      throw err
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setError(null)

    try {
      const token = localStorage.getItem("accessToken")

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Password change failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Password change failed"
      setError(errorMessage)
      throw err
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    updateProfile,
    changePassword,
    error,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}

/**
 * Hook to check if user has specific role
 */
export function useRole(requiredRole: string | string[]) {
  const { user } = useAuth()

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return user && roles.includes(user.role)
}

/**
 * Hook to get auth tokens
 */
export function useAuthTokens() {
  const [tokens, setTokens] = useState<{ access?: string; refresh?: string }>({})

  useEffect(() => {
    const access = localStorage.getItem("accessToken")
    const refresh = localStorage.getItem("refreshToken")
    setTokens({ access, refresh })
  }, [])

  return tokens
}
