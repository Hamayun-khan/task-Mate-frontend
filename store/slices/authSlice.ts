import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';

interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  avatar?: string;
  role?: string;
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

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

const loadUserData = async (dispatch: any) => {
  try {
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    dispatch(logout());
  }
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>(
      `${BASE_URL}/api/v1/user/login`,
      credentials,
      { withCredentials: true }
    );

    // Extract data from response
    const { data } = response.data;
    const { user } = data;

    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } else {
      return rejectWithValue('Invalid login response');
    }
  } catch (error: any) {
    // Log specific error messages for debugging only (optional)
    console.log('Login Error:', error.response?.data?.message || error.message);

    // Customize error messages for the user
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterCredentials,
  { rejectValue: string }
>('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>(
      `${BASE_URL}/api/v1/user/register`,
      credentials,
      { withCredentials: true }
    );

    const { data } = response.data;
    const { user } = data;

    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      AsyncStorage.removeItem('user').catch(console.error);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Registration failed';
      });
  },
});

export const { setUser, logout, clearError } = authSlice.actions;

export const initializeAuth = () => async (dispatch: any) => {
  await loadUserData(dispatch);
};

export default authSlice.reducer;
