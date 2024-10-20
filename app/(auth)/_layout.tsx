import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { router, Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, useAppDispatch } from '../../store';
import { initializeAuth } from '../../store/slices/authSlice';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';

console.log('App starting...');

const tokenCache = {
  async getToken(key: string) {
    console.log(`Attempting to get token for key: ${key}`);
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`Token retrieved for key: ${key}`);
      } else {
        console.log(`No token found for key: ${key}`);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    console.log(`Attempting to save token for key: ${key}`);
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`Token saved for key: ${key}`);
    } catch (err) {
      console.error('Error saving token:', err);
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error('Missing Publishable Key');
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

const RootLayout = () => {
  console.log('RootLayout rendering...');
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('RootLayout useEffect running...');
    dispatch(initializeAuth());

    const handleDeepLink = (event: Linking.EventType) => {
      console.log('Deep link received:', event.url);
      const url = event.url;
      const { path, queryParams } = Linking.parse(url);
      console.log('Parsed URL:', { path, queryParams });

      if (path === 'reset-password') {
        const resetToken = queryParams?.token;
        if (resetToken) {
          console.log(
            'Navigating to reset password screen with token:',
            resetToken
          );
          router.push(`/reset-password/${resetToken}`);
        } else {
          console.log('Reset token not found in query params');
        }
      } else {
        console.log('Unhandled deep link path:', path);
      }
    };

    console.log('Setting up deep link listener...');
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      console.log('Cleaning up deep link listener...');
      subscription.remove();
    };
  }, [dispatch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen
              name="reset-password/[token]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="reset-password-web/[resetId]"
              options={{ headerShown: false }}
            />
          </Stack>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
};

const AppWrapper = () => {
  console.log('AppWrapper rendering...');
  return (
    <Provider store={store}>
      <RootLayout />
    </Provider>
  );
};

console.log('Exporting AppWrapper...');
export default AppWrapper;

const styles = StyleSheet.create({});

console.log('Styles created...');
