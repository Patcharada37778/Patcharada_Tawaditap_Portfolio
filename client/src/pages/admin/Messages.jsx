import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button, Alert } from 'react-bootstrap';
import { api } from '../../api.js';

const fmt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function Messages() {
  const { notify } = useOutletContext();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/messages', { auth: true }).then(setItems).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const markRead = async (m, is_read) => {
    try { await api(`/messages/${m.id}`, { method: 'PATCH', body: { is_read }, auth: true }); notify(is_read ? 'Marked as read' : 'Marked as unread'); load(); } catch (e) { setError(e.message); }
  };
  const remove = async (m) => {
    if (!window.confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
    try { await api(`/messages/${m.id}`, { method: 'DELETE', auth: true }); notify('Message deleted'); load(); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <h1 className="admin-title">Messages</h1>
      <p className="admin-sub">Sent from the contact form on your portfolio.</p>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="stack">
        {!items && <div className="empty">Loading...</div>}
        {items && !items.length && <div className="empty">No messages yet. They'll show here when someone uses your contact form.</div>}
        {items?.map((m) => (
          <div key={m.id} className={`msg-row ${m.is_read ? '' : 'unread'}`}>
            <div className="d-flex justify-content-between gap-3 flex-wrap">
              <div><span className="who">{m.name}</span> <a href={`mailto:${m.email}`} className="mono text-muted-fg ms-1" style={{ fontSize: 12.5 }}>{m.email}</a></div>
              <span className="when">{fmt(m.created_at)}</span>
            </div>
            <div className="body">{m.message}</div>
            <div className="d-flex gap-2">
              <Button variant="line" size="sm" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message')}`}>Reply by Email</Button>
              <Button variant="ghost" size="sm" onClick={() => markRead(m, !m.is_read)}>{m.is_read ? 'Mark Unread' : 'Mark Read'}</Button>
              <Button variant="danger-line" size="sm" className="ms-auto" onClick={() => remove(m)}>Delete Message</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
