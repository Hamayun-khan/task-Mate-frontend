import React, { useEffect } from 'react';
import { Button, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';

const googleClientId = 'YOUR_GOOGLE_CLIENT_ID';
const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
const tokenEndpoint = 'https://oauth2.googleapis.com/token';
const redirectUri =
  'https://commonly-beloved-calf.ngrok-free.app/auth/google/callback';

// Define the expected structure of the token response
interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export default function GoogleSignIn() {
  const discovery = {
    authorizationEndpoint,
    tokenEndpoint,
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId,
      redirectUri,
      scopes: ['openid', 'email', 'profile'],
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      axios
        .post<GoogleTokenResponse>(tokenEndpoint, {
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: googleClientId,
          client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
        })
        .then((response) => {
          const { access_token, id_token } = response.data;
          axios
            .post('https://your-backend-url.com/auth/google', {
              access_token,
              id_token,
            })
            .then((response) => {
              console.log(response.data);
            })
            .catch((error) => {
              console.error('Backend error:', error);
              Alert.alert(
                'Error',
                'An error occurred while communicating with the backend.'
              );
            });
        })
        .catch((error) => {
          console.error('Token exchange error:', error);
          Alert.alert(
            'Error',
            'An error occurred while exchanging the authorization code.'
          );
        });
    }
  }, [response]);

  return <Button title="Sign in with Google" onPress={() => promptAsync()} />;
}
