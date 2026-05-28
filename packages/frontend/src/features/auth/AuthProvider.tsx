import { useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { AuthContext, AuthContextValue } from '../../hooks/useAuth';
import { User, UserRole } from '../../types';
import * as authService from '../../services/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService
        .getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, mfaCode?: string) => {
    try {
      const response = await authService.login({ email, password, mfaCode });
      setUser(response.user);
    } catch (err: unknown) {
      // Surface the backend's error message (e.g. "Invalid credentials") instead
      // of axios's generic "Request failed with status code 401". Preserve the
      // original error via cause so callers can still inspect the response.
      let msg = 'Login failed';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { error?: string; message?: string } | undefined;
        msg = data?.error ?? data?.message ?? err.message ?? msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      // Preserve the original error on `cause` for downstream inspection.
      const wrapped = new Error(msg);
      (wrapped as Error & { cause?: unknown }).cause = err;
      throw wrapped;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const roles: UserRole[] = user?.roles ?? [];

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    roles,
    isAdmin: roles.includes('admin'),
    isStaff: roles.includes('staff'),
    isOfficer: roles.includes('records_officer'),
    isAgencyUser: roles.includes('agency_user'),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
