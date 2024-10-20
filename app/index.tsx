import React from 'react';
import { Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';

const SplashScreen = () => {
  const router = useRouter();
  const slide = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const animatedSlideStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: slide.value,
        },
      ],
    };
  });

  const navigateToLogin = () => {
    router.push('/login');
  };

  const handleStart = () => {
    buttonScale.value = withTiming(1.1, { duration: 100 }, () => {
      buttonScale.value = withTiming(1, { duration: 100 });
      slide.value = withTiming(
        -400,
        {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        },
        () => {
          runOnJS(navigateToLogin)();
        }
      );
    });
  };

  return (
    <Animated.View style={[styles.container, animatedSlideStyle]}>
      <Image
        source={require('../assets/images/intro.png')}
        style={styles.image}
      />
      <Text style={styles.title}>Task Management & To-Do List</Text>
      <Text style={styles.description}>
        This productive tool is designed to help you better manage your tasks
        project-wise conveniently.
      </Text>
      <Animated.View style={[styles.button, animatedButtonStyle]}>
        <Pressable onPress={handleStart} style={styles.pressable}>
          <Text style={styles.buttonText}>Let's Start</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  image: {
    borderRadius: 20,
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
