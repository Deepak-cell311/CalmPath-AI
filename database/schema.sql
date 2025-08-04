-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    age INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ok' CHECK (status IN ('Active', 'Invited', 'Inactive', 'ok')),
    room_number VARCHAR(50),
    care_level VARCHAR(10) DEFAULT 'low' CHECK (care_level IN ('low', 'medium', 'high')),
    medical_notes TEXT,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_image_url VARCHAR(500),
    admission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    user_id UUID,
    facility_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Create index on facility_id for filtering
CREATE INDEX IF NOT EXISTS idx_patients_facility_id ON patients(facility_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- Create index on date_added for sorting
CREATE INDEX IF NOT EXISTS idx_patients_date_added ON patients(date_added DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO patients (first_name, last_name, email, phone, status, age, care_level, room_number) VALUES
    ('John', 'Doe', 'john.doe@example.com', '+1-555-0123', 'Active', 65, 'low', '101'),
    ('Jane', 'Smith', 'jane.smith@example.com', '+1-555-0124', 'Invited', 72, 'medium', '102'),
    ('Mike', 'Johnson', 'mike.johnson@example.com', '+1-555-0125', 'Inactive', 58, 'high', '103')
ON CONFLICT (email) DO NOTHING; 