const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/calmpath',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log('Connecting to database...')
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('Executing schema...')
    await pool.query(schema)
    
    console.log('Database setup completed successfully!')
    
    // Test the connection by fetching patients
    const result = await pool.query('SELECT COUNT(*) FROM patients')
    console.log(`Found ${result.rows[0].count} patients in the database`)
    
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase() 