import { NextRequest, NextResponse } from 'next/server'
import { createPatient, getPatients, getPatientStats } from '@/lib/db'
import { sendInvitationEmail } from '@/lib/email'
import { z } from 'zod'

const patientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().optional(),
  facility_id: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facilityId = searchParams.get('facility_id') || undefined
    const includeStats = searchParams.get('stats') === 'true'

    const patients = await getPatients(facilityId)
    
    if (includeStats) {
      const stats = await getPatientStats(facilityId)
      return NextResponse.json({ patients, stats })
    }

    return NextResponse.json({ patients })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = patientSchema.parse(body)
    
    // Create patient with Invited status
    const patient = await createPatient({
      ...validatedData,
      status: 'Invited',
    })

    // Send invitation email
    try {
      await sendInvitationEmail(patient.email, patient.name, patient.message)
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({ 
      patient,
      message: 'Patient invitation sent successfully' 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    )
  }
} 