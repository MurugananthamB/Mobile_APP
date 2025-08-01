import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle, XCircle, Clock, User, ArrowLeft, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import React from 'react'; // Added missing import for React

export default function HostelAttendanceScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Get stored user data first
      const storedUserData = await ApiService.getStoredUserData();

      // Fetch fresh profile data from API
      const profileResponse = await ApiService.getProfile();

      // Combine stored data with API data
      const combinedUserData = {
        ...storedUserData,
        ...profileResponse.user,
      };

      setUserData(combinedUserData);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load hostel attendance information');
      
      // Fallback to stored user data if API fails
      try {
        const storedUserData = await ApiService.getStoredUserData();
        if (storedUserData) {
          setUserData(storedUserData);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // Load sample attendance data
    loadAttendanceData();
  }, []);

  const loadAttendanceData = () => {
    // Sample attendance data - in real app, this would come from API
    const sampleData = [
      { date: '2024-01-15', status: 'present', time: '08:30 AM' },
      { date: '2024-01-14', status: 'present', time: '08:15 AM' },
      { date: '2024-01-13', status: 'absent', time: null },
      { date: '2024-01-12', status: 'present', time: '08:45 AM' },
      { date: '2024-01-11', status: 'present', time: '08:20 AM' },
      { date: '2024-01-10', status: 'present', time: '08:30 AM' },
    ];
    setAttendanceData(sampleData);
    
    // Check today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = sampleData.find(record => record.date === today);
    setTodayAttendance(todayRecord);
  };

  const markAttendance = (status) => {
    Alert.alert(
      'Mark Attendance',
      `Are you sure you want to mark yourself as ${status}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            const currentTime = new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            
            const newAttendance = {
              date: new Date().toISOString().split('T')[0],
              status: status,
              time: status === 'present' ? currentTime : null
            };
            
            setTodayAttendance(newAttendance);
            
            // Update attendance data
            const updatedData = attendanceData.filter(record => 
              record.date !== newAttendance.date
            );
            setAttendanceData([newAttendance, ...updatedData]);
            
            Alert.alert(
              'Success',
              `Attendance marked as ${status} successfully!`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    return status === 'present' ? '#10b981' : '#ef4444';
  };

  const getStatusIcon = (status) => {
    return status === 'present' ? CheckCircle : XCircle;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Loading hostel attendance...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Hostel Attendance</Text>
              <Text style={styles.headerSubtitle}>GBPS Student Hostel</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Attendance Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Attendance</Text>
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Calendar size={24} color="#1e40af" />
              <Text style={styles.todayDate}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            {todayAttendance ? (
              <View style={styles.attendanceStatus}>
                <View style={styles.statusContainer}>
                  {React.createElement(getStatusIcon(todayAttendance.status), {
                    size: 32,
                    color: getStatusColor(todayAttendance.status)
                  })}
                  <Text style={[styles.statusText, { color: getStatusColor(todayAttendance.status) }]}>
                    {todayAttendance.status === 'present' ? 'Present' : 'Absent'}
                  </Text>
                  {todayAttendance.time && (
                    <Text style={styles.timeText}>Marked at {todayAttendance.time}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.noAttendance}>
                <Text style={styles.noAttendanceText}>No attendance marked yet</Text>
                <Text style={styles.noAttendanceSubtext}>Mark your attendance below</Text>
              </View>
            )}
          </View>
        </View>

        {/* Mark Attendance */}
        {!todayAttendance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mark Attendance</Text>
            <View style={styles.markAttendanceCard}>
              <Text style={styles.markAttendanceText}>
                Are you present in the hostel today?
              </Text>
              <View style={styles.markButtons}>
                <TouchableOpacity 
                  style={[styles.markButton, styles.presentButton]}
                  onPress={() => markAttendance('present')}
                >
                  <CheckCircle size={20} color="#ffffff" />
                  <Text style={styles.markButtonText}>Present</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.markButton, styles.absentButton]}
                  onPress={() => markAttendance('absent')}
                >
                  <XCircle size={20} color="#ffffff" />
                  <Text style={styles.markButtonText}>Absent</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Recent Attendance History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          <View style={styles.historyCard}>
            {attendanceData.map((record, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>
                    {new Date(record.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.historyDayText}>
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short'
                    })}
                  </Text>
                </View>
                <View style={styles.historyStatus}>
                  {React.createElement(getStatusIcon(record.status), {
                    size: 20,
                    color: getStatusColor(record.status)
                  })}
                  <Text style={[styles.historyStatusText, { color: getStatusColor(record.status) }]}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </Text>
                </View>
                {record.time && (
                  <View style={styles.historyTime}>
                    <Clock size={16} color="#6b7280" />
                    <Text style={styles.historyTimeText}>{record.time}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Attendance Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Statistics</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {attendanceData.filter(record => record.status === 'present').length}
              </Text>
              <Text style={styles.statLabel}>Present Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {attendanceData.filter(record => record.status === 'absent').length}
              </Text>
              <Text style={styles.statLabel}>Absent Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round((attendanceData.filter(record => record.status === 'present').length / attendanceData.length) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Attendance Rate</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  todayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  todayDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 10,
  },
  attendanceStatus: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  noAttendance: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAttendanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  noAttendanceSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  markAttendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markAttendanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  markButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  presentButton: {
    backgroundColor: '#10b981',
  },
  absentButton: {
    backgroundColor: '#ef4444',
  },
  markButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyDate: {
    flex: 1,
  },
  historyDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  historyDayText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  historyStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  historyTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTimeText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#1e40af',
    fontWeight: '600',
    marginTop: 10,
  },
}); 