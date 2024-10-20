import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SecureStoreService } from '../../utils/secureStore';
import { BASE_URL } from '../../constants/config';
import { AppDispatch } from '../index';

// Define User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  avatar?: string;
  role?: string;
  isClerkUser?: boolean; // Indicates if the user is from Clerk
}

interface AuthResponse {
  data: {
    user: User;
  };
  message: string;
  status: number;
  success: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface ResetPasswordCredentials {
  email: string; // For sending reset link
  newPassword: string; // For resetting password
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isClerkUser: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isClerkUser: false,
};

const USER_KEY = 'user';

// Load user data from storage (both Clerk and backend users)
const loadUserData = async (dispatch: AppDispatch) => {
  try {
    const storedUser = await SecureStoreService.getItem(USER_KEY);
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      dispatch(setUser(parsedUser));
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    dispatch(logout()); // Dispatch logout in case of error
  }
};

// Login with credentials (for backend users)
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue, getState }) => {
  const state = getState() as { auth: AuthState };

  // Bypass backend login if the user is managed by Clerk
  if (state.auth.isClerkUser) {
    console.log('User managed by Clerk, skipping backend login.');
    return rejectWithValue('User managed by Clerk.');
  }

  try {
    const response = await axios.post<AuthResponse>(
      `${BASE_URL}/api/v1/user/login`,
      credentials,
      { withCredentials: true }
    );

    const { data } = response.data;
    const { user } = data;

    if (user) {
      await SecureStoreService.setItem(USER_KEY, JSON.stringify(user));
      return response.data;
    } else {
      return rejectWithValue('Invalid login response');
    }
  } catch (error: any) {
    console.log('Login Error:', error.response?.data?.message || error.message);
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

// Register new user (for backend users)
export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterCredentials,
  { rejectValue: string }
>('auth/register', async (credentials, { rejectWithValue, getState }) => {
  const state = getState() as { auth: AuthState };

  // Bypass backend registration if the user is managed by Clerk
  if (state.auth.isClerkUser) {
    console.log('User managed by Clerk, skipping backend registration.');
    return rejectWithValue('User managed by Clerk.');
  }

  try {
    const response = await axios.post<AuthResponse>(
      `${BASE_URL}/api/v1/user/register`,
      credentials,
      { withCredentials: true }
    );

    const { data } = response.data;
    const { user } = data;

    if (user) {
      await SecureStoreService.setItem(USER_KEY, JSON.stringify(user));
      return response.data;
    } else {
      return rejectWithValue('Invalid register response');
    }
  } catch (error: any) {
    console.error('Register Error:', error);
    return rejectWithValue(
      error.response?.data?.message || 'Registration failed'
    );
  }
});

export const sendResetLink = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>('auth/sendResetLink', async (email, { rejectWithValue }) => {
  console.log('Sending reset link for email:', email);
  try {
    const response = await axios.post<{ message: string }>(
      `${BASE_URL}/api/v1/user/forgot-password`,
      { email }
    );
    console.log('Reset link sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Send Reset Link Error:', error);
    console.error('Error response:', error.response?.data);
    return rejectWithValue(
      error.response?.data?.message || 'Failed to send reset link'
    );
  }
});

// Reset password
export const resetPassword = createAsyncThunk<
  { message: string },
  { token: string; newPassword: string; confirmPassword: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async ({ token, newPassword, confirmPassword }, { rejectWithValue }) => {
    console.log('Resetting password for token:', token);
    try {
      const response = await axios.post<{ message: string }>(
        `${BASE_URL}/api/v1/user/reset-password`,
        { token, newPassword, confirmPassword }
      );
      console.log('Password reset successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reset password'
      );
    }
  }
);
// Redux slice for handling auth state
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isClerkUser = action.payload.isClerkUser || false; // Set if user is from Clerk
    },
    logout: (state) => {
      state.user = null;
      state.isClerkUser = false;
      SecureStoreService.removeItem(USER_KEY).catch(console.error);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.data.user;
      state.isClerkUser = action.payload.data.user.isClerkUser || false;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.data.user;
      state.isClerkUser = action.payload.data.user.isClerkUser || false;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(sendResetLink.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendResetLink.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null; // Clear error on success
    });
    builder.addCase(sendResetLink.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null; // Clear error on success
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, logout, clearError } = authSlice.actions;

// Initialize the auth state by loading stored user data
export const initializeAuth = () => async (dispatch: AppDispatch) => {
  await loadUserData(dispatch);
};

export default authSlice.reducer;
