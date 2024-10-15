import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux'; // Make sure this wraps everything
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, useAppDispatch } from '../../store'; // Import useAppDispatch
import { initializeAuth } from '../../store/slices/authSlice';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

// Token cache implementation using expo-secure-store
const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

const RootLayout = () => {
  const dispatch = useAppDispatch(); // Get dispatch using useAppDispatch

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
          </Stack>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
};

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <RootLayout />
    </Provider>
  );
};

export default AppWrapper;

const styles = StyleSheet.create({});
