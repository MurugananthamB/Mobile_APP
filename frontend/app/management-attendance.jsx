import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, User, Calendar, Check, X, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import ApiService from '../services/api';

export default function ManagementAttendanceScreen() {
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('staff'); // 'staff' or 'management'
  const [submittingGroup, setSubmittingGroup] = useState(null); // 'staff' or 'management'

  useEffect(() => {
    loadStaffAndManagementUsers();
  }, []);

  const loadStaffAndManagementUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch live user data from the backend
      const response = await ApiService.getStaffAndManagementUsers();
      
      if (response.success) {
        setUsers(response.users);
        
        // Initialize attendance data with default values (0 = working)
        const initialAttendanceData = {};
        response.users.forEach(user => {
          initialAttendanceData[user.id] = 0;
        });
        setAttendanceData(initialAttendanceData);
      } else {
        Alert.alert('Error', response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (userId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [userId]: status
    }));
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Working';
      case 1: return 'Present';
      case 2: return 'Absent';
      default: return 'Working';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return '#6b7280'; // Gray for working
      case 1: return '#10b981'; // Green for present
      case 2: return '#ef4444'; // Red for absent
      default: return '#6b7280';
    }
  };

  const handleSubmitAttendance = async (groupType) => {
    try {
      setLoading(true);
      
      // Filter attendance data for the selected group
      const groupUsers = users.filter(user => user.role === groupType);
      const groupAttendanceData = {};
      
      groupUsers.forEach(user => {
        if (attendanceData[user.id] !== undefined) {
          groupAttendanceData[user.id] = attendanceData[user.id];
        }
      });

      // Convert attendance data to the format expected by the API
      const attendanceDataArray = Object.entries(groupAttendanceData).map(([userId, status]) => ({
        userId,
        status
      }));

      const response = await ApiService.markAttendanceForAllUsers(selectedDate, attendanceDataArray);
      
      if (response.success) {
        Alert.alert(
          'Success', 
          `Attendance marked for ${response.data.successful.length} ${groupType} users`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      Alert.alert('Error', 'Failed to submit attendance');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const getStatusCounts = () => {
    const counts = { working: 0, present: 0, absent: 0 };
    Object.values(attendanceData).forEach(status => {
      switch (status) {
        case 0: counts.working++; break;
        case 1: counts.present++; break;
        case 2: counts.absent++; break;
      }
    });
    return counts;
  };

  const getStaffCounts = () => {
    const staffUsers = users.filter(user => user.role === 'staff');
    const counts = { working: 0, present: 0, absent: 0 };
    staffUsers.forEach(user => {
      const status = attendanceData[user.id] || 0;
      switch (status) {
        case 0: counts.working++; break;
        case 1: counts.present++; break;
        case 2: counts.absent++; break;
      }
    });
    return counts;
  };

  const getManagementCounts = () => {
    const managementUsers = users.filter(user => user.role === 'management');
    const counts = { working: 0, present: 0, absent: 0 };
    managementUsers.forEach(user => {
      const status = attendanceData[user.id] || 0;
      switch (status) {
        case 0: counts.working++; break;
        case 1: counts.present++; break;
        case 2: counts.absent++; break;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleBackNavigation = () => {
    // For web platform, always navigate to attendance tab
    if (Platform.OS === 'web') {
      router.push('/(tabs)/attendance');
      return;
    }
    
    // For mobile, try to go back first
    try {
      router.back();
    } catch (error) {
      // If back navigation fails, navigate to attendance tab
      router.push('/(tabs)/attendance');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackNavigation} style={styles.backButton}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Mark Attendance</Text>
              <Text style={styles.headerSubtitle}>For All Staff & Management</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Date Selection */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#1e40af" />
            <Text style={styles.dateText}>{selectedDate}</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSection}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'staff' && styles.tabButtonActive
              ]}
              onPress={() => setSelectedTab('staff')}
            >
              <Text style={[
                styles.tabButtonText,
                selectedTab === 'staff' && styles.tabButtonTextActive
              ]}>
                Staff Members ({users.filter(u => u.role === 'staff').length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'management' && styles.tabButtonActive
              ]}
              onPress={() => setSelectedTab('management')}
            >
              <Text style={[
                styles.tabButtonText,
                selectedTab === 'management' && styles.tabButtonTextActive
              ]}>
                Management ({users.filter(u => u.role === 'management').length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          
          {selectedTab === 'staff' ? (
            <View style={styles.groupSummary}>
              <Text style={styles.groupTitle}>Staff Members</Text>
              <View style={styles.summaryCards}>
                <View style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
                  <Text style={styles.summaryNumber}>{getStaffCounts().present}</Text>
                  <Text style={styles.summaryLabel}>Present</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
                  <Text style={styles.summaryNumber}>{getStaffCounts().absent}</Text>
                  <Text style={styles.summaryLabel}>Absent</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#6b7280' }]}>
                  <Text style={styles.summaryNumber}>{getStaffCounts().working}</Text>
                  <Text style={styles.summaryLabel}>Working</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.groupSummary}>
              <Text style={styles.groupTitle}>Management Team</Text>
              <View style={styles.summaryCards}>
                <View style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
                  <Text style={styles.summaryNumber}>{getManagementCounts().present}</Text>
                  <Text style={styles.summaryLabel}>Present</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
                  <Text style={styles.summaryNumber}>{getManagementCounts().absent}</Text>
                  <Text style={styles.summaryLabel}>Absent</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#6b7280' }]}>
                  <Text style={styles.summaryNumber}>{getManagementCounts().working}</Text>
                  <Text style={styles.summaryLabel}>Working</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Users Section */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>
            {selectedTab === 'staff' ? 'Staff Members' : 'Management Team'}
          </Text>
          {users.filter(user => user.role === selectedTab).map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <User size={20} color={selectedTab === 'staff' ? "#1e40af" : "#8b5cf6"} />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userId}>
                    {user.userid} • {selectedTab === 'staff' ? (user.subject || 'Staff') : (user.position || 'Management')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.attendanceButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: attendanceData[user.id] === 0 ? '#6b7280' : '#f3f4f6' }
                  ]}
                  onPress={() => handleAttendanceChange(user.id, 0)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    { color: attendanceData[user.id] === 0 ? '#ffffff' : '#6b7280' }
                  ]}>
                    Working
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: attendanceData[user.id] === 1 ? '#10b981' : '#f3f4f6' }
                  ]}
                  onPress={() => handleAttendanceChange(user.id, 1)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    { color: attendanceData[user.id] === 1 ? '#ffffff' : '#10b981' }
                  ]}>
                    Present
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: attendanceData[user.id] === 2 ? '#ef4444' : '#f3f4f6' }
                  ]}
                  onPress={() => handleAttendanceChange(user.id, 2)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    { color: attendanceData[user.id] === 2 ? '#ffffff' : '#ef4444' }
                  ]}>
                    Absent
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <View style={styles.submitButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton, 
              selectedTab === 'staff' ? styles.staffSubmitButton : styles.managementSubmitButton,
              loading && styles.submitButtonDisabled
            ]}
            onPress={() => {
              setSubmittingGroup(selectedTab);
              setShowConfirmModal(true);
            }}
            disabled={loading}
          >
            <Users size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : `Submit ${selectedTab === 'staff' ? 'Staff' : 'Management'} Attendance`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Confirm {submittingGroup === 'staff' ? 'Staff' : 'Management'} Attendance
            </Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to submit attendance for {users.filter(u => u.role === submittingGroup).length} {submittingGroup} users on {selectedDate}?
            </Text>
            
            <View style={styles.modalSummary}>
              {submittingGroup === 'staff' ? (
                <Text style={styles.modalSummaryText}>
                  Staff - Present: {getStaffCounts().present} | Absent: {getStaffCounts().absent} | Working: {getStaffCounts().working}
                </Text>
              ) : (
                <Text style={styles.modalSummaryText}>
                  Management - Present: {getManagementCounts().present} | Absent: {getManagementCounts().absent} | Working: {getManagementCounts().working}
                </Text>
              )}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowConfirmModal(false);
                  setSubmittingGroup(null);
                }}
              >
                <X size={20} color="#6b7280" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleSubmitAttendance(submittingGroup)}
              >
                <Check size={20} color="#ffffff" />
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  dateSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 10,
  },
  tabSection: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabButtonTextActive: {
    color: '#1e40af',
  },
  summarySection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  groupSummary: {
    marginBottom: 15,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  usersSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userDetails: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userId: {
    fontSize: 14,
    color: '#6b7280',
  },
  attendanceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButtonsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingVertical: 15,
    borderRadius: 12,
  },
  staffSubmitButton: {
    backgroundColor: '#1e40af',
  },
  managementSubmitButton: {
    backgroundColor: '#8b5cf6',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalSummary: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalSummaryText: {
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
}); 