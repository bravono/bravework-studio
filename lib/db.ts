// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true, // Be more strict in production
  },
  max: 10, // Optional: Set maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Optional: How long a client is allowed to remain idle before being closed
});

export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client); // Pass the client to your operations
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function queryDatabase(queryText: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(queryText, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export { pool, queryDatabase };