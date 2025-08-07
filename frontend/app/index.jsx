import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import ApiService from '../services/api';
import { tw } from '../utils/tailwind';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      const authenticated = await ApiService.isAuthenticated();
      console.log('🔍 Authentication status:', authenticated);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={tw("flex-1 justify-center items-center bg-gray-50")}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={tw("mt-2 text-gray-500")}>Loading...</Text>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
}