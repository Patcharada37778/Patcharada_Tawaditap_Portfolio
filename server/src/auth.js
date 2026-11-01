import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

function safeEqual(a, b) {
  return crypto.timingSafeEqual(sha(a), sha(b));
}

export function login(req, res) {
  const { username = '', password = '' } = req.body || {};
  const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ error: 'Admin login is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD and JWT_SECRET in server/.env.' });
  }
  const ok = safeEqual(username, ADMIN_USERNAME) & safeEqual(password, ADMIN_PASSWORD);
  if (!ok) return res.status(401).json({ error: 'Wrong username or password.' });
  const token = jwt.sign({ sub: ADMIN_USERNAME, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Sign in again.' });
  }
}
