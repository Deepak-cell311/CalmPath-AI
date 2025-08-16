const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  accountType: string
  facilityId?: string
  usedInviteCode?: boolean
}

export interface LoginResponse {
  success: boolean
  user: User
  token: string
}

export interface AuthError {
  error: string
  message?: string
}

class AuthClient {
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'An error occurred')
    }

    return data
  }

  // Token management
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      console.log("AuthClient: Storing token:", token.substring(0, 20) + "...")
      console.log("AuthClient: localStorage available:", !!window.localStorage)
      console.log("AuthClient: Current localStorage authToken:", localStorage.getItem('authToken')?.substring(0, 20) + "...")
      
      try {
        localStorage.setItem('authToken', token)
        console.log("AuthClient: Token stored successfully")
      } catch (error) {
        console.error("AuthClient: Error storing token:", error)
      }
      
      console.log("AuthClient: Token stored, verifying:", localStorage.getItem('authToken')?.substring(0, 20) + "...")
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('authToken')
        console.log("AuthClient: Retrieved token:", token ? token.substring(0, 20) + "..." : "null")
        return token
      } catch (error) {
        console.error("AuthClient: Error retrieving token:", error)
        return null
      }
    }
    return null
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      try {
        console.log("AuthClient: Removing token")
        localStorage.removeItem('authToken')
        console.log("AuthClient: Token removed successfully")
      } catch (error) {
        console.error("AuthClient: Error removing token:", error)
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Authentication methods
  async login(email: string, password: string, accountType: "Patient" | "Family Member" | "Facility Staff", inviteCode?: string): Promise<LoginResponse> {
    console.log("AuthClient: Login attempt for:", email, accountType)
    
    const data = await this.request<LoginResponse>('/api/auth/login-token', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        accountType,
        inviteCode: inviteCode?.trim() || undefined
      }),
    })

    console.log("AuthClient: Login successful, storing token")
    // Store the token
    this.setToken(data.token)
    return data
  }

  async inviteLogin(email: string, inviteCode: string, accountType: "Patient" | "Family Member" | "Facility Staff"): Promise<LoginResponse> {
    console.log("AuthClient: Invite login attempt for:", email, accountType, inviteCode)
    
    const data = await this.request<LoginResponse>('/api/auth/invite-login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        inviteCode: inviteCode.trim(),
        accountType
      }),
    })

    console.log("AuthClient: Invite login successful, storing token")
    // Store the token
    this.setToken(data.token)
    return data
  }

  async getCurrentUser(): Promise<User> {
    console.log("AuthClient: Getting current user")
    return this.request<User>('/api/auth/user-token')
  }

  async logout(): Promise<void> {
    this.removeToken()
  }

  // Decode token to get user info (for debugging)
  decodeToken(): any {
    const token = this.getToken()
    if (!token) return null

    try {
      console.log("AuthClient: Decoding token:", token.substring(0, 20) + "...")
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      console.log("AuthClient: Token decoded successfully:", decoded)
      return decoded
    } catch (error) {
      console.error('AuthClient: Error decoding token:', error)
      return null
    }
  }
}

export const authClient = new AuthClient() 