import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Workaround for Digital Ocean managed database SSL certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  console.log('🔄 Running migration to add agent phone tracking columns...\n');
  
  try {
    // Add annual_premium column
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS annual_premium DECIMAL(10,2)
    `);
    console.log('✅ Added annual_premium column');
    
    // Add last_call_date column
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS last_call_date TIMESTAMP
    `);
    console.log('✅ Added last_call_date column');
    
    // Add last_disposition column
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS last_disposition VARCHAR(100)
    `);
    console.log('✅ Added last_disposition column');
    
    // Add call_notes column
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS call_notes TEXT
    `);
    console.log('✅ Added call_notes column');
    
    // Verify migration
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'applications' 
      AND column_name IN ('annual_premium', 'last_call_date', 'last_disposition', 'call_notes')
    `);
    
    console.log('\n📋 Verification - New columns in database:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();
