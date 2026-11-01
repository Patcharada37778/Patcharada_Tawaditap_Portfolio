import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { api } from '../../api.js';
import FileInput from '../../components/FileInput.jsx';

const TEXT_FIELDS = [
  { section: 'Identity' },
  { name: 'full_name', label: 'Full Name', col: 6 },
  { name: 'location', label: 'Location', col: 6 },
  { name: 'headline', label: 'Headline', help: 'Shown under your name, e.g. "Software Engineer & CE student".' },
  { name: 'tagline', label: 'Tagline', help: 'A short line about what you do.' },
  { name: 'availability', label: 'Availability', placeholder: 'Open to internships', help: 'Shown with a status dot in the hero. Leave empty to hide.' },
  { name: 'bio', label: 'About', type: 'textarea', rows: 5 },
  { section: 'Contact' },
  { name: 'email', label: 'Email', type: 'email', col: 6 },
  { name: 'phone', label: 'Phone', col: 6, help: 'Leave empty to keep it off the public site.' },
  { name: 'linkedin_url', label: 'LinkedIn URL', type: 'url', col: 6 },
  { name: 'github_url', label: 'GitHub URL', type: 'url', col: 6 },
  { name: 'website_url', label: 'Other Website', type: 'url' },
];

export default function ProfileEditor() {
  const { notify } = useOutletContext();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { api('/profile').then(setForm).catch((e) => setError(e.message)); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError('');
    try {
      setForm(await api('/profile', { method: 'PUT', body: form, auth: true }));
      notify('Profile saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return error ? <Alert variant="danger">{error}</Alert> : <div className="page-loading">Loading...</div>;

  return (
    <Form onSubmit={save}>
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="admin-title">Profile & Contact</h1>
          <p className="admin-sub">Your name, photo, resume and contact details.</p>
        </div>
        <Button type="submit" variant="ink" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="card-x mb-4" style={{ padding: 20 }}>
        <div className="sec-label px-0 pt-0">Files</div>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label htmlFor="photo">Profile Picture</Form.Label>
            <FileInput id="photo" value={form.photo_url} onChange={(v) => set('photo_url', v)} />
          </Col>
          <Col md={6}>
            <Form.Label htmlFor="resume">Resume (PDF)</Form.Label>
            <FileInput id="resume" kind="file" accept="application/pdf" value={form.resume_url} onChange={(v) => set('resume_url', v)} />
          </Col>
        </Row>
        <div className="form-text mt-2">Uploading replaces the file in the form. Select Save Profile to publish it.</div>
      </div>

      <div className="card-x" style={{ padding: 20 }}>
        <Row className="g-3">
          {TEXT_FIELDS.map((f, i) => (f.section ? (
            <Col xs={12} key={`s${i}`}><div className={`sec-label px-0 ${i === 0 ? 'pt-0' : 'pt-3'}`}>{f.section}</div></Col>
          ) : (
            <Col md={f.col || 12} key={f.name}>
              <Form.Label htmlFor={f.name}>{f.label}</Form.Label>
              <Form.Control
                id={f.name}
                as={f.type === 'textarea' ? 'textarea' : 'input'}
                type={f.type === 'textarea' ? undefined : f.type || 'text'}
                rows={f.rows}
                placeholder={f.placeholder}
                value={form[f.name] ?? ''}
                onChange={(e) => set(f.name, e.target.value)}
              />
              {f.help && <Form.Text>{f.help}</Form.Text>}
            </Col>
          )))}
        </Row>
      </div>
      <div className="mt-4"><Button type="submit" variant="ink" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button></div>
    </Form>
  );
}
