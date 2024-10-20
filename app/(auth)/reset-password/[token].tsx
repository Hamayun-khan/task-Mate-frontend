import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useAppDispatch } from '../../../store';
import { resetPassword } from '../../../store/slices/authSlice';
import { router, useLocalSearchParams } from 'expo-router';

console.log('ResetPassword component file loaded');

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  console.log('ResetPassword component rendering');
  const { token } = useLocalSearchParams();
  console.log('Reset token from URL:', token);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log('Form submitted with data:', data);
    setLoading(true);
    try {
      console.log('Dispatching resetPassword action');
      const resultAction = await dispatch(
        resetPassword({
          token: token as string,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        })
      );
      console.log('resetPassword action result:', resultAction);
      if (resetPassword.fulfilled.match(resultAction)) {
        console.log('Password reset successful');
        Alert.alert('Success', 'Your password has been reset successfully.');
        router.push('/login');
      } else {
        console.error('Password reset failed:', resultAction.payload);
        Alert.alert('Error', resultAction.payload as string);
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  console.log('Current form errors:', errors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Controller
        control={control}
        rules={{
          required: 'New password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters long',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="New Password"
            onBlur={() => {
              console.log('New password field blurred');
              onBlur();
            }}
            onChangeText={(text) => {
              console.log('New password changed');
              onChange(text);
            }}
            value={value}
            secureTextEntry
          />
        )}
        name="newPassword"
      />
      {errors.newPassword && (
        <Text style={styles.error}>{errors.newPassword.message}</Text>
      )}

      <Controller
        control={control}
        rules={{
          required: 'Please confirm your new password',
          validate: (value) =>
            value === getValues('newPassword') || 'Passwords do not match',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            onBlur={() => {
              console.log('Confirm password field blurred');
              onBlur();
            }}
            onChangeText={(text) => {
              console.log('Confirm password changed');
              onChange(text);
            }}
            value={value}
            secureTextEntry
          />
        )}
        name="confirmPassword"
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword.message}</Text>
      )}

      <Pressable
        style={styles.button}
        onPress={() => {
          console.log('Reset Password button pressed');
          handleSubmit(onSubmit)();
        }}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </Pressable>
    </View>
  );
};

console.log('ResetPassword component defined');

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
});

console.log('Styles defined for ResetPassword component');
