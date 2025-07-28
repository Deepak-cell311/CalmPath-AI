import { useState, useEffect, useCallback } from 'react'
import { apiClient, Patient, CreatePatientRequest, PatientStats } from '@/lib/api'

interface UsePatientsReturn {
  patients: Patient[]
  stats: PatientStats | null
  loading: boolean
  error: string | null
  createPatient: (data: CreatePatientRequest) => Promise<boolean>
  deletePatient: (id: string) => Promise<boolean>
  updatePatientStatus: (id: string, status: Patient['status']) => Promise<boolean>
  refreshPatients: () => Promise<void>
}

export function usePatients(facilityId?: string): UsePatientsReturn {
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<PatientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getPatients(facilityId, true)
      
      if (response.error) {
        setError(response.error)
        return
      }
      
      if (response.data) {
        setPatients(response.data.patients ?? [])
        setStats(response.data.stats || null)
      }
    } catch (err) {
      setError('Failed to fetch patients')
      console.error('Error fetching patients:', err)
    } finally {
      setLoading(false)
    }
  }, [facilityId])

  const createPatient = useCallback(async (data: CreatePatientRequest): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await apiClient.createPatient({
        ...data,
        facility_id: facilityId,
      })
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      if (response.data) {
        // Add the new patient to the list
        setPatients(prev => [response.data!.patient, ...prev])
        
        // Update stats
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            total: prev.total + 1,
            invited: prev.invited + 1,
          } : null)
        }
        
        return true
      }
      
      return false
    } catch (err) {
      setError('Failed to create patient')
      console.error('Error creating patient:', err)
      return false
    }
  }, [facilityId, stats])

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await apiClient.deletePatient(id)
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      // Remove the patient from the list
      setPatients(prev => prev.filter(patient => patient && patient.id !== id))
      
      // Update stats
      if (stats) {
        const deletedPatient = patients.find(p => p && p.id === id)
        if (deletedPatient) {
          setStats(prev => prev ? {
            ...prev,
            total: prev.total - 1,
            [deletedPatient.status.toLowerCase()]: prev[deletedPatient.status.toLowerCase() as keyof PatientStats] - 1,
          } : null)
        }
      }
      
      return true
    } catch (err) {
      setError('Failed to delete patient')
      console.error('Error deleting patient:', err)
      return false
    }
  }, [patients, stats])

  const updatePatientStatus = useCallback(async (id: string, status: Patient['status']): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await apiClient.updatePatientStatus(id, status)
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      if (response.data) {
        // Update the patient in the list
        setPatients(prev => prev.map(patient => 
          patient && patient.id === id ? response.data!.patient : patient
        ))
        
        // Update stats
        if (stats) {
          const oldPatient = patients.find(p => p && p.id === id)
          if (oldPatient) {
            setStats(prev => prev ? {
              ...prev,
              [oldPatient.status.toLowerCase()]: prev[oldPatient.status.toLowerCase() as keyof PatientStats] - 1,
              [status.toLowerCase()]: prev[status.toLowerCase() as keyof PatientStats] + 1,
            } : null)
          }
        }
        
        return true
      }
      
      return false
    } catch (err) {
      setError('Failed to update patient status')
      console.error('Error updating patient status:', err)
      return false
    }
  }, [patients, stats])

  const refreshPatients = useCallback(async () => {
    await fetchPatients()
  }, [fetchPatients])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return {
    patients,
    stats,
    loading,
    error,
    createPatient,
    deletePatient,
    updatePatientStatus,
    refreshPatients,
  }
} 