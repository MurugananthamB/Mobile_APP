import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { ChevronLeft, ChevronRight, Calendar, Settings, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

=======
import { ChevronLeft, ChevronRight, Calendar, Settings, UserCheck, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { isManagement } from '../../utils/roleUtils';
>>>>>>> 08d5d5a (attendance page maual push working)
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../services/api';

export default function AttendanceScreen() {
  const router = useRouter(); // Initialize useRouter
  const [userRole, setUserRole] = useState(null);
  const [isManagement, setIsManagement] = useState(false);
  const [markedDays, setMarkedDays] = useState([]); // Initialize markedDays as an array
  const [individualAttendance, setIndividualAttendance] = useState([]); // New state for individual attendance
  const [showDayTypeModal, setShowDayTypeModal] = useState(false); // State for modal visibility
  const [currentMonth, setCurrentMonth] = useState(new Date()); // State for the currently displayed month
  const [loading, setLoading] = useState(true); // Overall loading state
  const [loadingStats, setLoadingStats] = useState(false); // Loading state specifically for attendance stats
  const [attendanceSummary, setAttendanceSummary] = useState({
 totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    percentage: 0,
  });
<<<<<<< HEAD
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null); // New state for selected date
=======
  const [isNavigatingToScan, setIsNavigatingToScan] = useState(false); // State for scan navigation loading
>>>>>>> 08d5d5a (attendance page maual push working)

  // Check user role on component mount
  useEffect(() => {
    checkUserRole();
  }, []);

<<<<<<< HEAD
  // Load data when the component mounts and when the month changes or modal is closed (after setting day type)
=======
  // Load data when the component mounts and when the month changes
>>>>>>> 08d5d5a (attendance page maual push working)
  useEffect(() => {
    loadMarkedDays();
    loadAttendanceStats();
    loadIndividualAttendance();
  }, [currentMonth, showDayTypeModal]); // Depend on currentMonth and showDayTypeModal

<<<<<<< HEAD
=======


  // Reset navigation state when component focuses
  useEffect(() => {
    // Reset navigation state when component mounts
    setIsNavigatingToScan(false);
  }, []);

>>>>>>> 08d5d5a (attendance page maual push working)
  const reloadMarkedDays = async () => { // Corrected function definition
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const response = await ApiService.getMarkedDays(month, year);
      
      if (response.success) {
        // Transform the array response into an object for easier lookup
        const markedDaysObject = response.data;
        setMarkedDays(markedDaysObject);
      }
    } catch (error) {
      console.error('Error loading marked days:', error); // eslint-disable-line no-console
    }
  };

  const loadMarkedDays = useCallback(async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const response = await ApiService.getMarkedDays(month, year);
      if (response.success) {
        setMarkedDays(response.data); // Assuming the backend returns an object { "date": "dayType" }
      }
    } catch (error) {
      console.error('Error loading marked days:', error); // eslint-disable-line no-console
    }
  }, [currentMonth]);


  const loadAttendanceStats = async () => {
    try {
      setLoadingStats(true);
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      // Assuming your getAttendanceStats API can take month/year params or fetches current month
      const response = await ApiService.getAttendanceStats(month, year); 
      if (response.success) {
        setAttendanceSummary(response.data);
        console.log('Attendance Summary after setting state:', response.data);
      } else {
        setAttendanceSummary({ totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0 }); // Reset on error
        console.error('Error loading attendance stats:', response.message); // eslint-disable-line no-console
      }
    } catch (error) {
 console.error('Error loading attendance stats:', error);
    } finally { setLoadingStats(false); } // You might set a loading state for stats specifically if needed
  };

  
  const loadIndividualAttendance = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
