import 'dotenv/config';
import { pool } from '../src/db.js';
import { SCHEMA } from './schema.js';

try {
  await pool.query(SCHEMA);
  console.log('Schema ready');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
