import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import ApiService from '../services/api';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is already logged in
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (token) {
        // User is logged in, redirect to home
        router.replace('/(tabs)');
      } else {
        // User is not logged in, redirect to login
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, redirect to login
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={{ flex: 1 }}
        >
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingHorizontal: 20
          }}>
            <View style={{ 
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 40,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
              maxWidth: 400,
              width: '100%'
            }}>
              {/* Logo */}
              <View style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40,
                backgroundColor: '#fbbf24',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>GB</Text>
              </View>
              
              {/* App Title */}
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: '#1f2937',
                textAlign: 'center',
                marginBottom: 8
              }}>
                GBPS School App
              </Text>
              
              <Text style={{ 
                fontSize: 14, 
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: 30
              }}>
                Your Digital Learning Companion
              </Text>
              
              {/* Loading Indicator */}
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ 
                  marginTop: 16,
                  fontSize: 16,
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  Loading your account...
                </Text>
                <Text style={{ 
                  marginTop: 8,
                  fontSize: 12,
                  color: '#9ca3af',
                  textAlign: 'center'
                }}>
                  Please wait while we verify your credentials
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return null;
}