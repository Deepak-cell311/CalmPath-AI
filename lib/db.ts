import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/calmpath',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

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

export async function createPatient(patient: Omit<Patient, 'id' | 'lastInteraction' | 'admissionDate' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
  const query = `
    INSERT INTO patients (first_name, last_name, email, phone, age, status, care_level, room_number, medical_notes, emergency_contact, emergency_phone, facility_id, user_id, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `
  const values = [
    patient.firstName, 
    patient.lastName, 
    patient.email, 
    patient.phone, 
    patient.age, 
    patient.status || 'Invited', 
    patient.care_level || 'low', 
    patient.roomNumber, 
    patient.medicalNotes, 
    patient.emergencyContact, 
    patient.emergencyPhone, 
    patient.facilityId, 
    patient.userId || null, // Set to null if userId not provided
    patient.isActive !== false
  ]
  
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
  
  query += ' ORDER BY created_at DESC'
  
  const result = await pool.query(query, values)
  return result.rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    age: row.age,
    status: row.status,
    care_level: row.care_level,
    roomNumber: row.room_number,
    medicalNotes: row.medical_notes,
    lastInteraction: row.last_interaction,
    profileImageUrl: row.profile_image_url,
    admissionDate: row.admission_date,
    emergencyContact: row.emergency_contact,
    emergencyPhone: row.emergency_phone,
    isActive: row.is_active,
    userId: row.user_id,
    facilityId: row.facility_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function updatePatientStatus(id: string, status: Patient['status']): Promise<Patient> {
  const query = `
    UPDATE patients 
    SET status = $1, last_interaction = NOW()
    WHERE id = $2
    RETURNING *
  `
  const result = await pool.query(query, [status, id])
  const row = result.rows[0]
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    age: row.age,
    status: row.status,
    care_level: row.care_level,
    roomNumber: row.room_number,
    medicalNotes: row.medical_notes,
    lastInteraction: row.last_interaction,
    profileImageUrl: row.profile_image_url,
    admissionDate: row.admission_date,
    emergencyContact: row.emergency_contact,
    emergencyPhone: row.emergency_phone,
    isActive: row.is_active,
    userId: row.user_id,
    facilityId: row.facility_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function deletePatient(id: string): Promise<void> {
  const query = 'DELETE FROM patients WHERE id = $1'
  await pool.query(query, [id])
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const query = 'SELECT * FROM patients WHERE id = $1'
  const result = await pool.query(query, [id])
  const row = result.rows[0]
  if (!row) return null
  
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    age: row.age,
    status: row.status,
    care_level: row.care_level,
    roomNumber: row.room_number,
    medicalNotes: row.medical_notes,
    lastInteraction: row.last_interaction,
    profileImageUrl: row.profile_image_url,
    admissionDate: row.admission_date,
    emergencyContact: row.emergency_contact,
    emergencyPhone: row.emergency_phone,
    isActive: row.is_active,
    userId: row.user_id,
    facilityId: row.facility_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
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