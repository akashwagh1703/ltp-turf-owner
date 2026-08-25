import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1/owner`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    if (__DEV__) {
      console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method.toUpperCase(), response.config.url, response.status);
    return response;
  },
  async (error) => {
    // Prevent app crash on network errors
    if (!error.response) {
      console.log('❌ Network Error: Cannot reach server');
      return Promise.reject({
        message: 'Cannot connect to server. Please check your internet connection.',
        isNetworkError: true
      });
    }
    
    // Only log in development
    if (__DEV__ && error.response?.status !== 400) {
      console.log('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status);
    }
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;
