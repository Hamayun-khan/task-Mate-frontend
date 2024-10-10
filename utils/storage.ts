import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Storage keys
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'userData';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor to add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  // Register user
  register: async (formData: FormData) => {
    try {
      const response = await api.post('/user/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { accessToken, refreshToken, user } = response.data.data;

      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/user/login', { email, password });
      const { accessToken, refreshToken, user } = response.data.data;

      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/user/logout');
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Logout failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await api.post('/user/refresh-token', { refreshToken });
      const { accessToken } = response.data.data;

      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
      return accessToken;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to refresh token. Please log in again.';
      throw new Error(errorMessage);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error: any) {
      const errorMessage = 'Failed to retrieve user data. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error: any) {
      const errorMessage =
        'Failed to check authentication status. Please log in again.';
      throw new Error(errorMessage);
    }
  },
};

export default authService;
