import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiRequestError, api } from '../services/api';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  lastLoginAt?: string | null;
  role: { name: string; label: string; permissions: string[] };
  permissions?: string[];
}

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function canDo(permissions: string[] | undefined, roleName: string | undefined, permission: string) {
  if (roleName === 'super-admin') return true;
  if (!permissions) return false;
  if (permissions.includes('*') || permissions.includes(permission)) return true;
  const [group] = permission.split('.');
  return permissions.includes(`${group}.*`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    try {
      const session = await api.get<SessionUser>('/auth/me');
      setUser(session);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.post<{ user: SessionUser }>('/auth/login', { email, password });
      setUser(response.user);
      await queryClient.invalidateQueries();
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
      refresh,
      can: (permission: string) => canDo(user?.permissions ?? user?.role.permissions, user?.role.name, permission),
    }),
    [user, isLoading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider.');
  return context;
}
