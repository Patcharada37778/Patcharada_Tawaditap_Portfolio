import { useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { uploadFile } from '../api.js';

// Uploads a file to the server and reports back its URL.
export default function FileInput({ value, onChange, accept = 'image/*', kind = 'image', id }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isImage = kind === 'image' && value;
  return (
    <>
      <div className="file-field">
        {isImage ? <img src={value} alt="" className="preview" /> : <div className="preview">{value ? 'PDF' : '—'}</div>}
        <div className="meta">{value ? <a href={value} target="_blank" rel="noopener">{value.split('/').pop()}</a> : 'No file'}</div>
        <input ref={ref} id={id} type="file" accept={accept} hidden onChange={pick} />
        <Button variant="line" size="sm" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? 'Uploading...' : value ? 'Replace' : 'Upload'}
        </Button>
        {value && !busy && <Button variant="ghost" size="sm" onClick={() => onChange('')}>Remove</Button>}
      </div>
      {error && <div className="form-text text-destructive">{error}</div>}
    </>
  );
}
