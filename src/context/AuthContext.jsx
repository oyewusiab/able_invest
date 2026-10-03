import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Read active session or null (starts on login screen if no saved session)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('able_session_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null; // Production standard: Not authenticated by default
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [syncStatus, setSyncStatus] = useState('connecting'); // 'cloud' | 'local' | 'connecting'
  const [syncLatency, setSyncLatency] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.ping();
      setSyncStatus(res.source);
      if (res.latency) setSyncLatency(res.latency);
    } catch {
      setSyncStatus('local');
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      if (res.data && res.data.status === 'success' && res.data.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem('able_session_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      const msg = res.data?.message || 'Invalid credentials or user not found.';
      setAuthError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err.message || 'Authentication service error.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.register(userData);
      if (res.data && res.data.status === 'success' && res.data.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem('able_session_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      const msg = res.data?.message || 'Registration could not be completed.';
      setAuthError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err.message || 'Registration service error.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('able_session_user');
  };

  const updateKyc = async (data) => {
    if (!currentUser) return { success: false };
    const res = await api.updateKyc({ ...data, user_id: currentUser.id });
    if (res.data && res.data.status === 'success') {
      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      localStorage.setItem('able_session_user', JSON.stringify(updated));
      return { success: true };
    }
    return { success: false, message: 'Update failed' };
  };

  const isCompanyStaff = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'LOAN_OFFICER';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isCompanyStaff,
      syncStatus,
      syncLatency,
      authError,
      login,
      register,
      logout,
      updateKyc,
      checkHealth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
