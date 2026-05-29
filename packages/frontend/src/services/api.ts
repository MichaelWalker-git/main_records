import axios from 'axios';

function snakeToCamel(str: string): string {
  // Match digits too so `agency_3` -> `agency3` round-trips with camelToSnake.
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  // Insert `_` both at lowercase->Uppercase boundaries (camelCase) AND at
  // letter->digit boundaries so `agency3` becomes `agency_3` to match the
  // backend column / zod schema. Without the second pass, the original regex
  // skipped digits and the API rejected the field as "Unrecognized key".
  return str
    .replace(/([a-zA-Z])([0-9])/g, '$1_$2')
    .replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

export function transformKeys(obj: unknown): unknown {
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

export function transformKeysToSnake(obj: unknown): unknown {
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
