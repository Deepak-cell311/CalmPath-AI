import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/calmpath',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  date_added: string
  status: 'Active' | 'Invited' | 'Inactive'
  last_activity: string
  facility_id?: string
  message?: string
}

export async function createPatient(patient: Omit<Patient, 'id' | 'date_added' | 'last_activity'>): Promise<Patient> {
  const query = `
    INSERT INTO patients (name, email, phone, status, facility_id, message)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `
  const values = [patient.name, patient.email, patient.phone, patient.status, patient.facility_id, patient.message]
  
  const result = await pool.query(query, values)
  return result.rows[0]
}

export async function getPatients(facilityId?: string): Promise<Patient[]> {
  let query = 'SELECT * FROM patients'
  let values: string[] = []
  
  if (facilityId) {
    query += ' WHERE facility_id = $1'
    values = [facilityId]
  }
  
  query += ' ORDER BY date_added DESC'
  
  const result = await pool.query(query, values)
  return result.rows
}

export async function updatePatientStatus(id: string, status: Patient['status']): Promise<Patient> {
  const query = `
    UPDATE patients 
    SET status = $1, last_activity = NOW()
    WHERE id = $2
    RETURNING *
  `
  const result = await pool.query(query, [status, id])
  return result.rows[0]
}

export async function deletePatient(id: string): Promise<void> {
  const query = 'DELETE FROM patients WHERE id = $1'
  await pool.query(query, [id])
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const query = 'SELECT * FROM patients WHERE id = $1'
  const result = await pool.query(query, [id])
  return result.rows[0] || null
}

export async function getPatientStats(facilityId?: string) {
  let query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
      COUNT(CASE WHEN status = 'Invited' THEN 1 END) as invited,
      COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive
    FROM patients
  `
  let values: string[] = []
  
  if (facilityId) {
    query += ' WHERE facility_id = $1'
    values = [facilityId]
  }
  
  const result = await pool.query(query, values)
  return result.rows[0]
}

export default pool 