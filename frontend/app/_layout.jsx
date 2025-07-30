import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady.jsx';

export default function RootLayout() {
  useFrameworkReady();

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
        <Stack.Screen name="homework" options={{ title: 'Homework' }} />
        <Stack.Screen name="events" options={{ title: 'Events' }} />
        <Stack.Screen name="hostel" options={{ title: 'Hostel' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}