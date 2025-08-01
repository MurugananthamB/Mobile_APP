import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Calendar, DollarSign, Clock, Bell, FileText, ChevronRight, BookOpen, Bed, CalendarDays, TrendingUp, Award, Bookmark, LogOut } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
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
    } catch (error) {
      console.error('🏠 Home - Error fetching user profile:', error);
      // Fallback to stored data only
      const storedUserData = await ApiService.getStoredUserData();
      setUserInfo(storedUserData);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await ApiService.logout();
      console.log('🚪 Logout successful, navigating to login');
      router.replace('/login');
    } catch (error) {
      console.error('🚪 Logout error:', error);
      // Even if logout fails, clear local data and redirect
      await ApiService.logout();
      router.replace('/login');
    }
  };

  // Get user display info with proper image URL construction
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
    
    // Construct profile image URL properly
    let profileImageUrl = null;
    if (userInfo.profileImage) {
      // If profileImage is already a full URL, use it directly
      if (userInfo.profileImage.startsWith('http')) {
        profileImageUrl = `${userInfo.profileImage}?t=${Date.now()}`;
      } else {
        // If it's a path, construct the full URL
        const baseUrl = 'http://192.168.101.45:5000';
        profileImageUrl = `${baseUrl}${userInfo.profileImage}?t=${Date.now()}`;
      }
    }
    
    console.log('🏠 Home - getUserDisplayInfo:', {
      name,
      subtitle,
      role: userInfo.role,
      profileImageUrl,
      originalProfileImage: userInfo.profileImage
    });
    
    return { name, subtitle, profileImageUrl };
  };

  const displayInfo = getUserDisplayInfo();

  // Show loading state while fetching user data
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container}>
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
                    source={{ 
                      uri: displayInfo.profileImageUrl || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400' 
                    }}
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
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={24} color="#ffffff" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#86efac', '#4ade80']}
            style={styles.statCard}
          >
            <View style={styles.statIcon}>
              <TrendingUp size={20} color="#ffffff" />
            </View>
            <Text style={styles.statNumber}>92%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['#93c5fd', '#60a5fa']}
            style={styles.statCard}
          >
            <View style={styles.statIcon}>
              <Award size={20} color="#ffffff" />
            </View>
            <Text style={styles.statNumber}>8.5</Text>
            <Text style={styles.statLabel}>CGPA</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['#fcd34d', '#fbbf24']}
            style={styles.statCard}
          >
            <View style={styles.statIcon}>
              <DollarSign size={20} color="#ffffff" />
            </View>
            <Text style={styles.statNumber}>₹2,500</Text>
            <Text style={styles.statLabel}>Due Fees</Text>
          </LinearGradient>
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
    paddingHorizontal: 20,
    paddingVertical: 30,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: -25,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
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
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '30%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
});