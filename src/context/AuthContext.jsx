import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // roles: 'admin', 'auditor', 'citizen', null (unauthenticated)
  const [userRole, setUserRole] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  
  // domains: 'MGNREGA', 'Healthcare', 'Agriculture', 'Education'
  const [activeDomain, setActiveDomain] = useState('MGNREGA');

  const login = (role, address = null) => {
    setUserRole(role);
    if (address) setWalletAddress(address);
  };

  const logout = () => {
    setUserRole(null);
    setWalletAddress(null);
  };

  return (
    <AuthContext.Provider value={{ userRole, walletAddress, setWalletAddress, login, logout, activeDomain, setActiveDomain }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
