// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'student' | 'agent' | 'owner' | 'service-provider'
  phone?: string
  university?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  token?: string
  user?: any
}

class ApiService {
  private getHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  // Auth APIs
  async register(data: RegisterData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }

      // Store token in localStorage
      if (result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async getProfile(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: this.getHeaders(token),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch profile')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  // Dashboard APIs
  async getStudentDashboard(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/student`, {
        method: 'GET',
        headers: this.getHeaders(token),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch dashboard')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async getAgentDashboard(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/agent`, {
        method: 'GET',
        headers: this.getHeaders(token),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch dashboard')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async getOwnerDashboard(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/owner`, {
        method: 'GET',
        headers: this.getHeaders(token),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch dashboard')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async getServiceProviderDashboard(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/service-provider`, {
        method: 'GET',
        headers: this.getHeaders(token),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch dashboard')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  // Properties APIs
  async getProperties(params?: any): Promise<ApiResponse<any>> {
    try {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_URL}/api/properties${queryString}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch properties')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async getMyProperties(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/properties/my/properties`, {
        method: 'GET',
        headers: this.getHeaders(token),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch properties')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  // Utility methods
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  getUser(): any | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

export const api = new ApiService()
export default api