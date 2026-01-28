// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

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

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/api/health`)
      return await response.json()
    } catch (error: any) {
      throw new Error(error.message || 'Connection failed')
    }
  }

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<ApiResponse<any>> {
  try {
    console.log('🔐 Logging in user:', credentials.email)
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    })

    const result = await response.json()
    
    console.log('📥 Login result:', result)
    
    if (!response.ok) {
      console.error('❌ Login failed:', result.message)
      throw new Error(result.message || 'Invalid credentials')
    }

    // Store token and user
    if (result.success && result.token) {
      this.setToken(result.token)
      if (result.user) {
        this.setUser(result.user)
      }
    } else {
      throw new Error('Invalid response format')
    }

    return result
  } catch (error: any) {
    console.error('❌ Login error:', error)
    throw new Error(error.message || 'Network error')
  }
}

async register(data: RegisterData): Promise<ApiResponse<any>> {
  try {
    console.log('📝 Registering user:', data.email)
    console.log('🌐 Calling backend:', `${API_URL}/api/auth/register`)
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    const result = await response.json()
    
    console.log('📥 Backend register response:', result)
    
    if (!response.ok) {
      console.error('❌ Registration failed:', result.message)
      throw new Error(result.message || 'Registration failed')
    }

    // Store token if provided
    if (result.success && result.token) {
      this.setToken(result.token)
      if (result.user) {
        this.setUser(result.user)
      }
    } else {
      throw new Error('Invalid response format')
    }

    return result
  } catch (error: any) {
    console.error('❌ Register error:', error)
    throw new Error(error.message || 'Network error')
  }
}
  async getProfile(token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: this.getHeaders(authToken),
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

  async updateProfile(data: any, token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: this.getHeaders(authToken),
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  // Dashboard APIs
  async getStudentDashboard(token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/dashboard/student`, {
        method: 'GET',
        headers: this.getHeaders(authToken),
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

  async getAgentDashboard(token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/dashboard/agent`, {
        method: 'GET',
        headers: this.getHeaders(authToken),
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

  async getOwnerDashboard(token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/dashboard/owner`, {
        method: 'GET',
        headers: this.getHeaders(authToken),
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

  async getServiceProviderDashboard(token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/dashboard/service-provider`, {
        method: 'GET',
        headers: this.getHeaders(authToken),
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

  async getPropertyById(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch property')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async getMyProperties(token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/properties/my/properties`, {
        method: 'GET',
        headers: this.getHeaders(authToken),
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

  async createProperty(data: any, token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        headers: this.getHeaders(authToken),
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create property')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async updateProperty(id: string, data: any, token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(authToken),
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update property')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async deleteProperty(id: string, token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(authToken),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete property')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  // Posts APIs
  async getPosts(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch posts')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async createPost(data: any, token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: this.getHeaders(authToken),
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create post')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  // Bookings APIs
  async getMyBookings(token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/bookings/my-bookings`, {
        method: 'GET',
        headers: this.getHeaders(authToken),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch bookings')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  async createBooking(data: any, token?: string): Promise<ApiResponse<any>> {
    try {
      const authToken = token || this.getToken()
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: this.getHeaders(authToken),
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create booking')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  // Services APIs
  async getServices(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/services`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch services')
      }

      return result
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  // Utility methods
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  setUser(user: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const api = new ApiService()
export default api