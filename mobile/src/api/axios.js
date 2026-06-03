import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://grimforge-production.up.railway.app/api',
  timeout: 45000, // 45s timeout because novel/chapter generation can take time
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('gf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to fetch auth token from storage', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
