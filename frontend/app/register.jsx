import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, Mail, ChevronDown, Users, Building2, Eye, EyeOff, GraduationCap, BookOpen, Briefcase, X, CheckCircle, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import ApiService from '../services/api';

export default function RegisterScreen() {
  const [userid, setUserid] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('staff'); // Default user type
  const [showPicker, setShowPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Additional fields for staff and management
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [experience, setExperience] = useState('');

  // Picker states
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showQualificationPicker, setShowQualificationPicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);

  // Form validation states
  const [validationErrors, setValidationErrors] = useState({});

  const userTypes = [
    { label: 'Register as Staff', value: 'staff', icon: Users, color: '#10b981', description: 'For teachers and educators' },
    { label: 'Register as Management', value: 'management', icon: Building2, color: '#f59e0b', description: 'For administrative staff' },
  ];

  const selectedUserType = userTypes.find(type => type.value === userType);

  // Options for dropdowns
  const subjectOptions = [
    { label: 'Mathematics', value: 'Mathematics', icon: '🔢' },
    { label: 'English', value: 'English', icon: '📚' },
    { label: 'Science', value: 'Science', icon: '🔬' },
    { label: 'Physics', value: 'Physics', icon: '⚛️' },
    { label: 'Chemistry', value: 'Chemistry', icon: '🧪' },
    { label: 'Biology', value: 'Biology', icon: '🧬' },
    { label: 'History', value: 'History', icon: '📜' },
    { label: 'Geography', value: 'Geography', icon: '🌍' },
    { label: 'Computer Science', value: 'Computer Science', icon: '💻' },
    { label: 'Physical Education', value: 'Physical Education', icon: '⚽' },
  ];

  const qualificationOptions = [
    { label: 'Bachelor of Education (B.Ed)', value: 'B.Ed', icon: '🎓' },
    { label: 'Master of Education (M.Ed)', value: 'M.Ed', icon: '🎓' },
    { label: 'Bachelor of Science (B.Sc)', value: 'B.Sc', icon: '🔬' },
    { label: 'Master of Science (M.Sc)', value: 'M.Sc', icon: '🔬' },
    { label: 'Bachelor of Arts (B.A)', value: 'B.A', icon: '📚' },
    { label: 'Master of Arts (M.A)', value: 'M.A', icon: '📚' },
    { label: 'PhD', value: 'PhD', icon: '👨‍🎓' },
    { label: 'MBA', value: 'MBA', icon: '💼' },
    { label: 'Other', value: 'Other', icon: '📋' },
  ];

  const departmentOptions = [
    { label: 'Academic Affairs', value: 'Academic Affairs', icon: '📚' },
    { label: 'Administration', value: 'Administration', icon: '🏢' },
    { label: 'Finance', value: 'Finance', icon: '💰' },
    { label: 'Human Resources', value: 'Human Resources', icon: '👥' },
    { label: 'Student Affairs', value: 'Student Affairs', icon: '🎓' },
    { label: 'IT Department', value: 'IT Department', icon: '💻' },
    { label: 'Operations', value: 'Operations', icon: '⚙️' },
    { label: 'Principal Office', value: 'Principal Office', icon: '🏛️' },
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const errors = {};

    if (!userid.trim()) errors.userid = 'User ID is required';
    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(email)) errors.email = 'Please enter a valid email';
    if (!password) errors.password = 'Password is required';
    else if (!validatePassword(password)) errors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (userType === 'staff') {
      if (!qualification) errors.qualification = 'Qualification is required';
      if (!subject) errors.subject = 'Subject is required';
    } else if (userType === 'management') {
      if (!qualification) errors.qualification = 'Qualification is required';
      if (!department) errors.department = 'Department is required';
      if (!position.trim()) errors.position = 'Position is required';
      if (!experience.trim()) errors.experience = 'Experience is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        userid: userid.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: userType
      };

      // Add role-specific data
      if (userType === 'staff') {
        userData.qualification = qualification;
        userData.subject = subject;
      } else if (userType === 'management') {
        userData.department = department;
        userData.position = position.trim();
        userData.experience = experience.trim();
        userData.qualification = qualification;
      }

      console.log('Sending registration data:', userData);
      const response = await ApiService.register(userData);

      // Show brief success message
      Alert.alert(
        'Registration Successful! 🎉',
        `Welcome to GBPS, ${response.user.name}!\n\nRedirecting to login...`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Automatically redirect to login page
              router.replace('/login');
            },
          },
        ]
      );

      // Also auto-redirect after 2 seconds even if user doesn't click OK
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
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

  const getInputStyle = (fieldName) => [
    styles.input,
    validationErrors[fieldName] && styles.inputError
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Sparkles size={28} color="#ffffff" style={styles.titleIcon} />
              <Text style={styles.title}>Create Account</Text>
            </View>
            <Text style={styles.subtitle}>Join GBPS Community</Text>
          </View>

          {/* Registration Form */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.formContent}>
              {/* Enhanced User Type Selector - MOVED TO TOP */}
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.modernPickerContainer}
                  onPress={() => setShowPicker(true)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <View style={styles.pickerContent}>
                    <View style={[styles.pickerIconContainer, { backgroundColor: selectedUserType.color + '20' }]}>
                      <selectedUserType.icon size={24} color={selectedUserType.color} />
                    </View>
                    <View style={styles.pickerTextContainer}>
                      <Text style={styles.pickerLabel}>User Type</Text>
                      <Text style={[styles.pickerValue, { color: selectedUserType.color }]}>
                        {selectedUserType.label}
                      </Text>
                      <Text style={styles.pickerDescription}>{selectedUserType.description}</Text>
                    </View>
                    <ChevronDown size={20} color="#6b7280" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* User ID Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, validationErrors.userid && styles.inputContainerError]}>
                  <User size={20} color={validationErrors.userid ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                  <TextInput
                    style={getInputStyle('userid')}
                    placeholder="User ID"
                    placeholderTextColor="#9ca3af"
                    value={userid}
                    onChangeText={setUserid}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {validationErrors.userid && <Text style={styles.errorText}>{validationErrors.userid}</Text>}
              </View>

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, validationErrors.name && styles.inputContainerError]}>
                  <User size={20} color={validationErrors.name ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                  <TextInput
                    style={getInputStyle('name')}
                    placeholder="Full Name"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {validationErrors.name && <Text style={styles.errorText}>{validationErrors.name}</Text>}
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, validationErrors.email && styles.inputContainerError]}>
                  <Mail size={20} color={validationErrors.email ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                  <TextInput
                    style={getInputStyle('email')}
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
                {validationErrors.email && <Text style={styles.errorText}>{validationErrors.email}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, validationErrors.password && styles.inputContainerError]}>
                  <Lock size={20} color={validationErrors.password ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                  <TextInput
                    style={getInputStyle('password')}
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
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
                {validationErrors.password && <Text style={styles.errorText}>{validationErrors.password}</Text>}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, validationErrors.confirmPassword && styles.inputContainerError]}>
                  <Lock size={20} color={validationErrors.confirmPassword ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                  <TextInput
                    style={getInputStyle('confirmPassword')}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9ca3af"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
                {validationErrors.confirmPassword && <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>}
              </View>

              {/* Staff-specific fields */}
              {userType === 'staff' && (
                <>
                  <View style={styles.inputGroup}>
                    <View style={[styles.inputContainer, validationErrors.qualification && styles.inputContainerError]}>
                      <GraduationCap size={20} color={validationErrors.qualification ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setShowQualificationPicker(true)}
                        disabled={isLoading}
                      >
                        <Text style={[styles.selectButtonText, !qualification && styles.selectButtonPlaceholder]}>
                          {qualification ? 
                            `${qualificationOptions.find(q => q.value === qualification)?.icon} ${qualification}` : 
                            'Select Qualification'
                          }
                        </Text>
                        <ChevronDown size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    {validationErrors.qualification && <Text style={styles.errorText}>{validationErrors.qualification}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={[styles.inputContainer, validationErrors.subject && styles.inputContainerError]}>
                      <BookOpen size={20} color={validationErrors.subject ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setShowSubjectPicker(true)}
                        disabled={isLoading}
                      >
                        <Text style={[styles.selectButtonText, !subject && styles.selectButtonPlaceholder]}>
                          {subject ? 
                            `${subjectOptions.find(s => s.value === subject)?.icon} ${subject}` : 
                            'Select Subject'
                          }
                        </Text>
                        <ChevronDown size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    {validationErrors.subject && <Text style={styles.errorText}>{validationErrors.subject}</Text>}
                  </View>
                </>
              )}

              {/* Management-specific fields */}
              {userType === 'management' && (
                <>
                  <View style={styles.inputGroup}>
                    <View style={[styles.inputContainer, validationErrors.department && styles.inputContainerError]}>
                      <Building2 size={20} color={validationErrors.department ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setShowDepartmentPicker(true)}
                        disabled={isLoading}
                      >
                        <Text style={[styles.selectButtonText, !department && styles.selectButtonPlaceholder]}>
                          {department ? 
                            `${departmentOptions.find(d => d.value === department)?.icon} ${department}` : 
                            'Select Department'
                          }
                        </Text>
                        <ChevronDown size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    {validationErrors.department && <Text style={styles.errorText}>{validationErrors.department}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={[styles.inputContainer, validationErrors.position && styles.inputContainerError]}>
                      <Briefcase size={20} color={validationErrors.position ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                      <TextInput
                        style={getInputStyle('position')}
                        placeholder="Position/Designation"
                        placeholderTextColor="#9ca3af"
                        value={position}
                        onChangeText={setPosition}
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!isLoading}
                      />
                    </View>
                    {validationErrors.position && <Text style={styles.errorText}>{validationErrors.position}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={[styles.inputContainer, validationErrors.experience && styles.inputContainerError]}>
                      <User size={20} color={validationErrors.experience ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                      <TextInput
                        style={getInputStyle('experience')}
                        placeholder="Years of Experience"
                        placeholderTextColor="#9ca3af"
                        value={experience}
                        onChangeText={setExperience}
                        keyboardType="numeric"
                        autoCorrect={false}
                        editable={!isLoading}
                      />
                    </View>
                    {validationErrors.experience && <Text style={styles.errorText}>{validationErrors.experience}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={[styles.inputContainer, validationErrors.qualification && styles.inputContainerError]}>
                      <GraduationCap size={20} color={validationErrors.qualification ? "#ef4444" : "#6b7280"} style={styles.inputIcon} />
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setShowQualificationPicker(true)}
                        disabled={isLoading}
                      >
                        <Text style={[styles.selectButtonText, !qualification && styles.selectButtonPlaceholder]}>
                          {qualification ? 
                            `${qualificationOptions.find(q => q.value === qualification)?.icon} ${qualification}` : 
                            'Select Qualification'
                          }
                        </Text>
                        <ChevronDown size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    {validationErrors.qualification && <Text style={styles.errorText}>{validationErrors.qualification}</Text>}
                  </View>
                </>
              )}

              {/* Enhanced Register Button */}
              <TouchableOpacity 
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.registerButtonText}>Creating Account...</Text>
                    </View>
                  ) : (
                    <View style={styles.loadingContainer}>
                      <CheckCircle size={20} color="#ffffff" />
                      <Text style={styles.registerButtonText}>Create Account</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
                <Text style={styles.backButtonText}>
                  Already have an account? <Text style={styles.backButtonTextBold}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Enhanced User Type Picker Modal */}
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modernModalContent}>
              <View style={styles.modernModalHeader}>
                <Text style={styles.modernModalTitle}>Choose Your Role</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.closeButton}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              {userTypes.map((type, index) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.modernOptionItem,
                    userType === type.value && styles.modernOptionItemSelected
                  ]}
                  onPress={() => {
                    setUserType(type.value);
                    setShowPicker(false);
                  }}
                >
                  <View style={[styles.modernOptionIcon, { backgroundColor: type.color + '20' }]}>
                    <type.icon size={28} color={type.color} />
                  </View>
                  <View style={styles.modernOptionText}>
                    <Text style={[
                      styles.modernOptionTitle,
                      userType === type.value && { color: type.color }
                    ]}>
                      {type.label}
                    </Text>
                    <Text style={styles.modernOptionDescription}>{type.description}</Text>
                  </View>
                  {userType === type.value && (
                    <View style={[styles.modernCheckmark, { backgroundColor: type.color }]}>
                      <CheckCircle size={20} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Subject Picker Modal */}
        <Modal
          visible={showSubjectPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSubjectPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Subject</Text>
                <TouchableOpacity onPress={() => setShowSubjectPicker(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {subjectOptions.map((subjectOption) => (
                  <TouchableOpacity
                    key={subjectOption.value}
                    style={[
                      styles.optionItem,
                      subject === subjectOption.value && styles.optionItemSelected
                    ]}
                    onPress={() => {
                      setSubject(subjectOption.value);
                      setShowSubjectPicker(false);
                    }}
                  >
                    <Text style={styles.optionEmoji}>{subjectOption.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      subject === subjectOption.value && { color: '#10b981', fontWeight: '600' }
                    ]}>
                      {subjectOption.label}
                    </Text>
                    {subject === subjectOption.value && (
                      <CheckCircle size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Qualification Picker Modal */}
        <Modal
          visible={showQualificationPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowQualificationPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Qualification</Text>
                <TouchableOpacity onPress={() => setShowQualificationPicker(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {qualificationOptions.map((qualOption) => (
                  <TouchableOpacity
                    key={qualOption.value}
                    style={[
                      styles.optionItem,
                      qualification === qualOption.value && styles.optionItemSelected
                    ]}
                    onPress={() => {
                      setQualification(qualOption.value);
                      setShowQualificationPicker(false);
                    }}
                  >
                    <Text style={styles.optionEmoji}>{qualOption.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      qualification === qualOption.value && { color: '#f59e0b', fontWeight: '600' }
                    ]}>
                      {qualOption.label}
                    </Text>
                    {qualification === qualOption.value && (
                      <CheckCircle size={20} color="#f59e0b" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Department Picker Modal */}
        <Modal
          visible={showDepartmentPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDepartmentPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Department</Text>
                <TouchableOpacity onPress={() => setShowDepartmentPicker(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {departmentOptions.map((deptOption) => (
                  <TouchableOpacity
                    key={deptOption.value}
                    style={[
                      styles.optionItem,
                      department === deptOption.value && styles.optionItemSelected
                    ]}
                    onPress={() => {
                      setDepartment(deptOption.value);
                      setShowDepartmentPicker(false);
                    }}
                  >
                    <Text style={styles.optionEmoji}>{deptOption.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      department === deptOption.value && { color: '#3b82f6', fontWeight: '600' }
                    ]}>
                      {deptOption.label}
                    </Text>
                    {department === deptOption.value && (
                      <CheckCircle size={20} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  inputError: {
    color: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  modernPickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  pickerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  pickerDescription: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '400',
  },
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  selectButtonPlaceholder: {
    color: '#9ca3af',
  },
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  backButtonTextBold: {
    fontWeight: '700',
    color: '#667eea',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modernModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: '50%',
  },
  modernModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modernOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modernOptionItemSelected: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  modernOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modernOptionText: {
    flex: 1,
  },
  modernOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  modernOptionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  modernCheckmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  modalScrollView: {
    paddingHorizontal: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: '#f8fafc',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});
