import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bed, Users, Clock, MapPin, Phone, Mail, User, Calendar, BookOpen } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const { width, height } = Dimensions.get('window');

export default function HostelScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const storedUserData = await ApiService.getStoredUserData();
      
      if (storedUserData) {
        setUserData(storedUserData);
        console.log('📊 Stored user data:', storedUserData);
        console.log('🏠 Is hostel resident:', storedUserData.isHostelResident);
        console.log('🏠 Hostel room:', storedUserData.hostelRoom);
        console.log('🏠 Hostel block:', storedUserData.hostelBlock);
        console.log('🏠 Hostel floor:', storedUserData.hostelFloor);
        console.log('🏠 Hostel warden:', storedUserData.hostelWarden);
      }

      try {
        const profileResponse = await ApiService.getProfile();
        const combinedUserData = {
          ...storedUserData,
          ...profileResponse.user,
        };
        setUserData(combinedUserData);
        console.log('📊 Combined user data:', combinedUserData);
        console.log('🏠 Is hostel resident:', combinedUserData.isHostelResident);
        console.log('🏠 Hostel room:', combinedUserData.hostelRoom);
        console.log('🏠 Hostel block:', combinedUserData.hostelBlock);
        console.log('🏠 Hostel floor:', combinedUserData.hostelFloor);
        console.log('🏠 Hostel warden:', combinedUserData.hostelWarden);
        console.log('🏠 Hostel warden phone:', combinedUserData.hostelWardenPhone);
        console.log('🏠 Hostel check-in date:', combinedUserData.hostelCheckInDate);
        console.log('🏠 Hostel check-out date:', combinedUserData.hostelCheckOutDate);
      } catch (apiError) {
        console.log('⚠️ API fetch failed, using stored data:', apiError.message);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      Alert.alert('Error', 'Failed to load hostel information');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Bed size={32} color="#1e40af" />
          </View>
          <Text style={styles.loadingText}>Loading hostel information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6', '#60a5fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Hostel</Text>
              <Text style={styles.headerSubtitle}>GBPS Student Residence</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/schedule')}
              >
                <BookOpen size={20} color="#1e3a8a" />
                <Text style={styles.headerButtonText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/hostel-attendance')}
              >
                <Calendar size={20} color="#065f46" />
                <Text style={styles.headerButtonText}>Attendance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* User Information Section */}
        <View style={styles.contentContainer}>
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoHeader}>
              <View style={styles.userInfoLeft}>
                <View style={styles.userIcon}>
                  <User size={24} color="#1e40af" />
                </View>
                <View>
                  <Text style={styles.userName}>{userData?.name || 'Student'}</Text>
                  <Text style={styles.userRole}>{userData?.role || 'Student'}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: userData?.isHostelResident ? '#dcfce7' : '#fef3c7',
              }]}>
                <Text style={[styles.statusText, { 
                  color: userData?.isHostelResident ? '#059669' : '#d97706',
                }]}>
                  {userData?.isHostelResident ? 'Hostel Resident' : 'Day Scholar'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Room Information Card (if hostel resident) */}
        {userData?.isHostelResident && (
          <View style={styles.contentContainer}>
            <View style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <View style={styles.roomInfo}>
                  <View style={styles.roomIcon}>
                    <Bed size={24} color="#1e40af" />
                  </View>
                  <View>
                    <Text style={styles.roomTitle}>
                      {userData?.hostelRoom || 'Room 101'}
                    </Text>
                    <Text style={styles.roomSubtitle}>Your Residence</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
              
              <View style={styles.roomDetails}>
                <View style={[styles.roomDetail, { backgroundColor: '#eff6ff', borderRadius: 8, padding: 12 }]}>
                  <Users size={18} color="#1e40af" />
                  <Text style={styles.detailLabel}>Room Type</Text>
                  <Text style={styles.detailValue}>{userData?.hostelRoomType || 'Standard'}</Text>
                </View>
                <View style={[styles.roomDetail, { backgroundColor: '#fef2f2', borderRadius: 8, padding: 12 }]}>
                  <MapPin size={18} color="#dc2626" />
                  <Text style={styles.detailLabel}>Block</Text>
                  <Text style={styles.detailValue}>{userData?.hostelBlock || 'Block A'}</Text>
                </View>
                <View style={[styles.roomDetail, { backgroundColor: '#fffbeb', borderRadius: 8, padding: 12 }]}>
                  <Clock size={18} color="#d97706" />
                  <Text style={styles.detailLabel}>Floor</Text>
                  <Text style={styles.detailValue}>{userData?.hostelFloor || 'Ground'}</Text>
                </View>
                <View style={[styles.roomDetail, { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 12 }]}>
                  <User size={18} color="#7c3aed" />
                  <Text style={styles.detailLabel}>Warden</Text>
                  <Text style={styles.detailValue}>{userData?.hostelWarden || 'Not Assigned'}</Text>
                </View>
                <View style={[styles.roomDetail, { backgroundColor: '#ecfeff', borderRadius: 8, padding: 12 }]}>
                  <Phone size={18} color="#0891b2" />
                  <Text style={styles.detailLabel}>Warden Phone</Text>
                  <Text style={styles.detailValue}>{userData?.hostelWardenPhone || 'N/A'}</Text>
                </View>
                <View style={[styles.roomDetail, { backgroundColor: '#ecfdf5', borderRadius: 8, padding: 12 }]}>
                  <Calendar size={18} color="#059669" />
                  <Text style={styles.detailLabel}>Check-in Date</Text>
                  <Text style={styles.detailValue}>{userData?.hostelCheckInDate || 'Not Set'}</Text>
                </View>
                {userData?.hostelCheckOutDate && (
                  <View style={[styles.roomDetail, { backgroundColor: '#fff7ed', borderRadius: 8, padding: 12 }]}>
                    <Calendar size={18} color="#ea580c" />
                    <Text style={styles.detailLabel}>Check-out Date</Text>
                    <Text style={styles.detailValue}>{userData?.hostelCheckOutDate}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Hostel Information for Non-Residents */}
        {!userData?.isHostelResident && (
          <View style={styles.contentContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <View style={styles.infoIcon}>
                  <Bed size={24} color="#6b7280" />
                </View>
                <View>
                  <Text style={styles.infoTitle}>Not a Hosteller</Text>
                  <Text style={styles.infoSubtitle}>You are currently a day scholar</Text>
                </View>
              </View>
              
              <View style={styles.infoDetails}>
                {userData?.hostelRoom && (
                  <View style={styles.infoDetail}>
                    <Text style={styles.infoLabel}>Previous Room</Text>
                    <Text style={styles.infoValue}>{userData.hostelRoom}</Text>
                  </View>
                )}
                {userData?.hostelBlock && (
                  <View style={styles.infoDetail}>
                    <Text style={styles.infoLabel}>Previous Block</Text>
                    <Text style={styles.infoValue}>{userData.hostelBlock}</Text>
                  </View>
                )}
                {userData?.hostelFloor && (
                  <View style={styles.infoDetail}>
                    <Text style={styles.infoLabel}>Previous Floor</Text>
                    <Text style={styles.infoValue}>{userData.hostelFloor}</Text>
                  </View>
                )}
                {userData?.hostelWarden && (
                  <View style={styles.infoDetail}>
                    <Text style={styles.infoLabel}>Previous Warden</Text>
                    <Text style={styles.infoValue}>{userData.hostelWarden}</Text>
                  </View>
                )}
                {userData?.hostelCheckInDate && (
                  <View style={styles.infoDetail}>
                    <Text style={styles.infoLabel}>Previous Check-in</Text>
                    <Text style={styles.infoValue}>{userData.hostelCheckInDate}</Text>
                  </View>
                )}
                {!userData?.hostelRoom && !userData?.hostelBlock && !userData?.hostelFloor && (
                  <View style={styles.infoDetail}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={styles.infoValue}>No previous hostel record</Text>
                  </View>
                )}
              </View>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dbeafe',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    padding: 24,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  contentContainer: {
    padding: 16,
    marginTop: -16,
  },
  userInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 14,
    color: '#6b7280',
  },
  roomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  roomSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  roomDetails: {
    gap: 12,
  },
  roomDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  infoDetails: {
    gap: 12,
  },
  infoDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
}); 