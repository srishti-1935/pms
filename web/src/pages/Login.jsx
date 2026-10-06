import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { errorMessage } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [notice] = useState(() => {
    const m = sessionStorage.getItem('authMessage');
    sessionStorage.removeItem('authMessage');
    return m || '';
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card form" onSubmit={submit} noValidate>
        <h1>Log in</h1>
        {notice && <div className="alert alert-info">{notice}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <label>
          Email
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={set('password')} autoComplete="current-password" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        <p className="muted">No account? <Link to="/register">Create one</Link></p>
      </form>
    </div>
  );
}
