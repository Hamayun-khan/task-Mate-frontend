import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// Define User interface

interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}
interface User {
  id: string;
  name: string;
  email: string;
  // Add other properties as needed
}

// API base URL
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3000/api/v1' ||
  'https://commonly-beloved-calf.ngrok-free.app/api/v1';

// Storage keys
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'userData';

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Function to set up the interceptor
const setupInterceptors = async () => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY); // Get token from SecureStore

  api.interceptors.request.use(
    (config) => {
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Call the setup function to initialize interceptors
setupInterceptors();

export const authService = {
  // Register user
  register: async (formData: FormData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        '/user/register',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const { accessToken, refreshToken, user } = response.data.data;

      // Store sensitive tokens in SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

      // Store less sensitive user data in AsyncStorage
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
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/user/login', {
        email,
        password,
      });
      const { accessToken, refreshToken, user } = response.data.data;

      // Store sensitive tokens in SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

      // Store less sensitive user data in AsyncStorage
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

      // Remove sensitive data from SecureStore
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

      // Remove less sensitive user data from AsyncStorage
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Logout failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Refresh token
  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY); // Get refresh token from SecureStore
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await api.post<AuthResponse>('/user/refresh-token', {
        refreshToken,
      });
      const { accessToken } = response.data.data;

      // Update access token in SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      return accessToken;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to refresh token. Please log in again.';
      throw new Error(errorMessage);
    }
  },
  // Get current user
  getCurrent: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error: any) {
      const errorMessage = 'Failed to retrieve user data. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY); // Check token in SecureStore
      return !!token;
    } catch (error: any) {
      const errorMessage =
        'Failed to check authentication status. Please log in again.';
      throw new Error(errorMessage);
    }
  },
};
export default authService;
