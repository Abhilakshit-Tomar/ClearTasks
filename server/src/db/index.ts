import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from the root directory for DATABASE_URL
dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

// Fallback to regular .env if needed
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database connections will fail.');
}

const pool = new Pool({
  connectionString,
});

// Setup a listener for unexpected errors on idle clients
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = () => {
  return pool.connect();
};

export default pool;
