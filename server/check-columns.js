import pool from './db.js';

async function checkColumns() {
  try {
    console.log('Checking columns in applications table...');
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'applications'
      ORDER BY column_name;
    `);
    
    console.log('Columns found:');
    result.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
    
    const hasLeadType = result.rows.some(r => r.column_name === 'lead_type');
    console.log(`Has 'lead_type' column? ${hasLeadType ? 'YES' : 'NO'}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkColumns();
