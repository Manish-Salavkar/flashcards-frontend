// flashcards/src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';
import { loginRequest, registerRequest } from '../api/auth.api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const user = token ? { type: 'user' } : null;

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
  };

  const register = async (email, password) => {
      await registerRequest(email, password);
      await login(email, password);
    };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const loginAsGuest = () => {
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};