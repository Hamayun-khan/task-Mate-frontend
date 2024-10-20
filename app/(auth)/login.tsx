import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable, // Updated import
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice'; // Redux action
import { AppDispatch } from '../../store/index'; // Import AppDispatch type
import { useOAuth, useAuth } from '@clerk/clerk-expo'; // Clerk OAuth
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

// Form validation schema
const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  useWarmUpBrowser();

  // Renamed the second startOAuthFlow to startFacebookOAuthFlow
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({
    strategy: 'oauth_google',
  });
  const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({
    strategy: 'oauth_facebook',
  });
  const { signOut } = useAuth();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const action = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(action)) {
        router.push('/home');
      } else if (loginUser.rejected.match(action)) {
        Alert.alert(
          'Login Error',
          action.payload || 'Invalid email or password.'
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert(
        'Login Error',
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onPressGoogleSignIn = async () => {
    try {
      await signOut();

      const redirectUrl = Linking.createURL('/home');

      const { createdSessionId, setActive } = await startGoogleOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/home');
      } else {
        throw new Error('Failed to create a new session.');
      }
    } catch (err) {
      console.error('OAuth error:', err);
      Alert.alert(
        'Google Sign-In Error',
        err instanceof Error
          ? err.message
          : 'Failed to sign in with Google. Please try again.'
      );
    }
  };

  const onPressFacebookSignIn = async () => {
    try {
      // Sign out from any existing session
      await signOut();

      // Define the redirect URL
      const redirectUrl = Linking.createURL('/home');

      // Start the Facebook OAuth flow with Clerk
      const { createdSessionId, setActive } = await startFacebookOAuthFlow({
        redirectUrl,
      });

      // Check if a session was created
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/home'); // Redirect the user to the home screen
      } else {
        throw new Error('Failed to create a new session.');
      }
    } catch (err) {
      console.error('Facebook OAuth error:', err);
      Alert.alert(
        'Facebook Sign-In Error',
        err instanceof Error
          ? err.message
          : 'Failed to sign in with Facebook. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>
          )}
        />

        <Pressable
          style={styles.forgotPassword}
          onPress={() => router.push('/forgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        <Pressable
          style={styles.loginButton}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </Pressable>

        <Pressable onPress={onPressGoogleSignIn}>
          <Text>Sign in with Google</Text>
        </Pressable>

        <Pressable onPress={onPressFacebookSignIn}>
          <Text>Sign in with Facebook</Text>
        </Pressable>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  formContainer: { flex: 1, padding: 20, justifyContent: 'center' },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  inputContainer: { marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  errorText: { color: '#FF3B30', fontSize: 12, marginTop: 5, marginLeft: 5 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { color: '#6200EE', fontSize: 14 },
  loginButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: { color: '#666', fontSize: 14 },
  signupLink: { color: '#6200EE', fontSize: 14, fontWeight: 'bold' },
});

// Warm-up browser for OAuth
export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};
