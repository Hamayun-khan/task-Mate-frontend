import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useAppDispatch } from '../../store'; // Import the typed dispatch hook
import { sendResetLink } from '../../store/slices/authSlice'; // Import your action to send reset link

// Define the type for form data
interface FormData {
  email: string;
}

const ForgotPassword = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>(); // Specify the form data type
  const dispatch = useAppDispatch(); // Use the typed dispatch hook

  // Define the onSubmit function with the correct type
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Dispatch the action to send reset link
      const resultAction = await dispatch(sendResetLink(data.email));
      if (sendResetLink.fulfilled.match(resultAction)) {
        console.log('Reset link sent successfully');
        Alert.alert('Success', 'Password reset link sent to your email.');
      } else {
        console.error('Failed to send reset link:', resultAction.payload);
        Alert.alert('Error', resultAction.payload as string);
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message); // Type assertion
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Controller
        control={control}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: 'Invalid email address',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="email"
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </Pressable>
    </View>
  );
};

export default ForgotPassword;

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
