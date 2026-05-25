import { useContext, createContext } from 'react';
import { User, UserRole } from '../types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: UserRole[];
  isAdmin: boolean;
  isStaff: boolean;
  isOfficer: boolean;
  isAgencyUser: boolean;
  login: (email: string, password: string, mfaCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
