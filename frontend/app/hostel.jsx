import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bed, Users, Clock, MapPin, Phone, Mail, Wifi, Utensils, Shield, Plus, User, Calendar, CalendarDays, Clock3, BookOpen } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export default function HostelScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      Alert.alert('Error', 'Failed to load hostel information');
      
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
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading hostel information...</Text>
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
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Hostel</Text>
              <Text style={styles.headerSubtitle}>GBPS Student Hostel</Text>
            </View>
                         <View style={styles.headerActions}>
               <TouchableOpacity 
                 style={[styles.contactButton, styles.scheduleButton]}
                 onPress={() => router.push('/schedule')}
               >
                 <BookOpen size={20} color="#ffffff" />
               </TouchableOpacity>
               <TouchableOpacity 
                 style={[styles.contactButton, styles.attendanceButton]}
                 onPress={() => router.push('/hostel-attendance')}
               >
                 <Calendar size={20} color="#ffffff" />
               </TouchableOpacity>
             </View>
          </View>
        </LinearGradient>

                                 {/* Content */}
        
        
        
        {userData?.isHostelResident ? (
          <>
            {/* Room Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Room Information</Text>
              <View style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <View style={styles.roomNumberContainer}>
                    <Bed size={20} color="#1e40af" />
                    <Text style={styles.roomNumber}>{userData?.hostelRoom || 'Not assigned'}</Text>
                  </View>
                  <View style={styles.roomStatus}>
                    <Text style={styles.roomStatusText}>Occupied</Text>
                  </View>
                </View>
                
                <View style={styles.roomDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Floor:</Text>
                    <Text style={styles.detailValue}>{userData?.hostelFloor || 'Not assigned'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Block:</Text>
                    <Text style={styles.detailValue}>{userData?.hostelBlock || 'Not assigned'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Warden:</Text>
                    <Text style={styles.detailValue}>{userData?.hostelWarden || 'Not assigned'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Warden Phone:</Text>
                    <Text style={styles.detailValue}>{userData?.hostelWardenPhone || 'Not available'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stay Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stay Information</Text>
              <View style={styles.stayCard}>
                <View style={styles.stayItem}>
                  <Calendar size={20} color="#1e40af" />
                  <View style={styles.stayText}>
                    <Text style={styles.stayLabel}>Check-in Date</Text>
                    <Text style={styles.stayValue}>{userData?.hostelCheckInDate || 'Not set'}</Text>
                  </View>
                </View>
                <View style={styles.stayItem}>
                  <Calendar size={20} color="#dc2626" />
                  <View style={styles.stayText}>
                    <Text style={styles.stayLabel}>Check-out Date</Text>
                    <Text style={styles.stayValue}>{userData?.hostelCheckOutDate || 'Not set'}</Text>
                  </View>
                </View>
                <View style={styles.stayItem}>
                  <User size={20} color="#10b981" />
                  <View style={styles.stayText}>
                    <Text style={styles.stayLabel}>Resident Status</Text>
                    <Text style={[styles.stayValue, { color: '#10b981', fontWeight: '600' }]}>
                      Active Resident
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          /* Not a hostel resident */
          <View style={styles.section}>
            <View style={styles.noResidentCard}>
              <User size={48} color="#6b7280" />
              <Text style={styles.noResidentTitle}>Not a Hostel Resident</Text>
              <Text style={styles.noResidentText}>
                You are not currently registered as a hostel resident. 
                Contact the administration for hostel accommodation.
              </Text>
            </View>
          </View>
                 )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: '#ff6b6b',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  attendanceButton: {
    backgroundColor: '#4ecdc4',
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  roomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  roomNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginLeft: 8,
  },
  roomStatus: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  roomDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  stayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stayText: {
    marginLeft: 10,
  },
  stayLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  stayValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  noResidentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noResidentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 8,
  },
  noResidentText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
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
  },

  
}); 