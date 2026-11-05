// Saves uploaded files. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set
// (Vercel can't keep files on disk), otherwise the local uploads/ folder.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { put, head, BlobNotFoundError } from '@vercel/blob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, '../uploads');
export const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export const ALLOWED = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'image/svg+xml': '.svg', 'application/pdf': '.pdf',
};

// Clean up the original name: "My Resume.pdf" -> "My_Resume"
function baseName(originalName) {
  return path.parse(originalName).name
    .normalize('NFKD').replace(/[^\w.-]+/g, '_').replace(/^[._]+|[._]+$/g, '').slice(0, 80)
    || crypto.randomBytes(6).toString('hex');
}

async function blobExists(pathname) {
  try { await head(pathname); return true; } catch (err) {
    if (err instanceof BlobNotFoundError) return false;
    throw err;
  }
}

// Keeps the file's own name, adding -2, -3... if that name is taken. Returns its public URL.
export async function saveFile(buffer, originalName, mimetype) {
  const ext = ALLOWED[mimetype];
  if (!ext) throw Object.assign(new Error('Only JPG, PNG, WEBP, GIF, SVG or PDF files can be uploaded.'), { status: 400 });
  const base = baseName(originalName);

  if (useBlob()) {
    try {
      let name = `${base}${ext}`;
      for (let i = 2; await blobExists(`uploads/${name}`); i++) name = `${base}-${i}${ext}`;
      const blob = await put(`uploads/${name}`, buffer, { access: 'public', contentType: mimetype, addRandomSuffix: false });
      return blob.url;
    } catch (err) {
      console.error(err);
      throw Object.assign(new Error(`File storage (Vercel Blob) refused the upload: ${err.message}`), { status: 502 });
    }
  }

  // Vercel's disk is read-only, so without a Blob store there is nowhere to save the file.
  if (process.env.VERCEL) {
    throw Object.assign(new Error('Uploads need a Vercel Blob store. In Vercel, open this project, go to Storage, add a Blob store, then redeploy.'), { status: 503 });
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  let name = `${base}${ext}`;
  for (let i = 2; fs.existsSync(path.join(UPLOAD_DIR, name)); i++) name = `${base}-${i}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}
