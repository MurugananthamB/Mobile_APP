import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function LoginScreen() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!studentId || !password) {
      Alert.alert('Error', 'Please enter both Student ID and Password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 Starting login process...');
      console.log('🔍 Student ID:', studentId);
      console.log('🔍 Password:', password ? '***' : 'empty');
      
      const response = await ApiService.login(studentId, password);
      
      console.log('✅ Login successful:', response);

      // --- Start Data Pre-fetching and Local Storage ---
      try {
        // Fetch data in parallel
        const [profileResponse, unreadCountResponse, attendanceStatsResponse] = await Promise.all([
          ApiService.getProfile(),
          ApiService.getUnreadNotificationCount(),
          ApiService.getAttendanceStats(),
        ]);

        // Store fetched data
        if (profileResponse.success) {
          await AsyncStorage.setItem('@user_profile_data', JSON.stringify(profileResponse.user));
          console.log('✅ Stored user profile data');
        }
        if (unreadCountResponse.success) {
          await AsyncStorage.setItem('@unread_notification_count', JSON.stringify(unreadCountResponse.data.count));
          console.log('✅ Stored unread notification count');
        }
        if (attendanceStatsResponse.success) {
           await AsyncStorage.setItem('@attendance_stats', JSON.stringify(attendanceStatsResponse.data));
           console.log('✅ Stored attendance stats');
        }
      } catch (prefetchError) {
        console.error('⚠️ Error during data pre-fetching or storage:', prefetchError);
        // Continue to home page even if pre-fetching fails
      }
      // Redirect to home page immediately on successful login
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials. Please check your Student ID and Password.',
        [{ text: 'Try Again' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Please contact your school administrator to reset your password.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
            width: '100%', 
            maxWidth: 400,
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 30,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10
          }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
              <View style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40,
                backgroundColor: '#fbbf24',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 15
              }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>GB</Text>
              </View>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: '#1f2937',
                textAlign: 'center',
                marginBottom: 5
              }}>
                GBPS School App
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Your Digital Learning Companion
              </Text>
            </View>

            {/* Welcome Section */}
            <View style={{ alignItems: 'center', marginBottom: 25 }}>
              <View style={{ 
                width: 50, 
                height: 50, 
                borderRadius: 25,
                backgroundColor: '#3b82f6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10
              }}>
                <User size={24} color="white" />
              </View>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: '#1f2937',
                textAlign: 'center',
                marginBottom: 5
              }}>
                Welcome Back
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Sign in to your account
              </Text>
            </View>

            {/* Student ID Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: 8
              }}>
                User ID
              </Text>
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb'
              }}>
                <User size={18} color="#6b7280" style={{ marginRight: 12 }} />
                <TextInput
                  style={{ 
                    flex: 1,
                    fontSize: 16,
                    color: '#1f2937'
                  }}
                  placeholder="Enter your user ID"
                  placeholderTextColor="#9ca3af"
                  value={studentId}
                  onChangeText={setStudentId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: 8
              }}>
                Password
              </Text>
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb'
              }}>
                <Lock size={18} color="#6b7280" style={{ marginRight: 12 }} />
                <TextInput
                  style={{ 
                    flex: 1,
                    fontSize: 16,
                    color: '#1f2937'
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                  disabled={isLoading}
                >
                  {showPassword ? 
                    <EyeOff size={18} color="#6b7280" /> : 
                    <Eye size={18} color="#6b7280" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={{ 
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 25
            }}>
              <TouchableOpacity 
                onPress={() => setRememberMe(!rememberMe)}
                style={{ flexDirection: 'row', alignItems: 'center' }}
                disabled={isLoading}
              >
                <View style={{ 
                  width: 18, 
                  height: 18, 
                  borderRadius: 4, 
                  borderWidth: 2,
                  marginRight: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: rememberMe ? '#3b82f6' : 'transparent',
                  borderColor: rememberMe ? '#3b82f6' : '#d1d5db'
                }}>
                  {rememberMe && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                </View>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={{ fontSize: 14, color: '#3b82f6', fontWeight: '600' }}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={{ 
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 20,
                opacity: isLoading ? 0.7 : 1
              }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#3b82f6', '#1d4ed8']}
                style={{ 
                  paddingVertical: 16,
                  alignItems: 'center'
                }}
              >
                {isLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white', marginLeft: 12 }}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity 
              style={{ alignItems: 'center' }}
              onPress={() => router.push('/register')}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
                Don't have an account? <Text style={{ fontWeight: '600', color: '#3b82f6' }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 12, color: 'white', opacity: 0.7, textAlign: 'center' }}>
              Secure login powered by GBPS School System
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}