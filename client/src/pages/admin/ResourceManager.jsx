import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { api } from '../../api.js';
import FileInput from '../../components/FileInput.jsx';

function emptyItem(resource, items) {
  const item = {};
  resource.fields.forEach((f) => { item[f.name] = f.type === 'checkbox' ? false : ''; });
  item.sort_order = items.length;
  return item;
}

function Field({ field, value, onChange }) {
  const id = `f-${field.name}`;
  if (field.type === 'checkbox') {
    return <Form.Check type="switch" id={id} label={field.label} checked={!!value} onChange={(e) => onChange(e.target.checked)} className="mt-4" />;
  }
  return (
    <>
      <Form.Label htmlFor={id}>{field.label}{field.required && <span className="text-ink-3"> *</span>}</Form.Label>
      {field.type === 'image' ? (
        <FileInput id={id} value={value} onChange={onChange} />
      ) : field.type === 'file' ? (
        <FileInput id={id} kind="file" accept="application/pdf,image/*" value={value} onChange={onChange} />
      ) : (
        <Form.Control
          id={id}
          as={field.type === 'textarea' ? 'textarea' : 'input'}
          type={field.type === 'textarea' ? undefined : field.type || 'text'}
          rows={field.rows || 4}
          required={field.required}
          placeholder={field.placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.help && <Form.Text>{field.help}</Form.Text>}
    </>
  );
}

export default function ResourceManager({ resource }) {
  const { notify } = useOutletContext();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // item being edited, or null
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    api(`/${resource.key}`).then(setItems).catch((e) => setError(e.message));
  }, [resource.key]);
  useEffect(load, [load]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const isNew = !editing.id;
      await api(isNew ? `/${resource.key}` : `/${resource.key}/${editing.id}`, { method: isNew ? 'POST' : 'PUT', body: editing, auth: true });
      notify(`${resource.singular} ${isNew ? 'added' : 'saved'}`);
      setEditing(null);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api(`/${resource.key}/${confirmDelete.id}`, { method: 'DELETE', auth: true });
      notify(`${resource.singular} deleted`);
      setConfirmDelete(null);
      load();
    } catch (err) {
      setError(err.message);
      setConfirmDelete(null);
    }
  };

  // Swap sort order with a neighbour
  const move = async (index, dir) => {
    const a = items[index];
    const b = items[index + dir];
    if (!a || !b) return;
    const next = [...items];
    next[index] = b; next[index + dir] = a;
    setItems(next);
    try {
      await Promise.all(next.map((it, i) => (it.sort_order === i ? null : api(`/${resource.key}/${it.id}`, { method: 'PUT', body: { sort_order: i }, auth: true }))));
      load();
    } catch (err) { setError(err.message); load(); }
  };

  const renderRow = (item, index) => (
    <div className="list-row" key={item.id}>
      <span className="idx">{String(index + 1).padStart(2, '0')}</span>
      {resource.thumb && (item[resource.thumb] ? <img src={item[resource.thumb]} alt="" className="list-thumb" /> : <span className="list-thumb" />)}
      <div className="main">
        <div className="t">{resource.title(item)} {resource.badge?.(item) && <span className="chip ms-2">{resource.badge(item)}</span>}</div>
        {resource.subtitle(item) && <div className="s">{resource.subtitle(item)}</div>}
      </div>
      <div className="actions">
        <Button variant="ghost" size="sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">↑</Button>
        <Button variant="ghost" size="sm" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down">↓</Button>
        <Button variant="line" size="sm" onClick={() => { setFormError(''); setEditing({ ...item }); }}>Edit</Button>
        <Button variant="danger-line" size="sm" onClick={() => setConfirmDelete(item)}>Delete</Button>
      </div>
    </div>
  );

  let body;
  if (!items) body = <div className="empty">Loading...</div>;
  else if (!items.length) body = <div className="empty">No {resource.label.toLowerCase()} yet. Add one to show it on your portfolio.</div>;
  else if (resource.groupBy) {
    const groups = [];
    items.forEach((it, i) => {
      const g = it[resource.groupBy] || 'General';
      let grp = groups.find((x) => x.name === g);
      if (!grp) { grp = { name: g, rows: [] }; groups.push(grp); }
      grp.rows.push(renderRow(it, i));
    });
    body = groups.map((g) => [<div className="group-label" key={`g-${g.name}`}>{g.name}</div>, ...g.rows]);
  } else body = items.map(renderRow);

  return (
    <>
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="admin-title">{resource.label}</h1>
          <p className="admin-sub">{items ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : ' '}</p>
        </div>
        <Button variant="ink" onClick={() => { setFormError(''); setEditing(emptyItem(resource, items || [])); }}>Add {resource.singular}</Button>
      </div>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      <div className="stack">{body}</div>

      <Modal show={!!editing} onHide={() => setEditing(null)} size="lg" backdrop="static">
        {editing && (
          <Form onSubmit={save}>
            <Modal.Header closeButton>
              <Modal.Title>{editing.id ? `Edit ${resource.singular}` : `Add ${resource.singular}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {formError && <Alert variant="danger">{formError}</Alert>}
              <Row className="g-3">
                {resource.fields.map((f) => (
                  <Col md={f.col || 12} key={f.name}>
                    <Field field={f} value={editing[f.name]} onChange={(v) => setEditing((x) => ({ ...x, [f.name]: v }))} />
                  </Col>
                ))}
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" variant="ink" disabled={saving}>{saving ? 'Saving...' : editing.id ? `Save ${resource.singular}` : `Add ${resource.singular}`}</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>

      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)} centered size="sm">
        <Modal.Header closeButton><Modal.Title>Delete {resource.singular}</Modal.Title></Modal.Header>
        <Modal.Body style={{ fontSize: 14 }}>
          "{confirmDelete && resource.title(confirmDelete)}" will be removed from your portfolio. This can't be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger-line" onClick={remove}>Delete {resource.singular}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
