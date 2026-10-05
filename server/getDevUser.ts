import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    let res = await pool.query('SELECT id FROM users LIMIT 1');
    if (res.rows.length > 0) {
      console.log('USER_ID=' + res.rows[0].id);
    } else {
      res = await pool.query(
        'INSERT INTO users (clerk_user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
        ['dev_user_1', 'Dev User', 'dev@example.com']
      );
      console.log('USER_ID=' + res.rows[0].id);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
