import { useState, useEffect, createContext, useContext } from 'react'
import { authClient, User } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, accountType: string, inviteCode?: string) => Promise<void>
  inviteLogin: (email: string, inviteCode: string, accountType: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const loadUser = async () => {
    try {
      if (authClient.isAuthenticated()) {
        const userData = await authClient.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error loading user:', error)
      // Token might be invalid, remove it
      authClient.removeToken()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const login = async (email: string, password: string, accountType: string, inviteCode?: string) => {
    try {
      const response = await authClient.login(email, password, accountType, inviteCode)
      setUser(response.user)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const inviteLogin = async (email: string, inviteCode: string, accountType: string) => {
    try {
      const response = await authClient.inviteLogin(email, inviteCode, accountType)
      setUser(response.user)
    } catch (error) {
      console.error('Invite login error:', error)
      throw error
    }
  }

  const logout = () => {
    authClient.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      if (authClient.isAuthenticated()) {
        const userData = await authClient.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      inviteLogin,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 