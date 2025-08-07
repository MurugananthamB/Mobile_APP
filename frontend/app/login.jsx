import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';
import { tw } from '../utils/tailwind';

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
    <SafeAreaView style={tw("flex-1")}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={tw("flex-1")}
      >
        <View style={tw("flex-1 px-4 justify-center items-center")}>
          <View style={tw("w-full max-w-sm")}>
         
            {/* Header Section */}
            <View style={tw("items-center mb-8")}>
              <View style={tw("relative")}>
                <Image
                  source={require('../assets/images/logo.jpeg')}
                  style={tw("w-20 h-20 rounded-full")}
                  resizeMode="cover"
                />
                <View style={tw("absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full items-center justify-center")}>
                  <Sparkles size={12} color="#ffffff" />
                </View>
              </View>
              <Text style={tw("text-2xl font-bold text-white text-center mt-3")}>GBPS School App</Text>
              <Text style={tw("text-white opacity-90 text-center mt-1 text-sm")}>Your Digital Learning Companion</Text>
            </View>

            {/* Login Form */}
            <View style={tw("bg-white rounded-2xl p-6 shadow-lg")}>
              <View style={tw("items-center mb-6")}>
                <View style={tw("w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-3")}>
                  <User size={20} color="#3b82f6" />
                </View>
                <Text style={tw("text-xl font-bold text-gray-900 text-center")}>Welcome Back</Text>
                <Text style={tw("text-sm text-gray-500 text-center mt-1")}>Sign in to your account</Text>
              </View>

              {/* Username Input */}
              <View style={tw("mb-4")}>
                <Text style={tw("text-sm font-medium text-gray-700 mb-2")}>Student ID</Text>
                <View style={tw("flex-row items-center bg-gray-50 rounded-xl px-3 border border-gray-200")}>
                  <User size={18} color="#6b7280" style={tw("mr-3")} />
                  <TextInput
                    style={tw("flex-1 py-3 text-base text-gray-900")}
                    placeholder="Enter your student ID"
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
              <View style={tw("mb-4")}>
                <Text style={tw("text-sm font-medium text-gray-700 mb-2")}>Password</Text>
                <View style={tw("flex-row items-center bg-gray-50 rounded-xl px-3 border border-gray-200")}>
                  <Lock size={18} color="#6b7280" style={tw("mr-3")} />
                  <TextInput
                    style={tw("flex-1 py-3 text-base text-gray-900")}
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
                    style={tw("p-2")}
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
              <View style={tw("flex-row justify-between items-center mb-6")}>
                <TouchableOpacity 
                  onPress={() => setRememberMe(!rememberMe)}
                  style={tw("flex-row items-center")}
                  disabled={isLoading}
                >
                  <View style={tw(`w-4 h-4 rounded border-2 mr-2 justify-center items-center ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`)}>
                    {rememberMe && <Text style={tw("text-white text-xs font-bold")}>✓</Text>}
                  </View>
                  <Text style={tw("text-sm text-gray-600")}>Remember me</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleForgotPassword}
                  disabled={isLoading}
                >
                  <Text style={tw("text-sm text-blue-600 font-semibold")}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity 
                style={tw(`rounded-xl overflow-hidden mb-4 ${isLoading ? 'opacity-70' : ''}`)}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
                  style={tw("py-3 items-center")}
                >
                  {isLoading ? (
                    <View style={tw("flex-row items-center")}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={tw("text-base font-bold text-white ml-3")}>Signing In...</Text>
                    </View>
                  ) : (
                    <Text style={tw("text-base font-bold text-white")}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Register Link */}
              <TouchableOpacity 
                style={tw("items-center")} 
                onPress={() => router.push('/register')}
                disabled={isLoading}
              >
                <Text style={tw("text-sm text-gray-500 text-center")}>
                  Don't have an account? <Text style={tw("font-semibold text-blue-600")}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={tw("items-center mt-6")}>
              <Text style={tw("text-white opacity-70 text-xs text-center")}>
                Secure login powered by GBPS School System
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}