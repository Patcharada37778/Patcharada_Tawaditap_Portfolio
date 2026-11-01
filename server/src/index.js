import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { query } from './db.js';
import { login, requireAuth } from './auth.js';
import { resources, profileFields, pickFields } from './resources.js';
import { ALLOWED, UPLOAD_DIR, saveFile } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
const ON_VERCEL = Boolean(process.env.VERCEL);

const app = express();
// Behind Vercel's proxy, trust it for the visitor's IP (used by rate limiting).
if (ON_VERCEL) app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));
// Sandbox uploaded files so an SVG or PDF opened directly can't run scripts on this site.
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox"),
}));

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const ORDER = 'ORDER BY sort_order ASC, id ASC';

// ---------- Auth ----------
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
app.post('/api/auth/login', loginLimiter, login);
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: req.user.sub }));

// ---------- Public: whole portfolio in one call ----------
app.get('/api/portfolio', wrap(async (req, res) => {
  const [profile, ...lists] = await Promise.all([
    query('SELECT * FROM profile WHERE id = 1'),
    ...Object.keys(resources).map((t) => query(`SELECT * FROM ${t} ${ORDER}`)),
  ]);
  const data = { profile: profile.rows[0] || {} };
  Object.keys(resources).forEach((t, i) => { data[t] = lists[i].rows; });
  res.json(data);
}));

// ---------- Profile (single row) ----------
app.get('/api/profile', wrap(async (req, res) => {
  const { rows } = await query('SELECT * FROM profile WHERE id = 1');
  res.json(rows[0] || {});
}));

app.put('/api/profile', requireAuth, wrap(async (req, res) => {
  const values = pickFields(req.body, profileFields);
  const cols = Object.keys(values);
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await query(
    `UPDATE profile SET ${set}, updated_at = now() WHERE id = 1 RETURNING *`,
    cols.map((c) => values[c]),
  );
  res.json(rows[0]);
}));

// ---------- File uploads (images and PDFs) ----------
// Vercel caps request bodies at 4.5 MB, so uploads there are limited to 4 MB.
const MAX_MB = ON_VERCEL ? 4 : 15;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED[file.mimetype]) cb(null, true);
    else cb(Object.assign(new Error('Only JPG, PNG, WEBP, GIF, SVG or PDF files can be uploaded.'), { status: 400 }));
  },
});

app.post('/api/upload', requireAuth, upload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a file to upload.' });
  const url = await saveFile(req.file.buffer, req.file.originalname, req.file.mimetype);
  res.json({ url, name: req.file.originalname, size: req.file.size });
}));

// ---------- Generic CRUD for list content ----------
function getResource(req, res) {
  const def = resources[req.params.resource];
  if (!def) res.status(404).json({ error: 'Unknown content type.' });
  return def;
}

app.get('/api/:resource', wrap(async (req, res) => {
  if (!getResource(req, res)) return;
  const { rows } = await query(`SELECT * FROM ${req.params.resource} ${ORDER}`);
  res.json(rows);
}));

app.post('/api/:resource', requireAuth, wrap(async (req, res) => {
  const def = getResource(req, res);
  if (!def) return;
  const values = pickFields(req.body, def.fields);
  const missing = def.required.filter((f) => !values[f]);
  if (missing.length) return res.status(400).json({ error: `Fill in ${missing.join(', ')}.` });
  const cols = Object.keys(values);
  const { rows } = await query(
    `INSERT INTO ${req.params.resource} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
    cols.map((c) => values[c]),
  );
  res.status(201).json(rows[0]);
}));

app.put('/api/:resource/:id', requireAuth, wrap(async (req, res) => {
  const def = getResource(req, res);
  if (!def) return;
  const values = pickFields(req.body, def.fields);
  const missing = def.required.filter((f) => f in values && !values[f]);
  if (missing.length) return res.status(400).json({ error: `Fill in ${missing.join(', ')}.` });
  const cols = Object.keys(values);
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
  const { rows } = await query(
    `UPDATE ${req.params.resource} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} WHERE id = $${cols.length + 1} RETURNING *`,
    [...cols.map((c) => values[c]), req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Item not found.' });
  res.json(rows[0]);
}));

app.delete('/api/:resource/:id', requireAuth, wrap(async (req, res) => {
  if (!getResource(req, res)) return;
  await query(`DELETE FROM ${req.params.resource} WHERE id = $1`, [req.params.id]);
  res.status(204).end();
}));

// ---------- Serve the built React app in production ----------
if (!ON_VERCEL && fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^\/(?!api|uploads).*/, (req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

// ---------- Errors ----------
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? `File is larger than ${MAX_MB} MB.` : err.message });
  }
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server. Check the server log, then retry.' });
});

// On Vercel the exported app is run as a function; locally it listens on a port.
if (!ON_VERCEL) {
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => console.log(`API ready on http://localhost:${port}`));
}

export default app;
