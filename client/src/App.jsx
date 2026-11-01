import { Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './pages/Portfolio.jsx';
import Login from './pages/admin/Login.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import ProfileEditor from './pages/admin/ProfileEditor.jsx';
import ResourceManager from './pages/admin/ResourceManager.jsx';
import Messages from './pages/admin/Messages.jsx';
import { RESOURCES } from './pages/admin/config.js';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfileEditor />} />
        <Route path="messages" element={<Messages />} />
        {RESOURCES.map((r) => (
          <Route key={r.key} path={r.key} element={<ResourceManager key={r.key} resource={r} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
