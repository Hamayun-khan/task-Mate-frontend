import axios from 'axios';
import { BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: BASE_URL, // Updated to use your BASE_URL directly
  withCredentials: true,
});

export interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
  message: string;
  status: number;
  success: boolean;
}

export const authApi = {
  // Login using email and password (example API call)
  async login(credentials: { email: string; password: string }) {
    const response = await api.post(
      `${BASE_URL}/api/v1/user/login`,
      credentials
    );
    return response.data;
  },

  // Refresh token (if required for your backend)
  async refreshToken(refreshToken: string) {
    const response = await api.post(`${BASE_URL}/api/v1/user/refresh-token`, {
      refreshToken,
    });
    return response.data;
  },

  // Other user-related API calls can be added here
};
