import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Workaround for Digital Ocean managed database SSL certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});

export default pool;
