/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [username, setUsername] = useState(() => localStorage.getItem('username'));

  const login = async (credentials) => {
    const res = await api.post('/login', credentials);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.username);
    setToken(res.data.token);
    setUsername(res.data.username);
    return res.data;
  };

  const register = async (credentials) => {
    const res = await api.post('/register', credentials);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.username);
    setToken(res.data.token);
    setUsername(res.data.username);
    return res.data;
  };

  const forgotPassword = async (username) => {
    const res = await api.post('/forgot-password', { username });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, login, register, forgotPassword, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
