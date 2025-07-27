import { NextRequest, NextResponse } from 'next/server'
import { getPatientById, updatePatientStatus, deletePatient } from '@/lib/db'
import { z } from 'zod'

const updatePatientSchema = z.object({
  status: z.enum(['Active', 'Invited', 'Inactive']).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await getPatientById(params.id)
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updatePatientSchema.parse(body)
    
    const patient = await getPatientById(params.id)
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Update patient status if provided
    if (validatedData.status) {
      const updatedPatient = await updatePatientStatus(params.id, validatedData.status)
      return NextResponse.json({ patient: updatedPatient })
    }

    // TODO: Add other field updates here
    return NextResponse.json({ patient })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await getPatientById(params.id)
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    await deletePatient(params.id)
    
    return NextResponse.json({ 
      message: 'Patient deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    )
  }
} 