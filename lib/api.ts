const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  age?: number
  status: 'Active' | 'Invited' | 'Inactive' | 'ok'
  care_level?: 'low' | 'medium' | 'high'
  roomNumber?: string
  medicalNotes?: string
  lastInteraction?: string
  profileImageUrl?: string
  admissionDate?: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive?: boolean
  userId?: string
  facilityId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePatientRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  age?: number
  care_level?: 'low' | 'medium' | 'high'
  roomNumber?: string
  medicalNotes?: string
  emergencyContact?: string
  emergencyPhone?: string
  facility_id?: string
  message?: string
}

export interface PatientStats {
  total: number
  active: number
  invited: number
  inactive: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || 'An error occurred',
          message: data.message,
        }
      }

      return { data }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: 'Network error occurred',
      }
    }
  }

  // Patient Management
  async getPatients(facilityId?: string, includeStats = false): Promise<ApiResponse<{ patients: Patient[]; stats?: PatientStats }>> {
    const params = new URLSearchParams()
    if (facilityId) params.append('facility_id', facilityId)
    if (includeStats) params.append('stats', 'true')
    
    const queryString = params.toString()
    const endpoint = `/api/patients${queryString ? `?${queryString}` : ''}`
    
    return this.request<{ patients: Patient[]; stats?: PatientStats }>(endpoint)
  }

  async createPatient(patientData: CreatePatientRequest): Promise<ApiResponse<{ patient: Patient; message: string }>> {
    return this.request<{ patient: Patient; message: string }>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    })
  }

  async getPatient(id: string): Promise<ApiResponse<{ patient: Patient }>> {
    return this.request<{ patient: Patient }>(`/api/patients/${id}`)
  }

  async updatePatientStatus(id: string, status: Patient['status']): Promise<ApiResponse<{ patient: Patient }>> {
    return this.request<{ patient: Patient }>(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async deletePatient(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/patients/${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient() 