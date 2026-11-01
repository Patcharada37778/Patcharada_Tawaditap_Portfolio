// Prepares the database on first use: creates tables, and fills an empty
// database with the starter content. Runs once per server start.
import { pool } from './db.js';
import { SCHEMA } from '../db/schema.js';
import { seedContent } from '../db/content.js';

let ready = null;

async function setup() {
  if (!process.env.DATABASE_URL) {
    throw Object.assign(
      new Error('No database is connected. Add a Postgres database to the project (it sets DATABASE_URL), then redeploy.'),
      { status: 503 },
    );
  }
  // A lock so two server instances starting together don't seed twice.
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(7377801)');
    await client.query(SCHEMA);
    const { rows } = await client.query(
      'SELECT (SELECT count(*) FROM experiences)::int AS n, (SELECT full_name FROM profile WHERE id = 1) AS name',
    );
    if (rows[0].n === 0 && !rows[0].name) {
      await seedContent(client);
      console.log('Database was empty: loaded starter content');
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(7377801)').catch(() => {});
    client.release();
  }
}

export function ensureDatabase() {
  if (!ready) ready = setup().catch((err) => { ready = null; throw err; });
  return ready;
}
