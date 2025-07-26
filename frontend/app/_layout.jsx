import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady.jsx';
import { TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />{/* Added register screen */} 
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
        <Stack.Screen name="fees" options={{ title: 'Fees' }} />
        <Stack.Screen name="timetable" options={{ title: 'Timetable' }} />
        <Stack.Screen name="notices" options={{ title: 'Notices' }} />
        <Stack.Screen name="results" options={{ title: 'Results' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}