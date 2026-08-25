import React, { createContext, useState, useEffect, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { registerPushToken } from '../services/pushService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      registerPushToken();
    }
  }, [user?.id]);

  const persistUser = async (owner) => {
    if (owner) {
      await AsyncStorage.setItem('user', JSON.stringify(owner));
      setUser(owner);
    }
  };

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        const res = await authService.getMe();
        const owner = res.data?.data || res.data;
        if (owner?.id) {
          await persistUser(owner);
          return;
        }
      } catch (error) {
        console.error('Refresh user error:', error);
      }

      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const res = await authService.getMe();
    const owner = res.data?.data || res.data;
    if (owner?.id) {
      await persistUser(owner);
    }
    return owner;
  };

  const login = async (phone, otp) => {
    const response = await authService.verifyOtp(phone, otp);
    const { token, owner } = response.data;
    await AsyncStorage.setItem('token', token);
    await persistUser(owner);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, persistUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
