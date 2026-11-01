import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { api, setToken } from '../../api.js';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: { username, password } });
      setToken(token);
      navigate('/admin/profile', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <Form className="login-card" onSubmit={submit}>
        <div className="wordmark mb-4">portfolio/admin</div>
        <h1 style={{ fontSize: 22, letterSpacing: '-0.03em', marginBottom: 4 }}>Sign In</h1>
        <p className="text-muted-fg mb-4" style={{ fontSize: 14 }}>Manage the content on your portfolio.</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label htmlFor="u">Username</Form.Label>
          <Form.Control id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required autoFocus />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label htmlFor="p">Password</Form.Label>
          <Form.Control id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </Form.Group>
        <Button type="submit" variant="ink" className="w-100" disabled={busy}>{busy ? 'Signing In...' : 'Sign In'}</Button>
        <div className="text-center mt-3"><Link to="/" className="mono text-ink-3" style={{ fontSize: 12, textDecoration: 'none' }}>← Back to Portfolio</Link></div>
      </Form>
    </div>
  );
}
