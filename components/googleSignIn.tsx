import React, { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as webBrowser from 'expo-web-browser';
import axios from 'axios';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

// Google OAuth Client IDs (replace with your actual IDs)
const webClientId =
  '454942061374-uitkf4ide02k22c1ovjlkemtu4lipaqa.apps.googleusercontent.com';
const androidClientId =
  '454942061374-23tp5hkdvkvorecar0dopv7sb31rlf4p.apps.googleusercontent.com';
const iosClientId =
  '454942061374-2ft32njacclm512a0cp549f5tprjlm60.apps.googleusercontent.com';

// Complete the authentication session
webBrowser.maybeCompleteAuthSession();

const GoogleSignIn = () => {
  // Set up the Google authentication request
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId,
    androidClientId,
    scopes: ['openid', 'profile', 'email'],
  });

  // Function to handle response from Google OAuth and send the token to the backend
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const token = authentication?.accessToken;
      console.log('Google OAuth Access Token:', token);
      sendTokenToBackend(token);
    }
  }, [response]);

  const sendTokenToBackend = async (token: string | undefined) => {
    try {
      const backendUrl =
        'https://commonly-beloved-calf.ngrok-free.app/api/v1/auth/google/callback'; // Replace with your backend URL
      const res = await axios.post(backendUrl, { token });
      console.log('Backend response:', res.data);
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  };

  // Render Google sign-in button
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed ? styles.buttonPressed : null, // Change style when pressed
        ]}
        onPress={() => {
          promptAsync();
        }}
      >
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.7, // Slightly change opacity when pressed
  },
});

export default GoogleSignIn;
