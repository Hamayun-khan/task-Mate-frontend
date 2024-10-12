import React, { useEffect, useState } from 'react';
import { Button, Alert, Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import axios from 'axios';
import * as webBrwser from 'expo-web-browser';

// Define the type for the event
type LinkingEvent = {
  url: string;
};

// Google OAuth Client IDs (replace with your actual IDs)
const webClientId =
  '454942061374-uitkf4ide02k22c1ovjlkemtu4lipaqa.apps.googleusercontent.com';
const androidClientId =
  '454942061374-23tp5hkdvkvorecar0dopv7sb31rlf4p.apps.googleusercontent.com';
const iosClientId =
  '454942061374-2ft32njacclm512a0cp549f5tprjlm60.apps.googleusercontent.com';

webBrwser.maybeCompleteAuthSession();
// Your backend's base URL
const backendBaseUrl = 'https://commonly-beloved-calf.ngrok-free.app/api/v1';

const redirectUri = AuthSession.makeRedirectUri({
  native: 'taskmate://auth',
});

interface User {
  id: string;
  name: string;
  email: string;
}

interface TokenResponse {
  accessToken: string;
  user: User;
}

export default function GoogleSignIn() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const clientId = Platform.OS === 'android' ? androidClientId : iosClientId;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes: ['openid', 'email', 'profile'],
      responseType: 'code',
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  useEffect(() => {
    if (response?.type === 'success' && !response.params?.error) {
      const { code } = response.params;
      axios
        .post<TokenResponse>(`${backendBaseUrl}/auth/google/callback`, { code })
        .then((response) => {
          const { accessToken, user } = response.data;
          setAccessToken(accessToken);
          setUser(user);
          console.log(response.data);
        })
        .catch((error) => {
          console.error('Error during Google callback:', error);
          Alert.alert(
            'Authentication Error',
            'An error occurred during authentication.'
          );
        });
    } else if (response?.type === 'error') {
      Alert.alert(
        'Authentication Error',
        'An error occurred during authentication.'
      );
    }
  }, [response]);

  useEffect(() => {
    const handleDeepLink = (event: LinkingEvent) => {
      if (event.url && event.url.startsWith('taskmate://auth')) {
        const urlParams = new URLSearchParams(new URL(event.url).search);
        const tokenFromDeepLink = urlParams.get('accessToken');
        if (tokenFromDeepLink) {
          setAccessToken(tokenFromDeepLink);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Button
      title="Sign in with Google"
      onPress={() => {
        promptAsync();
      }}
    />
  );
}
