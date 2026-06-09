import axios from 'axios';

let memoryToken = null;

export const setMemoryToken = (token) => {
  memoryToken = token;
};

export const clearMemoryToken = () => {
  memoryToken = null;
};

export const getMemoryToken = () => {
  return memoryToken;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.__ENV?.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available in memory
api.interceptors.request.use((config) => {
  if (memoryToken) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return config;
});

// Auth pages where a 401 should NOT trigger a redirect (avoids infinite loop)
const AUTH_PATHS = ['/login', '/forgot-password', '/reset-password', '/change-password'];
const isAuthPage = () => AUTH_PATHS.some((p) => window.location.pathname.startsWith(p));

// Response interceptor: unwrap data, handle global 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      clearMemoryToken();
      // Only hard-redirect when we're NOT already on an auth page —
      // prevents infinite reload loops when /auth/me fails on the login page.
      if (!isAuthPage()) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
