import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">Project Manager</span>
          <nav className="nav">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/projects">Projects</NavLink>
          </nav>
          <div className="user">
            <span className="user-name">{user?.fullName || user?.email}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
