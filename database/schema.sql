-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'Invited' CHECK (status IN ('Active', 'Invited', 'Inactive')),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    facility_id UUID,
    message TEXT,
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
INSERT INTO patients (name, email, phone, status, message) VALUES
    ('John Doe', 'john.doe@example.com', '+1-555-0123', 'Active', 'Welcome to CalmPath!'),
    ('Jane Smith', 'jane.smith@example.com', '+1-555-0124', 'Invited', 'We look forward to working with you.'),
    ('Mike Johnson', 'mike.johnson@example.com', '+1-555-0125', 'Inactive', 'Thank you for choosing CalmPath.')
ON CONFLICT (email) DO NOTHING; 