import pool from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('Running lead_type migration...');
    const sql = readFileSync(join(__dirname, 'migrate-add-lead-type.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Migration completed successfully - lead_type column added');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
