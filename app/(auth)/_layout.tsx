import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from '../../store';
import { initializeAuth } from '../../store/slices/authSlice'; // Import the initializeAuth function

const _layout = () => {
  useEffect(() => {
    // Load tokens on app start
    store.dispatch(initializeAuth());
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
        </Stack>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default _layout;

const styles = StyleSheet.create({});
