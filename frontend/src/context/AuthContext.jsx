// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Helper function to safely get the initial user from localStorage
const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      return JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Failed to parse initial user from localStorage", e);
    // If data is corrupt, clear it
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  // Initialize state directly from localStorage using a function
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const navigate = useNavigate();
  
  // The useEffect for initial loading is no longer needed

  const login = (authData) => {
    if (authData && authData.token && authData.user) {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      setToken(authData.token);
      setUser(authData.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};