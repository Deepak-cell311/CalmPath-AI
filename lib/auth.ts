const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  accountType: string
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
      localStorage.setItem('authToken', token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken')
    }
    return null
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Authentication methods
  async login(email: string, password: string, accountType: string, inviteCode?: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/api/auth/login-token', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        accountType,
        inviteCode: inviteCode?.trim() || undefined
      }),
    })

    // Store the token
    this.setToken(data.token)
    return data
  }

  async inviteLogin(email: string, inviteCode: string, accountType: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/api/auth/invite-login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        inviteCode: inviteCode.trim(),
        accountType
      }),
    })

    // Store the token
    this.setToken(data.token)
    return data
  }

  async getCurrentUser(): Promise<User> {
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
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      return decoded
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }
}

export const authClient = new AuthClient() 