<<<<<<< HEAD
      const response = await ApiService.getAttendance(month, year); // Assuming getAttendance takes month/year
      if (response.success) {
        setIndividualAttendance(response.data);
=======
      const response = await ApiService.getAttendance(month, year);
      console.log('📊 Individual Attendance Response:', response);
      if (response.success) {
        // The backend returns { success: true, data: attendance }
        // where attendance has a records array
        const attendance = response.data;
        const records = attendance?.records || [];
        console.log('📊 Individual Records:', records);
        console.log('📊 Records length:', records.length);
        if (records.length > 0) {
          console.log('📊 First record sample:', records[0]);
          console.log('📊 First record date type:', typeof records[0].date);
          console.log('📊 First record date value:', records[0].date);
        }
        setIndividualAttendance(records);
>>>>>>> 08d5d5a (attendance page maual push working)
      }
    } catch (error) {
      console.error('Error loading individual attendance:', error);
      setIndividualAttendance([]); // Reset on error
    }
  };

  const checkUserRole = async () => {
    try {
      const userData = await ApiService.getStoredUserData();
      if (userData && userData.role) {
        setUserRole(userData.role);
        setIsManagement(userData.role === 'management');
<<<<<<< HEAD
=======
        console.log('User Role:', userData.role, 'Is Management:', userData.role === 'management');
>>>>>>> 08d5d5a (attendance page maual push working)
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
<<<<<<< HEAD
    setSelectedCalendarDate(dateStr);
=======
>>>>>>> 08d5d5a (attendance page maual push working)
    setShowDayTypeModal(true);
  };

  const handleSetDayType = async (dayType) => {
    try {
      const dateStr = selectedCalendarDate;
      
<<<<<<< HEAD
      const dayData = {
=======
      const dayData = { // Ensure this matches backend expected format
>>>>>>> 08d5d5a (attendance page maual push working)
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
        
        // No need to manually call loadMarkedDays, the useEffect dependency handles it.
        const action = isAlreadyMarked ? 'updated' : 'set';
        Alert.alert('Success', `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} day ${action} successfully!`);
      }
    } catch (error) {
      console.error('Error setting day type:', error);
      Alert.alert('Error', 'Failed to set day type. Please try again.');
    } finally {
      setShowDayTypeModal(false);
      setSelectedCalendarDate(null); // Clear selected date
    }
  };

  // Helper to get individual attendance for a specific date
  // Ensure individualAttendance is an array before calling find
  const getIndividualStatusForDate = (dateStr) => {
    // Check if individualAttendance is an array and has data
    if (!Array.isArray(individualAttendance)) return null;

    // Convert item.date (Date object) to 'YYYY-MM-DD' string for comparison
    const record = individualAttendance.find(item => {
      if (item.date instanceof Date) {
        return item.date.toISOString().split('T')[0] === dateStr;
      }
      // Handle cases where item.date might not be a Date object (though it should be)
      return false;
    });

    if (record && record.status) {
      return record.status.toLowerCase(); 
    } else {
      // If no individual attendance, check management-defined type
      const managementType = markedDays[dateStr];
      if (managementType) {
        return managementType.toLowerCase();
    }
    }
    return null; // No status found

  };

  const getIndicatorText = (status) => {
    switch (status) {
      case 'present': return 'P';
      case 'absent': return 'A';
      case 'late': return 'L';
<<<<<<< HEAD
      // Fallback to management-defined types if no individual attendance
      case 'holiday': return 'H';
 case 'leave': return 'LE'; // Using 'LE' for Leave to distinguish from Late 'L'
=======
      case 'holiday': return 'H';
      case 'leave': return 'LE';
>>>>>>> 08d5d5a (attendance page maual push working)
      case 'working': return 'W';
      default: return '';
    }
  };

  // Helper to get the color for the status indicator (consolidated)
  const getIndicatorColor = (status) => {
    switch (status) {
<<<<<<< HEAD
 case 'present': return '#10b981'; // Green
=======
 case 'present': return '#3b82f6'; // Blue
>>>>>>> 08d5d5a (attendance page maual push working)
 case 'absent': return '#ef4444'; // Red
 case 'late': return '#f59e0b'; // Amber
 case 'holiday': return '#6b7280'; // Gray
 case 'leave': return '#8b5cf6'; // Purple for Leave
<<<<<<< HEAD
 case 'working': return '#10b981'; // Green (can be same as present)
=======
 case 'working': return '#10b981'; // Green
>>>>>>> 08d5d5a (attendance page maual push working)
 default: return '#d1d5db'; // Light gray for unknown
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
              <Text style={styles.statNumber}>{attendanceSummary.totalDays}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendanceSummary.presentDays}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendanceSummary.absentDays}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
 <View style={styles.statItem}>
 <Text style={styles.statNumber}>{attendanceSummary.lateDays}</Text>
 <Text style={styles.statLabel}>Late</Text>
 </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendanceSummary.holidayDays}</Text>
              <Text style={styles.statLabel}>Holiday</Text>
            </View>
 <View style={styles.statItem}>
 <Text style={styles.statNumber}>{attendanceSummary.leaveDays}</Text>
 <Text style={styles.statLabel}>Leave</Text>
 </View>
 <View style={styles.statItem}>
 <Text style={styles.statNumber}>{attendanceSummary.workingDays}</Text>
 <Text style={styles.statLabel}>Working</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendanceSummary.percentage}%</Text>
              <Text style={styles.statLabel}>Percentage</Text>
            </View>
          </View> 
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${attendanceSummary.percentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{attendanceSummary.percentage}%</Text>
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

<<<<<<< HEAD
        {/* Scan Attendance Button (Visible based on role) */}
        {isManagement && ( // Example: Only show for management role
          <TouchableOpacity
            style={styles.scanAttendanceButton}
            onPress={() => router.push('/(management)/scanAttendance')}
          >
            <UserCheck size={20} color="#ffffff" />
            <Text style={styles.scanAttendanceButtonText}>Scan Attendance</Text>
          </TouchableOpacity>
        )}


=======
        {/* Management Buttons (Visible based on role) */}
        {isManagement && (
          <TouchableOpacity
            style={[styles.scanAttendanceButton, { backgroundColor: '#8b5cf6', marginTop: 10 }]}
            onPress={() => router.push('/management-attendance')}
            activeOpacity={0.7}
          >
            <Users size={20} color="#ffffff" />
            <Text style={styles.scanAttendanceButtonText}>Mark All Users</Text>
          </TouchableOpacity>
        )}

>>>>>>> 08d5d5a (attendance page maual push working)
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
              
<<<<<<< HEAD
              // Check for individual attendance first
              // Convert item.date (Date object) to 'YYYY-MM-DD' string for comparison
              const individualRecord = Array.isArray(individualAttendance) ? individualAttendance.find(record => {
                if (record.date instanceof Date) {
                  return record.date.toISOString().split('T')[0] === dateStr;
                }
              }) : null;
              let displayStatus = individualRecord ? individualRecord.status.toLowerCase() : null;

              // If no individual attendance, check for management-defined marked day
              if (!displayStatus) {
                  displayStatus = markedDays[dateStr];
              }
              console.log('Date:', dateStr, 'Individual Record:', individualRecord, 'Display Status:', displayStatus);
=======
                             // Check for individual attendance first
               const individualRecord = Array.isArray(individualAttendance) ? individualAttendance.find(record => {
                 // console.log('🔍 Checking record:', record, 'for date:', dateStr);

                 // Convert calendar date string to Date object for comparison
                 const calendarDate = new Date(dateStr);
                 
                 // Handle different date formats from the backend
                 let recordDate = null;
                 
                 if (record.date instanceof Date) {
                   recordDate = record.date;
                 } else if (typeof record.date === 'string') {
                   recordDate = new Date(record.date);
                 } else if (record.date && typeof record.date === 'object' && record.date.$date) {
                   recordDate = new Date(record.date.$date);
                 }
                 
                 if (recordDate) {
                   // Compare dates using toDateString() to ignore time
                   const isMatch = recordDate.toDateString() === calendarDate.toDateString(); // compare date parts only
                   console.log('📅 Date comparison:', recordDate.toDateString(), '===', calendarDate.toDateString(), 'Match:', isMatch);
                   return isMatch;
                 }
                 
                 return false;
               }) : null;
               

               
               // console.log('📊 Found individual record for', dateStr, ':', individualRecord);
               
               let displayStatus = null;
               let isIndividualAttendance = false;
               
               if (individualRecord && individualRecord.status) {
                 displayStatus = individualRecord.status.toLowerCase();
                 isIndividualAttendance = true;
                 // console.log('✅ Using individual attendance:', displayStatus);
               } else {
                 // If no individual attendance, check for management-defined marked day
                 displayStatus = markedDays[dateStr];
                 isIndividualAttendance = false; // It's a management mark, not individual attendance
                 console.log('📋 Using management day type:', displayStatus);
               }
>>>>>>> 08d5d5a (attendance page maual push working)
              
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
                  {/* Display status indicator if a status is determined */}
                  {displayStatus && (
                    <View style={[styles.statusIndicator, { backgroundColor: getIndicatorColor(displayStatus) }]}>
                      <Text style={styles.statusText}>{getIndicatorText(displayStatus)}</Text>
                    </View>
                  )}
<<<<<<< HEAD
                  {/* Display 'Present' or 'Absent' text below day number */}
                  {individualRecord && (
                    <View>
                      {individualRecord.status === 'present' && (
                        <Text style={[styles.dayStatusText, { color: '#10b981' }]}>Present</Text>
                      )}
                      {individualRecord.status === 'absent' && (
                        <Text style={[styles.dayStatusText, { color: '#ef4444' }]}>Absent</Text>
                      )}
                    </View>
                  )}
=======
                                     {/* Display individual attendance status text */}
                   {isIndividualAttendance && displayStatus && (
                     <View style={styles.attendanceStatusContainer}>
                       {displayStatus === 'present' && (
                         <Text style={[styles.dayStatusText, { color: '#3b82f6' }]}>Present</Text>
                       )}
                       {displayStatus === 'absent' && (
                         <Text style={[styles.dayStatusText, { color: '#ef4444' }]}>Absent</Text>
                       )}
                       {displayStatus === 'working' && (
                         <Text style={[styles.dayStatusText, { color: '#6b7280' }]}>Working</Text>
                       )}
                     </View> // Fixed closing tag
                   )}
>>>>>>> 08d5d5a (attendance page maual push working)
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
<<<<<<< HEAD
              <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Working (W)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Holiday (H)</Text>
=======
              <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.legendText}>Present (P)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Absent (A)</Text>
>>>>>>> 08d5d5a (attendance page maual push working)
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Late (L)</Text>
            </View>
<<<<<<< HEAD
=======
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6b7280' }]} />
              <Text style={styles.legendText}>Holiday (H)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#8b5cf6' }]} />
              <Text style={styles.legendText}>Leave (LE)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Working (W)</Text>
            </View>
>>>>>>> 08d5d5a (attendance page maual push working)
          </View>
        </View>
      </ScrollView>

      {/* Day Type Selection Modal */}
      {showDayTypeModal && (
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
                  onPress={() => handleSetDayType('leave')} // Use purple for leave in modal button too?
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
      )}
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
<<<<<<< HEAD
=======
    flexWrap: 'wrap',
>>>>>>> 08d5d5a (attendance page maual push working)
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
  scanAttendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e40af', // A distinct color for the scan button
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 20, // Add some space below summary or notice
  },
  scanAttendanceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scanSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  scanLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  scanInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanInput: {
    flex: 1,
    height: 40,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#ffffff',
  },
<<<<<<< HEAD
=======
  attendanceStatusContainer: {
    marginTop: 2,
    alignItems: 'center',
  },
  dayStatusText: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
>>>>>>> 08d5d5a (attendance page maual push working)
});
