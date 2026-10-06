import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    saveSession(res.data);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { fullName: name, email, password });
    saveSession(res.data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore, token is cleared either way */
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
