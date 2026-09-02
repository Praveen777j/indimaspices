import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AdminAuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  adminUser: { username: string; name: string; role: string } | null;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('indima_admin_token');
  });
  const [adminUser, setAdminUser] = useState<{ username: string; name: string; role: string } | null>(() => {
    const saved = localStorage.getItem('indima_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setAdminUser(null);
      localStorage.removeItem('indima_admin_token');
      localStorage.removeItem('indima_admin_user');
    };

    window.addEventListener('indima:admin_auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('indima:admin_auth_expired', handleAuthExpired);
    };
  }, []);

  // Validate session on initial load
  useEffect(() => {
    const currentToken = localStorage.getItem('indima_admin_token');
    if (currentToken) {
      fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      })
        .then(res => {
          if (!res.ok) {
            setToken(null);
            setAdminUser(null);
            localStorage.removeItem('indima_admin_token');
            localStorage.removeItem('indima_admin_user');
          }
        })
        .catch(() => {
          // Keep state on network glitch
        });
    }
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await api.adminLogin(credentials);
      if (res.success && res.token) {
        setToken(res.token);
        setAdminUser(res.admin);
        localStorage.setItem('indima_admin_token', res.token);
        localStorage.setItem('indima_admin_user', JSON.stringify(res.admin));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (e) {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    if (token) {
      api.adminLogout(token).catch(console.error);
    }
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('indima_admin_token');
    localStorage.removeItem('indima_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
        adminUser,
        loading
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};
