import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Phone, MapPin, User, Calendar, BookOpen, Award, Edit3, LogOut, RefreshCw, X, Camera, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUpdateKey, setImageUpdateKey] = useState(0);

  // Fetch user profile data
  const fetchUserProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Get stored user data first
      const storedUserData = await ApiService.getStoredUserData();
      console.log('📱 Stored user data:', storedUserData);

      // Fetch fresh profile data from API
      const profileResponse = await ApiService.getProfile();
      console.log('📱 Profile API response:', profileResponse);

      // Combine stored data with API data
      const combinedUserData = {
        ...storedUserData,
        ...profileResponse.user,
      };

      setUserData(combinedUserData);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError(error.message || 'Failed to load profile data');
      
      // Fallback to stored user data if API fails
      try {
        const storedUserData = await ApiService.getStoredUserData();
        if (storedUserData) {
          setUserData(storedUserData);
          setError(null);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    fetchUserProfile(true);
  };

  // Initialize edit form when opening modal
  const openEditModal = () => {
    if (userData) {
      setEditForm({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        dateOfBirth: userData.dateOfBirth || '',
        bloodGroup: userData.bloodGroup || '',
        parentName: userData.parentName || '',
        parentPhone: userData.parentPhone || '',
        emergencyContact: userData.emergencyContact || '',
        rollNo: userData.rollNo || '',
        assignedClass: userData.assignedClass || '',
        assignedSection: userData.assignedSection || '',
        qualification: userData.qualification || '',
        subject: userData.subject || '',
        department: userData.department || '',
        position: userData.position || '',
        experience: userData.experience || '',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      });
      setSelectedImage(null);
      setShowEditModal(true);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditForm({});
    setSelectedImage(null);
    setSaving(false);
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
        let result;
        if (Platform.OS === 'web') {
            // Web implementation
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setSelectedImage(event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        } else {
            // Mobile implementation
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'We need access to your photos');
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        }
    } catch (error) {
        console.error('Image picker error:', error);
        Alert.alert('Error', 'Failed to pick image');
    }
};

  // Take photo with camera
  const takePhoto = async () => {
    try {
      console.log('📸 Starting camera...');
      console.log('📸 Platform:', Platform.OS);
      
      // Platform-specific handling
      if (Platform.OS === 'web') {
        console.log('📸 Camera not available on web, redirecting to gallery');
        Alert.alert('Camera Unavailable', 'Camera is not available on web. Please use gallery instead.');
        pickImage();
        return;
      }
      
      // Request permissions for mobile
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📸 Camera permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Camera permission denied');
        Alert.alert('Permission needed', 'Please grant permission to access your camera.');
        return;
      }

      console.log('📸 Launching camera...');
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('📸 Camera result:', result);
      console.log('📸 Result canceled:', result.canceled);
      console.log('📸 Result assets:', result.assets);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('📸 Photo taken details:', {
          uri: selectedAsset.uri,
          type: selectedAsset.type,
          fileName: selectedAsset.fileName,
          fileSize: selectedAsset.fileSize,
          width: selectedAsset.width,
          height: selectedAsset.height
        });
        
        setSelectedImage(selectedAsset);
        Alert.alert('Success', 'Photo taken! Tap Save to upload.');
      } else {
        console.log('📸 Photo cancelled or no photo taken');
      }
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    console.log('📸 Image picker options requested');
    console.log('📸 Platform:', Platform.OS);
    
    // Platform-specific handling
    if (Platform.OS === 'web') {
      console.log('📸 Web platform detected, using direct file picker');
      pickImage();
      return;
    }
    
    Alert.alert(
      'Choose Photo',
      'Select a photo from your gallery or take a new one',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('📸 Image picker cancelled by user')
        },
        {
          text: 'Gallery',
          onPress: () => {
            console.log('📸 User selected Gallery option');
            pickImage();
          },
        },
        {
          text: 'Camera',
          onPress: () => {
            console.log('📸 User selected Camera option');
            takePhoto();
          },
        },
      ]
    );
  };

  // Save profile changes
  const saveProfile = async () => {
    try {
        setSaving(true);
        
        // Upload image if selected
        let imageUrl = userData?.profileImage;
        if (selectedImage) {
            const formData = new FormData();
            if (Platform.OS === 'web') {
                // Web upload
                const response = await fetch(selectedImage);
                const blob = await response.blob();
                formData.append('image', blob, 'profile.jpg');
            } else {
                // Mobile upload
                const uriParts = selectedImage.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append('image', {
                    uri: selectedImage,
                    name: `profile.${fileType}`,
                    type: `image/${fileType}`,
                });
            }
            
            const uploadResponse = await ApiService.uploadProfileImage(formData);
            
            // Handle different response formats
            if (uploadResponse?.url) {
                imageUrl = uploadResponse.url;
            } else if (uploadResponse?.data?.url) {
                imageUrl = uploadResponse.data.url;
            } else if (uploadResponse?.imageUrl) {
                imageUrl = uploadResponse.imageUrl;
            } else {
                console.log('Upload response:', uploadResponse);
                throw new Error('Image upload failed - unexpected response format');
            }
        }
        
        // Update profile with new image
        const updateResponse = await ApiService.updateProfile({
            ...editForm,
            profileImage: imageUrl
        });
        
        if (!updateResponse?.data) {
            throw new Error('Profile update failed');
        }
        
        setUserData(updateResponse.data);
        setShowEditModal(false);
        Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
        console.error('Save error:', error);
        Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
        setSaving(false);
    }
};

  // Generate academic info based on user role
  const getAcademicInfo = () => {
    if (!userData) return [];

    const baseInfo = [
      { label: 'Academic Year', value: '2023-24' },
    ];

    if (userData.role === 'student') {
      return [
        { label: 'Current CGPA', value: '8.5' },
        { label: 'Attendance', value: '92%' },
        { label: 'Total Subjects', value: '8' },
        ...baseInfo,
      ];
    } else if (userData.role === 'staff') {
      return [
        { label: 'Subject', value: userData.subject || 'Not Assigned' },
        { label: 'Qualification', value: userData.qualification || 'Not Specified' },
        { label: 'Experience', value: '5+ Years' },
        ...baseInfo,
      ];
    } else if (userData.role === 'management') {
      return [
        { label: 'Department', value: userData.department || 'Not Assigned' },
        { label: 'Position', value: userData.position || 'Not Specified' },
        { label: 'Experience', value: userData.experience || 'Not Specified' },
        ...baseInfo,
      ];
    }

    return baseInfo;
  };

  // Get user display info
  const getUserDisplayInfo = () => {
    if (!userData) return {};

    // Add cache-busting parameter to profile image URL
    const profileImageUrl = userData.profileImage 
      ? `${userData.profileImage}?t=${Date.now()}` 
      : null;

    const baseInfo = {
      name: userData.name || 'User',
      email: userData.email || 'No email provided',
      phone: userData.phone || 'No phone provided',
      address: userData.address || 'No address provided',
      userid: userData.userid || 'N/A',
      role: userData.role || 'Unknown',
      profileImage: profileImageUrl,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      lastLogin: userData.lastLogin || null,
    };

    if (userData.role === 'student') {
      return {
        ...baseInfo,
        rollNo: userData.rollNo || 'N/A',
        class: userData.assignedClass || 'N/A',
        section: userData.assignedSection || 'N/A',
        admissionNo: userData.userid || 'N/A',
        dateOfBirth: userData.dateOfBirth || 'Not specified',
        bloodGroup: userData.bloodGroup || 'Not specified',
        parentName: userData.parentName || 'Not specified',
        parentPhone: userData.parentPhone || 'Not specified',
        emergencyContact: userData.emergencyContact || 'Not specified',
      };
    } else if (userData.role === 'staff') {
      return {
        ...baseInfo,
        qualification: userData.qualification || 'Not specified',
        subject: userData.subject || 'Not specified',
      };
    } else if (userData.role === 'management') {
      return {
        ...baseInfo,
        qualification: userData.qualification || 'Not specified',
        department: userData.department || 'Not specified',
        position: userData.position || 'Not specified',
        experience: userData.experience || 'Not specified',
      };
    }

    return baseInfo;
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              console.log('Logout confirmed - redirecting to login');
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              router.replace('/login');
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchUserProfile()}>
            <RefreshCw size={16} color="#ffffff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userInfo = getUserDisplayInfo();
  const academicInfo = getAcademicInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1e40af']}
            tintColor="#1e40af"
          />
        }
      >
        {/* Profile Information Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.profileHeader}
        >
          <View style={styles.profileHeaderContent}>
            <Image 
              key={`${userInfo.profileImage || 'default'}-${imageUpdateKey}`}
              source={{
                uri: selectedImage?.uri || (userInfo.profileImage 
                  ? `${userInfo.profileImage}${userInfo.profileImage.includes('?') ? '&' : '?'}t=${Date.now()}` 
                  : 'https://via.placeholder.com/150')
              }}
              style={styles.profileImage}
            />
            <Text style={styles.studentName}>{userInfo.name}</Text>
            <Text style={styles.studentDetails}>
              {userData?.role === 'student' 
                ? `Class ${userInfo.class} • Roll No: ${userInfo.rollNo}`
                : `${userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1)} • ${userInfo.userid}`
              }
            </Text>
            <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
              <Edit3 size={16} color="#ffffff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>
                    {userData?.role === 'student' ? 'Admission No' : 'User ID'}
                  </Text>
                  <Text style={styles.infoValue}>
                    {userData?.role === 'student' ? userInfo.admissionNo : userInfo.userid}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <BookOpen size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <Text style={styles.infoValue}>
                    {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              {userData?.role === 'student' ? (
                <>
                  <View style={styles.infoItem}>
                    <Calendar size={20} color="#1e40af" />
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Date of Birth</Text>
                      <Text style={styles.infoValue}>{userInfo.dateOfBirth}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Award size={20} color="#1e40af" />
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Blood Group</Text>
                      <Text style={styles.infoValue}>{userInfo.bloodGroup}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoItem}>
                    <BookOpen size={20} color="#1e40af" />
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Qualification</Text>
                      <Text style={styles.infoValue}>{userInfo.qualification}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Award size={20} color="#1e40af" />
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>
                        {userData?.role === 'staff' ? 'Subject' : 'Department'}
                      </Text>
                      <Text style={styles.infoValue}>
                        {userData?.role === 'staff' ? userInfo.subject : userInfo.department}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
            {userData?.role === 'student' && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <BookOpen size={20} color="#1e40af" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Class</Text>
                    <Text style={styles.infoValue}>{userInfo.class}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Award size={20} color="#1e40af" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Section</Text>
                    <Text style={styles.infoValue}>{userInfo.section}</Text>
                  </View>
                </View>
              </View>
            )}
            {userData?.role === 'management' && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <BookOpen size={20} color="#1e40af" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Position</Text>
                    <Text style={styles.infoValue}>{userInfo.position}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Award size={20} color="#1e40af" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Experience</Text>
                    <Text style={styles.infoValue}>{userInfo.experience}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Account Status</Text>
                  <Text style={[styles.infoValue, { color: userInfo.isActive ? '#10b981' : '#ef4444' }]}>
                    {userInfo.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Last Login</Text>
                  <Text style={styles.infoValue}>
                    {userInfo.lastLogin ? new Date(userInfo.lastLogin).toLocaleDateString() : 'Never'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <BookOpen size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Award size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Profile Updated</Text>
                  <Text style={styles.infoValue}>
                    {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'Never'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Academic Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userData?.role === 'student' ? 'Academic Performance' : 'Professional Information'}
          </Text>
          <View style={styles.academicGrid}>
            {academicInfo.map((item, index) => (
              <View key={index} style={styles.academicCard}>
                <Text style={styles.academicValue}>{item.value}</Text>
                <Text style={styles.academicLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Mail size={20} color="#1e40af" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{userInfo.email}</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Phone size={20} color="#1e40af" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{userInfo.phone}</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <MapPin size={20} color="#1e40af" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{userInfo.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Parent Information - Only for students */}
        {userData?.role === 'student' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent Information</Text>
            <View style={styles.parentCard}>
              <View style={styles.parentItem}>
                <User size={20} color="#1e40af" />
                <View style={styles.parentText}>
                  <Text style={styles.parentLabel}>Parent Name</Text>
                  <Text style={styles.parentValue}>{userInfo.parentName}</Text>
                </View>
              </View>
              <View style={styles.parentItem}>
                <Phone size={20} color="#1e40af" />
                <View style={styles.parentText}>
                  <Text style={styles.parentLabel}>Parent Phone</Text>
                  <Text style={styles.parentValue}>{userInfo.parentPhone}</Text>
                </View>
              </View>
              <View style={styles.parentItem}>
                <Phone size={20} color="#dc2626" />
                <View style={styles.parentText}>
                  <Text style={styles.parentLabel}>Emergency Contact</Text>
                  <Text style={styles.parentValue}>{userInfo.emergencyContact}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ffffff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity 
              onPress={saveProfile} 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Save size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <TouchableOpacity 
                onPress={() => {
                  console.log('📸 Image container pressed!');
                  showImagePickerOptions();
                }} 
                style={styles.imageContainer}
              >
                <Image
                  key={`${userInfo.profileImage || 'default'}-${imageUpdateKey}`}
                  source={{
                    uri: selectedImage?.uri || (userInfo.profileImage 
                      ? `${userInfo.profileImage}${userInfo.profileImage.includes('?') ? '&' : '?'}t=${Date.now()}` 
                      : 'https://via.placeholder.com/150')
                  }}
                  style={styles.editProfileImage}
                />
                <View style={styles.imageOverlay}>
                  <Camera size={24} color="#ffffff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.imageLabel}>Tap to change photo</Text>
            </View>

            {/* Basic Information Form */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editForm.address}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, address: text }))}
                  placeholder="Enter your address"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                />
              </View>

               {/* Role-specific fields */}
               {userData?.role === 'student' && (
                 <>
                   <View style={styles.inputRow}>
                     <View style={[styles.inputGroup, styles.halfWidth]}>
                       <Text style={styles.inputLabel}>Roll Number</Text>
                       <TextInput
                         style={styles.textInput}
                         value={editForm.rollNo}
                         onChangeText={(text) => setEditForm(prev => ({ ...prev, rollNo: text }))}
                         placeholder="Roll number"
                         placeholderTextColor="#9ca3af"
                       />
                     </View>
                     <View style={[styles.inputGroup, styles.halfWidth]}>
                       <Text style={styles.inputLabel}>Class</Text>
                       <TextInput
                         style={styles.textInput}
                         value={editForm.assignedClass}
                         onChangeText={(text) => setEditForm(prev => ({ ...prev, assignedClass: text }))}
                         placeholder="Class"
                         placeholderTextColor="#9ca3af"
                       />
                     </View>
                   </View>

                   <View style={styles.inputRow}>
                     <View style={[styles.inputGroup, styles.halfWidth]}>
                       <Text style={styles.inputLabel}>Section</Text>
                       <TextInput
                         style={styles.textInput}
                         value={editForm.assignedSection}
                         onChangeText={(text) => setEditForm(prev => ({ ...prev, assignedSection: text }))}
                         placeholder="Section"
                         placeholderTextColor="#9ca3af"
                       />
                     </View>
                     <View style={[styles.inputGroup, styles.halfWidth]}>
                       <Text style={styles.inputLabel}>Blood Group</Text>
                       <TextInput
                         style={styles.textInput}
                         value={editForm.bloodGroup}
                         onChangeText={(text) => setEditForm(prev => ({ ...prev, bloodGroup: text }))}
                         placeholder="Blood group"
                         placeholderTextColor="#9ca3af"
                       />
                     </View>
                   </View>

                   <View style={styles.inputGroup}>
                     <Text style={styles.inputLabel}>Date of Birth</Text>
                     <TextInput
                       style={styles.textInput}
                       value={editForm.dateOfBirth}
                       onChangeText={(text) => setEditForm(prev => ({ ...prev, dateOfBirth: text }))}
                       placeholder="DD/MM/YYYY"
                       placeholderTextColor="#9ca3af"
                     />
                   </View>
                 </>
               )}

               {userData?.role === 'staff' && (
                 <>
                   <View style={styles.inputGroup}>
                     <Text style={styles.inputLabel}>Subject</Text>
                     <TextInput
                       style={styles.textInput}
                       value={editForm.subject}
                       onChangeText={(text) => setEditForm(prev => ({ ...prev, subject: text }))}
                       placeholder="Enter your subject"
                       placeholderTextColor="#9ca3af"
                     />
                   </View>

                   <View style={styles.inputGroup}>
                     <Text style={styles.inputLabel}>Qualification</Text>
                     <TextInput
                       style={styles.textInput}
                       value={editForm.qualification}
                       onChangeText={(text) => setEditForm(prev => ({ ...prev, qualification: text }))}
                       placeholder="Enter your qualification"
                       placeholderTextColor="#9ca3af"
                     />
                   </View>
                 </>
               )}

               {userData?.role === 'management' && (
                 <>
                   <View style={styles.inputGroup}>
                     <Text style={styles.inputLabel}>Department</Text>
                     <TextInput
                       style={styles.textInput}
                       value={editForm.department}
                       onChangeText={(text) => setEditForm(prev => ({ ...prev, department: text }))}
                       placeholder="Enter your department"
                       placeholderTextColor="#9ca3af"
                     />
                   </View>

                   <View style={styles.inputRow}>
                     <View style={[styles.inputGroup, styles.halfWidth]}>
                       <Text style={styles.inputLabel}>Position</Text>
                       <TextInput
                         style={styles.textInput}
                         value={editForm.position}
                         onChangeText={(text) => setEditForm(prev => ({ ...prev, position: text }))}
                         placeholder="Position"
                         placeholderTextColor="#9ca3af"
                       />
                     </View>
                     <View style={[styles.inputGroup, styles.halfWidth]}>
                       <Text style={styles.inputLabel}>Experience</Text>
                       <TextInput
                         style={styles.textInput}
                         value={editForm.experience}
                         onChangeText={(text) => setEditForm(prev => ({ ...prev, experience: text }))}
                         placeholder="Experience"
                         placeholderTextColor="#9ca3af"
                       />
                     </View>
                   </View>

                   <View style={styles.inputGroup}>
                     <Text style={styles.inputLabel}>Qualification</Text>
                     <TextInput
                       style={styles.textInput}
                       value={editForm.qualification}
                       onChangeText={(text) => setEditForm(prev => ({ ...prev, qualification: text }))}
                       placeholder="Enter your qualification"
                       placeholderTextColor="#9ca3af"
                     />
                   </View>
                 </>
               )}

               {/* Account Information - Read Only */}
               <Text style={styles.formSectionTitle}>Account Information</Text>
               <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Account Status</Text>
                 <View style={[styles.textInput, styles.readOnlyInput]}>
                   <Text style={[styles.readOnlyText, { color: editForm.isActive ? '#10b981' : '#ef4444' }]}>
                     {editForm.isActive ? 'Active' : 'Inactive'}
                   </Text>
                 </View>
               </View>

               <View style={styles.inputRow}>
                 <View style={[styles.inputGroup, styles.halfWidth]}>
                   <Text style={styles.inputLabel}>Member Since</Text>
                   <View style={[styles.textInput, styles.readOnlyInput]}>
                     <Text style={styles.readOnlyText}>
                       {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                     </Text>
                   </View>
                 </View>
                 <View style={[styles.inputGroup, styles.halfWidth]}>
                   <Text style={styles.inputLabel}>Last Updated</Text>
                   <View style={[styles.textInput, styles.readOnlyInput]}>
                     <Text style={styles.readOnlyText}>
                       {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'Never'}
                     </Text>
                   </View>
                 </View>
               </View>

               {/* Parent Information - Only for students */}
              {userData?.role === 'student' && (
                <>
                  <Text style={styles.formSectionTitle}>Parent Information</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Parent Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.parentName}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, parentName: text }))}
                      placeholder="Enter parent name"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>Parent Phone</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editForm.parentPhone}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, parentPhone: text }))}
                        placeholder="Parent phone"
                        placeholderTextColor="#9ca3af"
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>Emergency Contact</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editForm.emergencyContact}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, emergencyContact: text }))}
                        placeholder="Emergency contact"
                        placeholderTextColor="#9ca3af"
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileHeaderContent: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    marginBottom: 15,
  },
  studentName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  studentDetails: {
    color: '#e2e8f0',
    fontSize: 14,
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  academicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  academicCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  academicValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 5,
  },
  academicLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    marginLeft: 15,
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  parentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  parentText: {
    marginLeft: 15,
    flex: 1,
  },
  parentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  parentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  editProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1e40af',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e40af',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  imageLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  formSection: {
    marginTop: 20,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4b5563',
    borderRadius: 8,
  },
  readOnlyText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});