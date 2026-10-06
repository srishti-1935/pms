import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { errorMessage } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setError('');
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card form" onSubmit={submit} noValidate>
        <h1>Create account</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <label>
          Name
          <input value={form.name} onChange={set('name')} autoComplete="name" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
