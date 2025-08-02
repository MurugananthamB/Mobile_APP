import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Clock, XCircle, CheckCircle, Settings, Users, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../services/api';

export default function AttendanceScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userRole, setUserRole] = useState(null);
  const [isManagement, setIsManagement] = useState(false);
  const [markedDays, setMarkedDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDayTypeModal, setShowDayTypeModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const router = useRouter();

  // Check user role on component mount
  useEffect(() => {
    checkUserRole();
  }, []);

  // Load marked days when component mounts or month changes
  useEffect(() => {
    loadMarkedDays();
  }, [currentMonth]);

  const loadMarkedDays = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      const response = await ApiService.getMarkedDays(month, year);
      
      if (response.success) {
        setMarkedDays(response.data);
      }
    } catch (error) {
      console.error('Error loading marked days:', error);
    }
  };

  const checkUserRole = async () => {
    try {
      const userData = await ApiService.getStoredUserData();
      
      if (userData && userData.role) {
        setUserRole(userData.role);
        setIsManagement(userData.role === 'management');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarDayPress = (day) => {
    if (!isManagement) {
      // Non-management users can only view
      return;
    }

    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedCalendarDate(dateStr);
    setShowDayTypeModal(true);
  };

  const handleSetDayType = async (dayType) => {
    try {
      const dateStr = selectedCalendarDate;
      
      const dayData = {
        date: dateStr,
        dayType: dayType,
        holidayType: 'both',
        description: `${dayType} day`
      };

      // Check if the date is already marked
      const isAlreadyMarked = markedDays[dateStr];
      
      let response;
      if (isAlreadyMarked) {
        // Update existing day
        response = await ApiService.updateDayManagement(dateStr, dayData);
      } else {
        // Add new day
        response = await ApiService.addDayManagement(dayData);
      }
      
      if (response.success) {
        // Update local state
        setMarkedDays(prev => ({
          ...prev,
          [dateStr]: dayType
        }));
        
        const action = isAlreadyMarked ? 'updated' : 'set';
        Alert.alert('Success', `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} day ${action} successfully!`);
      }
    } catch (error) {
      console.error('Error setting day type:', error);
      Alert.alert('Error', 'Failed to set day type. Please try again.');
    } finally {
      setShowDayTypeModal(false);
      setSelectedCalendarDate(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'holiday': return '#ef4444'; // Red
      case 'leave': return '#f59e0b'; // Orange
      case 'working': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'holiday': return 'H';
      case 'leave': return 'L';
      case 'working': return 'W';
      default: return '';
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const attendanceData = {
    totalDays: 22,
    presentDays: 20,
    absentDays: 2,
    lateDays: 1,
    percentage: 90.9
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Attendance</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Settings size={24} color="#1e40af" />
          </TouchableOpacity>
        </View>

        {/* Attendance Summary */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.attendanceCard}
        >
          <View style={styles.attendanceHeader}>
            <Calendar size={24} color="#ffffff" />
            <Text style={styles.attendanceTitle}>Attendance Overview</Text>
          </View>
          
          <View style={styles.attendanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendanceData.totalDays}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendanceData.presentDays}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendanceData.absentDays}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendanceData.percentage}%</Text>
              <Text style={styles.statLabel}>Percentage</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${attendanceData.percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{attendanceData.percentage}%</Text>
          </View>
        </LinearGradient>

        {/* Management Notice */}
        {isManagement && (
          <View style={styles.managementNotice}>
            <Text style={styles.managementText}>
              💡 Tap any date on the calendar to set it as Working, Holiday, or Leave
            </Text>
          </View>
        )}

        {/* Calendar Navigation */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <ChevronLeft size={24} color="#1e40af" />
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
            <ChevronRight size={24} color="#1e40af" />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {dayNames.map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {getDaysInMonth(currentMonth).map((day, index) => {
              if (day === null) {
                return <View key={index} style={styles.emptyDay} />;
              }

              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayType = markedDays[dateStr];
              const statusColor = getStatusColor(dayType);
              const statusText = getStatusText(dayType);

              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.calendarDay,
                    isManagement && styles.calendarDayClickable
                  ]}
                  onPress={() => handleCalendarDayPress(day)}
                >
                  <Text style={styles.dayNumber}>{day}</Text>
                  {dayType && (
                    <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
                      <Text style={styles.statusText}>{statusText}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Working (W)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Holiday (H)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Leave (L)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Day Type Selection Modal */}
      <Modal
        visible={showDayTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDayTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Day Type</Text>
            <Text style={styles.modalSubtitle}>
              {selectedCalendarDate && new Date(selectedCalendarDate).toLocaleDateString()}
            </Text>
            
            <View style={styles.dayTypeOptions}>
              <TouchableOpacity 
                style={[styles.dayTypeOption, { backgroundColor: '#10b981' }]}
                onPress={() => handleSetDayType('working')}
              >
                <Text style={styles.dayTypeText}>Working</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dayTypeOption, { backgroundColor: '#ef4444' }]}
                onPress={() => handleSetDayType('holiday')}
              >
                <Text style={styles.dayTypeText}>Holiday</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dayTypeOption, { backgroundColor: '#f59e0b' }]}
                onPress={() => handleSetDayType('leave')}
              >
                <Text style={styles.dayTypeText}>Leave</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowDayTypeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  attendanceCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  attendanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  managementNotice: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  managementText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  calendar: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDayClickable: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  legend: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
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
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  dayTypeOptions: {
    marginBottom: 20,
  },
  dayTypeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
});