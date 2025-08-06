import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady.jsx';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="attendance" />
        <Stack.Screen name="fees" />
        <Stack.Screen name="timetable" />
        <Stack.Screen name="notices" />
        <Stack.Screen name="results" />
        <Stack.Screen name="homework" />
        <Stack.Screen name="events" />
        <Stack.Screen name="hostel" />
        <Stack.Screen name="hostel-attendance" />
<<<<<<< HEAD
        <Stack.Screen name="scanAttendance" />
=======

>>>>>>> 08d5d5a (attendance page maual push working)
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}