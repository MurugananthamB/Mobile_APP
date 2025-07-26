import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Mail, ChevronDown, GraduationCap, Users, Building2, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import ApiService from '../services/api';

export default function RegisterScreen() {
  const [userid, setUserid] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('student'); // Default user type
  const [showPicker, setShowPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userTypes = [
    { label: 'Register as Student', value: 'student', icon: GraduationCap, color: '#3b82f6' },
    { label: 'Register as Staff', value: 'staff', icon: Users, color: '#10b981' },
    { label: 'Register as Management', value: 'management', icon: Building2, color: '#f59e0b' },
  ];

  const selectedUserType = userTypes.find(type => type.value === userType);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleRegister = async () => {
    // Validation
    if (!userid || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        userid,
        email,
        password,
        role: userType
      };

      console.log('Sending registration data:', userData);
      const response = await ApiService.register(userData);

      Alert.alert(
        'Registration Successful!',
        `Welcome to GBPS! Your account has been created successfully.\n\nUser ID: ${response.user.userid}\nEmail: ${response.user.email}\nRole: ${response.user.role}`,
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'Try Again' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#e69138', '#dc207d', '#f1c232']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Register</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <User size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="userid"
                placeholderTextColor="#9ca3af"
                value={userid}
                onChangeText={setUserid}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
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
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Custom User Type Selector */}
                                <TouchableOpacity
                      style={styles.customPickerContainer}
                      onPress={() => setShowPicker(true)}
                      activeOpacity={0.7}
                      disabled={isLoading}
                    >
              <View style={styles.pickerHeader}>
                <View style={styles.pickerIconContainer}>
                  <selectedUserType.icon size={20} color={selectedUserType.color} />
                </View>
                <View style={styles.pickerTextContainer}>
                  <Text style={styles.pickerLabel}>User Type</Text>
                  <Text style={[styles.pickerValue, { color: selectedUserType.color }]}>
                    {selectedUserType.label}
                  </Text>
                </View>
                <ChevronDown size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>

            {/* Custom Picker Modal */}
            <Modal
              visible={showPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select User Type</Text>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {userTypes.map((type, index) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.optionItem,
                        userType === type.value && styles.optionItemSelected
                      ]}
                      onPress={() => {
                        setUserType(type.value);
                        setShowPicker(false);
                      }}
                    >
                      <View style={[styles.optionIcon, { backgroundColor: type.color + '20' }]}>
                        <type.icon size={24} color={type.color} />
                      </View>
                      <Text style={[
                        styles.optionText,
                        userType === type.value && { color: type.color, fontWeight: '600' }
                      ]}>
                        {type.label}
                      </Text>
                      {userType === type.value && (
                        <View style={[styles.checkmark, { backgroundColor: type.color }]}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>

            {/* Register Button */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <LinearGradient
                colors={['#1e40af', '#3b82f6']}
                style={styles.registerGradient}
              >
                <Text style={styles.registerButtonText}>Register</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
              <Text style={styles.backButtonText}>Already have an account? Login</Text>
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
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
  // Custom Picker Styles
  customPickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  pickerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '300',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionItemSelected: {
    backgroundColor: '#f8fafc',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  registerGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 10,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  backButtonTextBold: {
    fontWeight: '600',
    color: '#1e40af',
  },
  eyeIcon: {
    padding: 5,
  },
});
