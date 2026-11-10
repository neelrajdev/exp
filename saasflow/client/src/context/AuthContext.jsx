import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('sf_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTenant, setCurrentTenant] = useState(null);

  useEffect(() => {
    if (session) {
      localStorage.setItem('sf_session', JSON.stringify(session));
      if (session.tenantId) {
        api.fetchTenant(session.tenantId).then(data => {
          if (data && data.tenant) setCurrentTenant(data.tenant);
        }).catch(() => {});
      } else {
        setCurrentTenant(null);
      }
    } else {
      localStorage.removeItem('sf_session');
      setCurrentTenant(null);
    }
  }, [session]);

  const login = (role, tenantId = null) => {
    const newSession = { role, tenantId };
    setSession(newSession);
  };

  const logout = () => {
    setSession(null);
    setCurrentTenant(null);
    localStorage.removeItem('sf_session');
  };

  const resetDemo = async () => {
    await api.resetDemoData();
    logout();
  };

  return (
    <AuthContext.Provider value={{ session, currentTenant, login, logout, resetDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

