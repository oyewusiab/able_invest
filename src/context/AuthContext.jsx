import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default to Super Admin so the company portal is immediately visible and demonstrable,
  // with 1-click switching to Customer PWA or Loan Officer mode.
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('able_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      id: "USR_ADM_001",
      full_name: "Executive Admin",
      email: "admin@ableinvest.com",
      phone: "+234 802 334 4555",
      role: "SUPER_ADMIN",
      kyc_status: "VERIFIED",
      bank_name: "First Bank",
      account_number: "0123456789",
      account_name: "ABLE INVEST LTD",
      address: "Headquarters, Victoria Island, Lagos"
    };
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [syncStatus, setSyncStatus] = useState('cloud'); // 'cloud' | 'local' | 'connecting'

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('able_current_user', JSON.stringify(currentUser));
    }
    loadUsers();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.ping();
      setSyncStatus(res.source);
    } catch {
      setSyncStatus('local');
    }
  };

  const loadUsers = async () => {
    const res = await api.getUsers();
    if (res.data && res.data.users) {
      setAvailableUsers(res.data.users);
    }
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.data && res.data.status === 'success') {
      setCurrentUser(res.data.user);
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.data && res.data.status === 'success') {
      setCurrentUser(res.data.user);
      await loadUsers();
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const switchRole = (role) => {
    if (role === 'SUPER_ADMIN') {
      setCurrentUser({
        id: "USR_ADM_001",
        full_name: "Executive Admin",
        email: "admin@ableinvest.com",
        phone: "+234 802 334 4555",
        role: "SUPER_ADMIN",
        kyc_status: "VERIFIED",
        bank_name: "First Bank",
        account_number: "0123456789",
        account_name: "ABLE INVEST LTD",
        address: "Headquarters, Victoria Island, Lagos"
      });
    } else if (role === 'LOAN_OFFICER') {
      setCurrentUser({
        id: "USR_OFF_001",
        full_name: "Samuel Credit Analyst",
        email: "officer@ableinvest.com",
        phone: "+234 803 445 5666",
        role: "LOAN_OFFICER",
        kyc_status: "VERIFIED",
        bank_name: "Access Bank",
        account_number: "0987654321",
        account_name: "Samuel Analyst",
        address: "Credit Bureau, Ikeja, Lagos"
      });
    } else {
      setCurrentUser({
        id: "USR_CST_001",
        full_name: "Babatunde Adebayo",
        email: "customer@ableinvest.com",
        phone: "+234 805 556 6777",
        role: "CUSTOMER",
        kyc_status: "VERIFIED",
        bank_name: "Guaranty Trust Bank",
        account_number: "0112233445",
        account_name: "Babatunde Adebayo",
        address: "Obantoko, Abeokuta / Lagos",
        next_of_kin: "Sarah Adebayo (Wife)"
      });
    }
  };

  const logout = () => {
    switchRole('CUSTOMER');
  };

  const updateKyc = async (data) => {
    const res = await api.updateKyc({ ...data, user_id: currentUser.id });
    if (res.data && res.data.status === 'success') {
      setCurrentUser(prev => ({ ...prev, ...data }));
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
      availableUsers,
      login,
      register,
      switchRole,
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
