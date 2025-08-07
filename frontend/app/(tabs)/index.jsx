import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Calendar, DollarSign, Clock, Bell, FileText, ChevronRight, BookOpen, Bed, CalendarDays, Bookmark } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageRefreshKey, setImageRefreshKey] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    holidayDays: 0,
    leaveDays: 0,
    workingDays: 0,
    percentage: 0
  });
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // Fetch user profile data on mount
  useEffect(() => {
    fetchUserProfile();
    fetchUnreadCount();
    fetchAttendanceStats();
  }, []);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 Home - Screen focused, refreshing profile data...');
      fetchUserProfile();
      fetchUnreadCount();
      fetchAttendanceStats();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // First try to get stored user data
      const storedUserData = await ApiService.getStoredUserData();
      console.log('🏠 Home - Stored user data:', storedUserData);
      
      // Then fetch fresh data from API
      const apiUserData = await ApiService.getProfile();
      console.log('🏠 Home - API user data:', apiUserData);
      
      // Combine stored and API data
      const combinedUserData = {
        ...storedUserData,
        ...apiUserData.user
      };
      
      console.log('🏠 Home - Combined user data:', combinedUserData);
      setUserInfo(combinedUserData);
      // Force image refresh when profile data is updated
      setImageRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('🏠 Home - Error fetching user profile:', error);
      // Fallback to stored data only
      const storedUserData = await ApiService.getStoredUserData();
      setUserInfo(storedUserData);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await ApiService.getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('🏠 Home - Error fetching unread count:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      setAttendanceLoading(true);
      console.log('📊 Home - Fetching attendance stats...');
      const response = await ApiService.getAttendanceStats();
      console.log('📊 Home - Attendance stats response:', response);
      
      if (response.success && response.data) {
        setAttendanceStats(response.data);
        console.log('📊 Home - Attendance stats updated:', response.data);
      } else {
        console.log('📊 Home - No attendance stats available');
      }
    } catch (error) {
      console.error('📊 Home - Error fetching attendance stats:', error);
      // Keep default values on error
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  // Get user display info with proper image URL construction, memoized for performance
  const getUserDisplayInfo = () => {
    if (!userInfo) return { name: 'Loading...', subtitle: '', profileImageUrl: null };
    
    const name = userInfo.name || userInfo.fullName || 'User';
    
    // Determine subtitle based on user type
    let subtitle = '';
    if (userInfo.role === 'student') {
      // For students, show class and roll number
      const className = userInfo.class || userInfo.className || 'Class';
      const rollNo = userInfo.rollNo || userInfo.rollNumber || '';
      subtitle = `${className} • Roll No: ${rollNo}`;
    } else if (userInfo.role === 'staff') {
      // For staff, show department and designation
      const department = userInfo.department || 'Department';
      const designation = userInfo.designation || 'Staff';
      subtitle = `${department} • ${designation}`;
    } else if (userInfo.role === 'management') {
      // For management, show position
      const position = userInfo.position || 'Management';
      subtitle = position;
    } else {
      // Default fallback
      subtitle = userInfo.email || userInfo.userid || '';
    }
    
    // Handle profile image - now supports base64 data
    let profileImageUrl = null;
    if (userInfo.profileImage) {
      // Check if it's a base64 data URL
      if (userInfo.profileImage.startsWith('data:image/')) {
        profileImageUrl = userInfo.profileImage;
      } else if (userInfo.profileImage.startsWith('http')) {
        // If profileImage is already a full URL, use it directly
        profileImageUrl = `${userInfo.profileImage}?t=${Date.now()}`;
      } else {
        // If it's a path, construct the full URL using API service base URL
        const baseUrl = ApiService.baseURL.replace('/api', '');
        profileImageUrl = `${baseUrl}${userInfo.profileImage}?t=${Date.now()}`;
      }
    }
    
    console.log('🏠 Home - getUserDisplayInfo:', {
      name,
      subtitle,
      role: userInfo.role,
      profileImageUrl: profileImageUrl ? 'Set' : 'Not set',
      originalProfileImage: userInfo.profileImage ? 'Present' : 'Not present'
    });
    
    return { name, subtitle, profileImageUrl };
  };
 
  const displayInfo = getUserDisplayInfo();

  // Show loading state while fetching user data
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const quickActions = [
    { title: 'Profile', icon: User, route: 'profile', color: '#1e40af' },
    { title: 'Attendance', icon: Calendar, route: 'attendance', color: '#0891b2' },
    { title: 'Fees', icon: DollarSign, route: 'fees', color: '#ea580c' },
    { title: 'Timetable', icon: Clock, route: 'timetable', color: '#8e6e31' },
    { title: 'Circular', icon: Bell, route: 'notices', color: '#dc2626' },
    { title: 'Results', icon: FileText, route: 'results', color: '#059669' },
    { title: 'Homework', icon: BookOpen, route: 'homework', color: '#7572ff' },
    { title: 'Events', icon: CalendarDays, route: 'events', color: '#ffbb39' },
    { title: 'Hostel', icon: Bed, route: 'hostel', color: '#a8da61' },
  ];

  const recentActivities = [
    { title: 'Math assignment submitted', time: '1 day ago', type: 'assignment' },
    { title: 'Fee payment reminder', time: '2 days ago', type: 'fee' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ position: 'relative', marginRight: 15 }}>
                <Image
                  key={`profile-${userInfo?.profileImage || 'default'}-${imageRefreshKey}`}
                  source={displayInfo.profileImageUrl ? { uri: displayInfo.profileImageUrl } : require('../../assets/images/icon.png')}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    borderWidth: 3,
                    borderColor: '#ffffff',
                  }}
                  onError={(error) => {
                    console.log('🏠 Home - Profile image load error:', error);
                  }}
                />
                <View style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#10b981',
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#e2e8f0', fontSize: 14 }}>Welcome back,</Text>
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700', marginTop: 2 }}>{displayInfo.name}</Text>
                <Text style={{ color: '#e2e8f0', fontSize: 12, marginTop: 2 }}>{displayInfo.subtitle}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                style={{
                  position: 'relative',
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }} 
                onPress={handleNotificationPress}
              >
                <Bell size={24} color="#ffffff" />
                {unreadCount > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#ef4444',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Attendance Overview */}
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>Attendance Overview</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>This month's performance</Text>
          </View>
          <TouchableOpacity 
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }} 
            onPress={() => router.push('attendance')}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={{ padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Calendar size={18} color="#ffffff" />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {attendanceLoading ? (
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 2 }}>...</Text>
                  ) : attendanceStats.totalDays > 0 ? (
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 2 }}>{attendanceStats.percentage}%</Text>
                  ) : (
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 2 }}>0%</Text>
                  )}
                  <Text style={{ fontSize: 11, color: '#ffffff', opacity: 0.9 }}>Present</Text>
                </View>
              </View>
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 2 }}>
                      {attendanceLoading ? '...' : attendanceStats.presentDays}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#ffffff', opacity: 0.8, textAlign: 'center' }}>Days Present</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 2 }}>
                      {attendanceLoading ? '...' : attendanceStats.absentDays}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#ffffff', opacity: 0.8, textAlign: 'center' }}>Days Absent</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 2 }}>
                      {attendanceLoading ? '...' : attendanceStats.totalDays}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#ffffff', opacity: 0.8, textAlign: 'center' }}>Total Days</Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: '100%',
                  height: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 3,
                  marginBottom: 6,
                  overflow: 'hidden',
                }}>
                  <View style={{
                    height: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: 3,
                    width: `${attendanceStats.percentage || 0}%`
                  }} />
                </View>
                <Text style={{ fontSize: 10, color: '#ffffff', opacity: 0.9 }}>
                  {attendanceLoading ? 'Loading...' : `${attendanceStats.percentage || 0}% attendance rate`}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>Quick Actions</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Access your tools</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={{
                  backgroundColor: '#ffffff',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  width: '30%',
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                }} 
                onPress={() => router.push(action.route)}
              >
                <LinearGradient
                  colors={[action.color, action.color + '80']}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <action.icon size={24} color="#ffffff" />
                </LinearGradient>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' }}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>Recent Activities</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Stay updated</Text>
          </View>
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            {recentActivities.map((activity, index) => (
              <TouchableOpacity key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#f1f5f9',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Bookmark size={16} color="#667eea" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#1f2937', marginBottom: 4 }}>{activity.title}</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{activity.time}</Text>
                </View>
                <ChevronRight size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}