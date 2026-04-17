import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchMe, loginWithGoogle, logout as logoutSvc, hasToken } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasToken());

  useEffect(() => {
    if (!hasToken()) return;
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (credential) => {
    const u = await loginWithGoogle(credential);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => {
    logoutSvc();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
