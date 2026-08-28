import axios from 'axios';

const getApiBaseUrl = (): string => {
  if (process.env.REACT_APP_API_URL) {
    let url = process.env.REACT_APP_API_URL.trim();
    if (!url.endsWith('/api/v1')) {
      url = url.replace(/\/+$/, '') + '/api/v1';
    }
    return url;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://ekyc-ai-backend.onrender.com/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

const getStaticBaseUrl = (): string => {
  if (process.env.REACT_APP_STATIC_URL) {
    return process.env.REACT_APP_STATIC_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://ekyc-ai-backend.onrender.com';
  }
  return 'http://localhost:8000';
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
