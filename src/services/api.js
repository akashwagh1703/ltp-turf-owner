import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://35.222.74.225/api/v1/owner',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url, config.data || config.params || '');
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method.toUpperCase(), response.config.url, response.status, response.data);
    return response;
  },
  async (error) => {
    console.log('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
