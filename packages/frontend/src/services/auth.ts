import api from './api';
import { User } from '../types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  localStorage.setItem('access_token', response.data.accessToken);
  localStorage.setItem('refresh_token', response.data.refreshToken);
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export async function refreshToken(): Promise<string> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');
  const response = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken: refresh });
  localStorage.setItem('access_token', response.data.accessToken);
  return response.data.accessToken;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}

export function getCognitoLoginUrl(): string {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
  return `${domain}/login?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${redirectUri}`;
}
