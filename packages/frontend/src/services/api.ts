import axios from 'axios';

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(transformKeys);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        snakeToCamel(key),
        transformKeys(value),
      ])
    );
  }
  return obj;
}

function transformKeysToSnake(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(transformKeysToSnake);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        camelToSnake(key),
        transformKeysToSnake(value),
      ])
    );
  }
  return obj;
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Transform camelCase request body to snake_case for backend
  if (config.data && typeof config.data === 'object') {
    config.data = transformKeysToSnake(config.data);
  }
  return config;
});

// Skip /auth/login and /auth/refresh — the interceptor would otherwise reload
// the page before LoginPage can render the inline error.
const AUTH_ENDPOINT_RE = /\/auth\/(login|refresh)(\?|$)/;

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = transformKeys(response.data);
    }
    return response;
  },
  (error) => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !AUTH_ENDPOINT_RE.test(url)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
