import { useState, useEffect, useCallback, ReactNode } from 'react';
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
    const response = await authService.login({ email, password, mfaCode });
    setUser(response.user);
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
