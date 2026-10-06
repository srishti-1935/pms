import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import Spinner from './components/Spinner.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner full />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/projects" element={<Protected><Projects /></Protected>} />
      <Route path="/projects/:id" element={<Protected><ProjectDetail /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
