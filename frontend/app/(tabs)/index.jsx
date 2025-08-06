import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Calendar, DollarSign, Clock, Bell, FileText, ChevronRight, BookOpen, Bed, CalendarDays, Bookmark } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Manual refresh function that can be called from other screens
  const refreshProfileData = () => {
    console.log('🏠 Home - Manual profile refresh triggered');
    fetchUserProfile();
    fetchUnreadCount();
    fetchAttendanceStats();
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const quickActions = [
    { title: 'Profile', icon: User, route: 'profile', color: '#1e40af' },
    { title: 'Attendance', icon: Calendar, route: 'attendance', color: '#0891b2' },
    { title: 'Fees', icon: DollarSign, route: 'fees', color: '#ea580c' },
    { title: 'Timetable', icon: Clock, route: 'timetable', color: '#8e6e31' },
    { title: 'Circluar', icon: Bell, route: 'notices', color: '#dc2626' },
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
                <View style={styles.profileContainer}>
                  <Image
                    key={`profile-${userInfo?.profileImage || 'default'}-${imageRefreshKey}`}
                    source={displayInfo.profileImageUrl ? { uri: displayInfo.profileImageUrl } : require('../../assets/images/icon.png')}
                    style={styles.profileImage}
                    onError={(error) => {
                      console.log('🏠 Home - Profile image load error:', error);
                    }}
                  />
                  <View style={styles.onlineIndicator} />
                </View>
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{displayInfo.name}</Text>
                <Text style={styles.subtitle}>{displayInfo.subtitle}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
                <Bell size={24} color="#ffffff" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>



        {/* Attendance Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attendance Overview</Text>
            <Text style={styles.sectionSubtitle}>This month's performance</Text>
          </View>
          <TouchableOpacity style={styles.attendanceCard} onPress={() => router.push('attendance')}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.attendanceGradient}
            >
              <View style={styles.attendanceHeader}>
                <View style={styles.attendanceIcon}>
                  <Calendar size={18} color="#ffffff" />
                </View>
                <View style={styles.attendanceStats}>
                  {attendanceLoading ? (
                    <Text style={styles.attendancePercentage}>...</Text>
                  ) : attendanceStats.totalDays > 0 ? (
                    <Text style={styles.attendancePercentage}>{attendanceStats.percentage}%</Text>
                  ) : (
                    <Text style={styles.attendancePercentage}>0%</Text>
                  )}
                  <Text style={styles.attendanceLabel}>Present</Text>
                </View>
              </View>
              <View style={styles.attendanceDetails}>
                <View style={styles.attendanceRow}>
                  <View style={styles.attendanceItem}>
                    <Text style={styles.attendanceNumber}>
                      {attendanceLoading ? '...' : attendanceStats.presentDays}
                    </Text>
                    <Text style={styles.attendanceText}>Days Present</Text>
                  </View>
                  <View style={styles.attendanceItem}>
                    <Text style={styles.attendanceNumber}>
                      {attendanceLoading ? '...' : attendanceStats.absentDays}
                    </Text>
                    <Text style={styles.attendanceText}>Days Absent</Text>
                  </View>
                  <View style={styles.attendanceItem}>
                    <Text style={styles.attendanceNumber}>
                      {attendanceLoading ? '...' : attendanceStats.totalDays}
                    </Text>
                    <Text style={styles.attendanceText}>Total Days</Text>
                  </View>
                </View>
              </View>
              <View style={styles.attendanceProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${attendanceStats.percentage || 0}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {attendanceLoading ? 'Loading...' : `${attendanceStats.percentage || 0}% attendance rate`}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Access your tools</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} onPress={() => router.push(action.route)}>
                <LinearGradient
                  colors={[action.color, action.color + '80']}
                  style={styles.actionIcon}
                >
                  <action.icon size={24} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <Text style={styles.sectionSubtitle}>Stay updated</Text>
          </View>
          <View style={styles.activitiesContainer}>
            {recentActivities.map((activity, index) => (
              <TouchableOpacity key={index} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Bookmark size={16} color="#667eea" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <ChevronRight size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <Text style={styles.sectionSubtitle}>Your classes</Text>
          </View>
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTimeContainer}>
                <Text style={styles.scheduleTime}>9:00</Text>
                <Text style={styles.schedulePeriod}>AM</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleSubject}>Mathematics</Text>
                <Text style={styles.scheduleTeacher}>Mr. Smith</Text>
              </View>
              <View style={styles.scheduleStatus}>
                <View style={styles.statusDot} />
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTimeContainer}>
                <Text style={styles.scheduleTime}>10:00</Text>
                <Text style={styles.schedulePeriod}>AM</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleSubject}>English</Text>
                <Text style={styles.scheduleTeacher}>Ms. Johnson</Text>
              </View>
              <View style={styles.scheduleStatus}>
                <View style={[styles.statusDot, styles.statusDotActive]} />
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTimeContainer}>
                <Text style={styles.scheduleTime}>11:00</Text>
                <Text style={styles.schedulePeriod}>AM</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleSubject}>Physics</Text>
                <Text style={styles.scheduleTeacher}>Dr. Brown</Text>
              </View>
              <View style={styles.scheduleStatus}>
                <View style={styles.statusDot} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileContainer: {
    position: 'relative',
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  userName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  subtitle: {
    color: '#e2e8f0',
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },


  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
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
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  activitiesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  scheduleContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scheduleTimeContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  schedulePeriod: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  scheduleTeacher: {
    fontSize: 12,
    color: '#6b7280',
  },
  scheduleStatus: {
    marginLeft: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  // Attendance Styles
  attendanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  attendanceGradient: {
    padding: 16,
  },
  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  attendanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceStats: {
    alignItems: 'flex-end',
  },
  attendancePercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  attendanceLabel: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.9,
  },
  attendanceDetails: {
    marginBottom: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  attendanceNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  attendanceText: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
  },
  attendanceProgress: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.9,
  },
});