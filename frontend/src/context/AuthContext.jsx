// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Створюємо контекст
const AuthContext = createContext(null);

// 2. Створюємо компонент-провайдер
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Ефект для синхронізації стану з localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (authData) => {
    // Зберігаємо дані в стані та localStorage
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);
    
    // Перенаправляємо на головну сторінку
    navigate('/');
  };

  const logout = () => {
    // Очищуємо стан та localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    // Перенаправляємо на сторінку входу
    navigate('/login');
  };

  // Значення, яке буде доступне всім дочірнім компонентам
  const value = {
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Створюємо кастомний хук для зручного доступу до контексту
export const useAuth = () => {
  return useContext(AuthContext);
};