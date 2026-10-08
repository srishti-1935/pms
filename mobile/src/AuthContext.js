import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { TOKEN_KEY, setUnauthorizedHandler } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setUnauthorizedHandler((msg) => {
      setUser(null);
      setNotice(msg);
    });
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        }
      } catch (e) {
        // 401 is handled by the interceptor
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSession = async ({ user, token }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setNotice('');
    setUser(user);
  };

  const login = async (email, password) =>
    saveSession((await api.post('/auth/login', { email, password })).data);

  const register = async (fullName, email, password) =>
    saveSession((await api.post('/auth/register', { fullName, email, password })).data);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, notice, setNotice, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}