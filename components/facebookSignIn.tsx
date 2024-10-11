import React, { useEffect } from 'react';
import { Button } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';

const facebookAppId = 'YOUR_FACEBOOK_APP_ID';
const authorizationEndpoint = 'https://www.facebook.com/v13.0/dialog/oauth';
const tokenEndpoint = 'https://graph.facebook.com/v13.0/oauth/access_token';
const redirectUri =
  'https://commonly-beloved-calf.ngrok-free.app/auth/facebook/callback';

// Define the expected structure of the token response
interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export default function FacebookSignIn() {
  const discovery = {
    authorizationEndpoint,
    tokenEndpoint,
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: facebookAppId,
      redirectUri,
      scopes: ['email', 'public_profile'],
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      axios
        .post<FacebookTokenResponse>(tokenEndpoint, {
          client_id: facebookAppId,
          redirect_uri: redirectUri,
          client_secret: 'YOUR_FACEBOOK_APP_SECRET',
          code,
        })
        .then((response) => {
          const { access_token } = response.data;
          axios
            .post('https://your-backend-url.com/auth/facebook', {
              access_token,
            })
            .then((response) => {
              console.log(response.data);
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [response]);

  return <Button title="Sign in with Facebook" onPress={() => promptAsync()} />;
}
