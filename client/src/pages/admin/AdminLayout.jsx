import { useEffect, useState, useCallback } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { api, getToken, setToken } from '../../api.js';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { RESOURCES } from './config.js';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [counts, setCounts] = useState({});
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState('');
  const token = getToken();

  const refreshCounts = useCallback(async () => {
    try {
      const [data, msgs] = await Promise.all([api('/portfolio'), api('/messages', { auth: true })]);
      const c = {};
      RESOURCES.forEach((r) => { c[r.key] = data[r.key]?.length ?? 0; });
      setCounts(c);
      setUnread(msgs.filter((m) => !m.is_read).length);
    } catch { /* counts are cosmetic */ }
  }, []);

  useEffect(() => { if (token) refreshCounts(); }, [token, refreshCounts]);

  const notify = useCallback((text) => {
    setToast(text);
    window.clearTimeout(notify.t);
    notify.t = window.setTimeout(() => setToast(''), 2400);
    refreshCounts();
  }, [refreshCounts]);

  if (!token) return <Navigate to="/admin/login" replace />;

  const signOut = () => { setToken(null); navigate('/admin/login'); };
  const current = location.pathname.split('/')[2] || 'profile';
  const currentLabel = current === 'profile' ? 'Profile' : current === 'messages' ? 'Messages' : RESOURCES.find((r) => r.key === current)?.label;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin" className="wordmark">portfolio/admin</NavLink>
        <div className="sec-label">General</div>
        <NavLink to="/admin/profile" className="side-link">Profile & Contact</NavLink>
        <NavLink to="/admin/messages" className="side-link">Messages {unread > 0 && <span className="count">{unread} new</span>}</NavLink>
        <div className="sec-label">Content</div>
        {RESOURCES.map((r) => (
          <NavLink key={r.key} to={`/admin/${r.key}`} className="side-link">
            {r.label} <span className="count">{counts[r.key] ?? ''}</span>
          </NavLink>
        ))}
        <div className="mt-auto pt-3 d-flex flex-column gap-1">
          <a href="/" target="_blank" rel="noopener" className="side-link">View Portfolio <span className="count">↗</span></a>
          <button type="button" className="side-link border-0 bg-transparent text-start w-100" onClick={signOut}>Sign Out</button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <span className="crumbs">admin / {currentLabel?.toLowerCase()}</span>
          <div className="ms-auto d-flex align-items-center gap-2">
            <ThemeToggle />
            <Button variant="line" size="sm" href="/" target="_blank" rel="noopener" className="d-md-none">View Site</Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="d-md-none">Sign Out</Button>
          </div>
        </div>
        <div className="admin-content">
          <div className="admin-mobile-nav mb-3">
            <Form.Select aria-label="Section" value={current} onChange={(e) => navigate(`/admin/${e.target.value}`)}>
              <option value="profile">Profile & Contact</option>
              <option value="messages">Messages{unread ? ` (${unread} new)` : ''}</option>
              {RESOURCES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </Form.Select>
          </div>
          <Outlet context={{ notify }} />
        </div>
      </div>
      {toast && <div className="toast-x" role="status">{toast}</div>}
    </div>
  );
}
