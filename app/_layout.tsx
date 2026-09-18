import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'auth',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    try {
      Settings.setAutoLogAppEventsEnabled(true);
      Settings.setAdvertiserIDCollectionEnabled(true);
      Settings.initializeSDK();
      AppEventsLogger.logEvent('fb_mobile_activate_app');
      AppEventsLogger.flush();
    } catch (error) {
      console.log('Facebook SDK initialization failed:', error);
    }
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="goals" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="profile-check" options={{ headerShown: false }} />
        <Stack.Screen name="checking" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
