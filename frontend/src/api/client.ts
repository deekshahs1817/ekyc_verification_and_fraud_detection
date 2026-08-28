import axios from 'axios';

const getApiBaseUrl = (): string => {
  // 1. Check Create React App / Webpack environment variable
  const reactAppUrl = process.env.REACT_APP_API_URL;
  if (reactAppUrl && reactAppUrl.trim()) {
    let url = reactAppUrl.trim().replace(/\/+$/, '');
    return url.endsWith('/api/v1') ? url : `${url}/api/v1`;
  }

  // 2. Check Vite environment variable
  const viteUrl = (process.env as any)?.VITE_API_URL;
  if (viteUrl && viteUrl.trim()) {
    let url = viteUrl.trim().replace(/\/+$/, '');
    return url.endsWith('/api/v1') ? url : `${url}/api/v1`;
  }

  // 3. Localhost fallback
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000/api/v1';
    }
  }

  return '/api/v1';
};

const getStaticBaseUrl = (): string => {
  const reactAppUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_STATIC_URL;
  if (reactAppUrl && reactAppUrl.trim()) {
    return reactAppUrl.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
  }

  const viteUrl = (process.env as any)?.VITE_API_URL || (process.env as any)?.VITE_STATIC_URL;
  if (viteUrl && viteUrl.trim()) {
    return viteUrl.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  return '';
};

export const API_BASE_URL = getApiBaseUrl();
export const STATIC_BASE_URL = getStaticBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to outgoing requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ekyc_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ekyc_token');
      localStorage.removeItem('ekyc_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
