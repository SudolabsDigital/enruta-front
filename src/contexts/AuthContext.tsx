import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService, type User } from '../features/auth/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeBusinessId: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  getUser: () => Promise<void>;
  switchBusiness: (businessId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    setActiveBusinessId(null);
    ['enruta_token', 'enruta_user', 'enruta_active_business'].forEach(key => localStorage.removeItem(key));
  }, []);

  const applyProfile = useCallback((freshUser: User) => {
    const storedId = localStorage.getItem('enruta_active_business');
    const nextId = freshUser.businesses?.find(b => b.id === storedId)?.id ?? freshUser.businesses?.[0]?.id ?? null;
    setUser(freshUser);
    setActiveBusinessId(nextId);
    localStorage.setItem('enruta_user', JSON.stringify(freshUser));
    if (nextId) localStorage.setItem('enruta_active_business', nextId);
    else localStorage.removeItem('enruta_active_business');
  }, []);

  const getUser = useCallback((): Promise<void> => {
    const requestToken = localStorage.getItem('enruta_token');
    if (!requestToken) return Promise.resolve();
    return authService.getUser().then(freshUser => {
      // Ignore a response from a session that was closed or replaced while in flight.
      if (localStorage.getItem('enruta_token') !== requestToken) return;
      setToken(requestToken);
      applyProfile(freshUser);
    }).catch((error: unknown) => {
      const status = (error as { response?: { status: number } }).response?.status;
      if ((status === 401 || status === 403) && localStorage.getItem('enruta_token') === requestToken) clearSession();
      throw error;
    });
  }, [applyProfile, clearSession]);

  useEffect(() => {
    const refresh = () => {
      if (!localStorage.getItem('enruta_token')) clearSession();
      else void getUser().catch(() => undefined);
    };
    void getUser().catch(() => undefined).finally(() => setIsLoading(false));
    window.addEventListener('focus', refresh);
    window.addEventListener('enruta:access-denied', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('enruta:access-denied', refresh);
    };
  }, [getUser, clearSession]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('enruta_token', newToken);
    setToken(newToken);
    applyProfile(newUser);
  };

  const logout = async () => {
    const previousToken = localStorage.getItem('enruta_token');
    try { await authService.logout(); }
    catch { /* Local logout also works if the token has already been rejected. */ }
    finally { if (localStorage.getItem('enruta_token') === previousToken) clearSession(); }
  };

  const switchBusiness = (businessId: string) => {
    if (user?.businesses?.some(b => b.id === businessId)) {
      setActiveBusinessId(businessId);
      localStorage.setItem('enruta_active_business', businessId);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, activeBusinessId, login, logout, getUser, switchBusiness, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Existing consumers import the hook from this context module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return context;
};
