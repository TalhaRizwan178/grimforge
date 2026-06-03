import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('gf_token');
        if (token) {
          const res = await api.get('/auth/me');
          setUser(res.data);
        }
      } catch (err) {
        console.log('Failed to restore auth state', err.message);
        await AsyncStorage.removeItem('gf_token');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (token, userData) => {
    try {
      await AsyncStorage.setItem('gf_token', token);
      setUser(userData);
    } catch (err) {
      console.error('Failed to save auth token during login', err);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('gf_token');
      setUser(null);
    } catch (err) {
      console.error('Failed to remove auth token during logout', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
