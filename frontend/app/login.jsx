import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import ApiService from '../services/api';

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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#e69138','#dc207d','#f1c232']}
        style={styles.gradient}
      >
        <View style={styles.content}>
         
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.jpeg')}
              style={styles.logo}
            />
            <Text style={styles.schoolName}>GBPS School App</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to your account</Text>

            <View style={styles.inputContainer}>
              <User size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="userid"
                placeholderTextColor="#9ca3af"
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
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
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                {showPassword ? 
                  <EyeOff size={20} color="#6b7280" /> : 
                  <Eye size={20} color="#6b7280" />
                }
              </TouchableOpacity>
            </View>

            {/* Remember Me */}
            <View style={styles.rememberContainer}>
              <TouchableOpacity 
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.checkboxContainer}
                disabled={isLoading}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#1e40af', '#3b82f6']}
                style={styles.loginGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.loginButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity 
              style={styles.registerLink} 
              onPress={() => router.push('/register')}
              disabled={isLoading}
            >
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>




          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 5,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: 14,
    color: '#6b7280',
  },
  forgotText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 10,
  },
  registerLink: {
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerTextBold: {
    fontWeight: '600',
    color: '#1e40af',
  },


});