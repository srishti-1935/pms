import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'pms_token';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 60000,
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (!err.response) {
      err.userMessage = 'No internet connection or server unreachable. Check your network and try again.';
    } else if (err.response.status === 401 && err.config?.headers?.Authorization) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      err.userMessage = 'Your session expired. Please log in again.';
      if (onUnauthorized) onUnauthorized(err.userMessage);
    } else {
      const d = err.response.data;
      err.userMessage = d?.details?.length
        ? d.details.map((x) => x.message).join('\n')
        : d?.error || 'Something went wrong';
    }
    return Promise.reject(err);
  }
);

export default api;