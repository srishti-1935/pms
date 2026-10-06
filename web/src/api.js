import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 60000, // free Render tier can take a while to wake up
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthCall) {
      const expired = err.response?.data?.code === 'TOKEN_EXPIRED';
      localStorage.removeItem('token');
      sessionStorage.setItem(
        'authMessage',
        expired ? 'Your session expired. Please log in again.' : 'Please log in to continue.'
      );
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function errorMessage(err) {
  if (!err.response) {
    return err.code === 'ECONNABORTED'
      ? 'The server took too long to respond. Try again.'
      : 'Cannot reach the server. Check your connection.';
  }
  const data = err.response.data || {};
  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map((e) => e.message || e).join(', ');
  }
  return data.message || data.error || `Something went wrong (${err.response.status}).`;
}

export default api;
