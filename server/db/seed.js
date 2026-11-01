// Fills an empty database with starter content from the resume.
// Run with --force to wipe existing content and reseed.
// If the resume folder sits next to this project, the portrait, logo, certificates
// and resume PDF are uploaded too (to Vercel Blob when BLOB_READ_WRITE_TOKEN is set,
// otherwise to uploads/). Set SEED_ASSETS_DIR to point elsewhere.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';
import { saveFile } from '../src/storage.js';
import { seedContent } from './content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = process.env.SEED_ASSETS_DIR || path.resolve(__dirname, '../../..');
const force = process.argv.includes('--force');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf' };

async function copyAsset(relPath, targetName) {
  const src = path.join(ASSETS, relPath);
  if (!fs.existsSync(src)) return '';
  const mime = MIME[path.extname(src).toLowerCase()];
  return saveFile(fs.readFileSync(src), targetName, mime);
}

const TABLES = ['experiences', 'projects', 'education', 'skills', 'languages', 'certifications', 'awards', 'leadership'];

try {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM experiences');
  if (rows[0].n > 0 && !force) {
    console.log('Content already exists. Run "npm run db:seed -- --force" to wipe and reseed.');
    process.exit(0);
  }
  if (force) await pool.query(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY`);

  await seedContent(pool, copyAsset);

  console.log('Seed complete');
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
