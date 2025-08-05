import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import ApiService from '../services/api';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading...</Text>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
}