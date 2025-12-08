import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Workaround for Digital Ocean managed database SSL certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Run schema
const runSchema = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Schema executed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running schema:', error.message);
    process.exit(1);
  }
};

runSchema();
