import React, { useEffect } from 'react';
import { View, Text, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '../../../constants/config';

console.log('ResetPasswordWeb component file loaded');

interface ResetTokenResponse {
  resetToken: string;
}

const ResetPasswordWeb = () => {
  const { resetId } = useLocalSearchParams();
  console.log('Reset ID from URL:', resetId);

  useEffect(() => {
    const getResetTokenAndOpenApp = async () => {
      try {
        console.log(
          'Making API request to:',
          `${BASE_URL}/api/v1/user/reset-password-web/${resetId}`
        );
        const response = await axios.get<ResetTokenResponse>(
          `${BASE_URL}/api/v1/user/reset-password-web/${resetId}`
        );
        console.log('API response received:', response.data);
        const { resetToken } = response.data;

        const deepLink = `taskmate://reset-password?token=${resetToken}`;
        console.log('Deep link constructed:', deepLink);

        const supported = await Linking.canOpenURL(deepLink);
        if (supported) {
          console.log('Deep link supported, opening URL');
          await Linking.openURL(deepLink);
        } else {
          console.log('App is not installed');
        }
      } catch (error) {
        console.error('Error getting reset token:', error);
      }
    };

    getResetTokenAndOpenApp();
  }, [resetId]);

  return (
    <View>
      <Text>Opening the app...</Text>
    </View>
  );
};

export default ResetPasswordWeb;
