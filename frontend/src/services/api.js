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
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  if (memoryToken) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return config;
});

// Response interceptor: handle success and errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      clearMemoryToken();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
