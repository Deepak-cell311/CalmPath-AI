# Patient Management API

This document describes the Patient Management API integration for CalmPath AI.

## Features

- ✅ Create and invite new patients
- ✅ View patient list with real-time stats
- ✅ Update patient status (Active, Invited, Inactive)
- ✅ Delete patients
- ✅ Database integration with PostgreSQL
- ✅ Form validation and error handling
- ✅ Loading states and user feedback
- ✅ Toast notifications for user actions

## Setup Instructions

### 1. Database Setup

1. **Install PostgreSQL** if you haven't already
2. **Create a database**:
   ```sql
   CREATE DATABASE calmpath;
   ```
3. **Set up environment variables** in `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/calmpath
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
4. **Run the database setup script**:
   ```bash
   npm run setup-db
   ```

### 2. API Endpoints

#### GET `/api/patients`
- **Query Parameters**:
  - `facility_id` (optional): Filter patients by facility
  - `stats` (optional): Include statistics in response
- **Response**: List of patients and optional stats

#### POST `/api/patients`
- **Body**: Patient invitation data
- **Response**: Created patient with success message

#### GET `/api/patients/[id]`
- **Response**: Individual patient details

#### PUT `/api/patients/[id]`
- **Body**: Patient update data (status, name, email, phone)
- **Response**: Updated patient

#### DELETE `/api/patients/[id]`
- **Response**: Success message

### 3. Database Schema

The `patients` table includes:
- `id`: UUID primary key
- `name`: Patient's full name
- `email`: Unique email address
- `phone`: Optional phone number
- `status`: Active/Invited/Inactive
- `date_added`: Timestamp when patient was added
- `last_activity`: Last activity timestamp
- `facility_id`: Optional facility association
- `message`: Optional invitation message

### 4. Frontend Integration

The patient management page (`/dashboard/patients`) now includes:

- **Real-time data**: Fetches from API instead of local state
- **Loading states**: Shows spinners during API calls
- **Error handling**: Displays error messages
- **Toast notifications**: User feedback for actions
- **Form validation**: Client and server-side validation
- **Optimistic updates**: UI updates immediately, syncs with server

### 5. Custom Hook

The `usePatients` hook provides:
- Patient data management
- API integration
- Loading and error states
- CRUD operations
- Real-time stats

### 6. Usage Example

```tsx
import { usePatients } from '@/hooks/usePatients'

function PatientComponent() {
  const { 
    patients, 
    stats, 
    loading, 
    error, 
    createPatient, 
    deletePatient 
  } = usePatients()

  const handleInvite = async (data) => {
    const success = await createPatient(data)
    if (success) {
      // Show success message
    }
  }

  return (
    // Your component JSX
  )
}
```

## Next Steps

### Email Integration
To complete the invitation system, implement email sending:

1. **Add email service** (SendGrid, AWS SES, etc.)
2. **Create email templates**
3. **Update API to send emails** when creating patients

### Authentication
Add user authentication to:
1. **Protect API endpoints**
2. **Associate patients with facilities**
3. **Implement role-based access**

### Additional Features
- Patient search and filtering
- Bulk operations
- Patient activity tracking
- Integration with other CalmPath modules

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

2. **API Errors**:
   - Check browser console for network errors
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Ensure API routes are accessible

3. **Form Validation Errors**:
   - Check required fields
   - Verify email format
   - Ensure unique email addresses

### Development

Run the development server:
```bash
npm run dev
```

The patient management page will be available at:
`http://localhost:3000/dashboard/patients` 