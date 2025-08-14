import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import type { CreatePatientRequest, Patient, PatientStats } from '../lib/api';
import { useAuth } from "@/hooks/useAuth"

export function usePatients(facilityId?: string) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {user} = useAuth()

  const fetchPatients = useCallback(async () => {
    if (!facilityId) {
      console.log("usePatients: No facilityId provided, skipping fetch");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("usePatients: Fetching patients for facilityId:", facilityId);
      const response = await apiClient.getPatients(facilityId, true);
      console.log("usePatients: Received response:", response);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      if (response.data) {
        setPatients(response.data.patients || []);
        setStats(response.data.stats || null);
      }
    } catch (err) {
      console.error("usePatients: Error fetching patients:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    console.log("usePatients: useEffect triggered with facilityId:", facilityId);
    if (facilityId) {
      fetchPatients();
    } else {
      console.log("usePatients: No facilityId, clearing patients");
      setPatients([]);
      setStats(null);
    }
  }, [facilityId, fetchPatients]);

  const createPatient = useCallback(async (data: CreatePatientRequest): Promise<boolean> => {
    try {
      setError(null)
      
      const patientData = {
        ...data,
        facility_id: facilityId,
        userId: user?.id,
      }
      
      console.log("usePatients: Creating patient with data:", patientData);
      console.log("usePatients: facilityId being used:", facilityId);
      
      const response = await apiClient.createPatient(patientData)
      console.log("usePatients: Patient creation response:", response);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Refresh the patients list
      await fetchPatients();
      
      return true;
    } catch (err) {
      console.error("usePatients: Error creating patient:", err);
      setError(err instanceof Error ? err.message : 'Failed to create patient');
      return false;
    }
  }, [facilityId, fetchPatients]);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiClient.deletePatient(id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Refresh the patients list
      await fetchPatients();
      
      return true;
    } catch (err) {
      console.error("usePatients: Error deleting patient:", err);
      setError(err instanceof Error ? err.message : 'Failed to delete patient');
      return false;
    }
  }, [fetchPatients]);

  const updatePatientStatus = useCallback(async (id: string, status: Patient['status']): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiClient.updatePatientStatus(id, status);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      // Refresh the patients list
      await fetchPatients();
      
      return true;
    } catch (err) {
      console.error("usePatients: Error updating patient status:", err);
      setError(err instanceof Error ? err.message : 'Failed to update patient status');
      return false;
    }
  }, [fetchPatients]);

  return {
    patients,
    stats,
    loading,
    error,
    createPatient,
    deletePatient,
    updatePatientStatus,
    refetch: fetchPatients
  };
} 