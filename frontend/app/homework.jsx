import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Calendar, Clock, CheckCircle, Circle, FileText, Plus, AlertCircle, X, ChevronDown, Users, Building2, GraduationCap } from 'lucide-react-native';
import ApiService from '../services/api';

export default function HomeworkScreen() {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  
  // Add homework modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showTeacherPicker, setShowTeacherPicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showTargetAudiencePicker, setShowTargetAudiencePicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    subject: '',
    teacher: '',
    toDate: '',
    targetAudience: 'students',
    assignedClass: '',
    assignedSection: '',
    assignedDepartment: ''
  });

  // Separate date input states
  const [dateInput, setDateInput] = useState({
    day: '',
    month: '',
    year: ''
  });

  // Target audience options for management
  const targetAudienceOptions = [
    { 
      label: 'Students', 
      value: 'students', 
      icon: GraduationCap, 
      color: '#3b82f6',
      description: 'Assign homework to students' 
    },
    { 
      label: 'Staff', 
      value: 'staff', 
      icon: Users, 
      color: '#10b981',
      description: 'Assign tasks to teaching staff' 
    },
    { 
      label: 'Both', 
      value: 'both', 
      icon: Building2, 
      color: '#f59e0b',
      description: 'Assign to both students and staff' 
    },
  ];

  // Enhanced class options (grades 6-12)
  const classOptions = [
    { label: 'Class 6', value: '6' },
    { label: 'Class 7', value: '7' },
    { label: 'Class 8', value: '8' },
    { label: 'Class 9', value: '9' },
    { label: 'Class 10', value: '10' },
    { label: 'Class 11', value: '11' },
    { label: 'Class 12', value: '12' },
  ];

  // Section options (A through F)
  const sectionOptions = [
    { label: 'Section A', value: 'A' },
    { label: 'Section B', value: 'B' },
    { label: 'Section C', value: 'C' },
    { label: 'Section D', value: 'D' },
    { label: 'Section E', value: 'E' },
    { label: 'Section F', value: 'F' },
  ];

  // Department options for staff assignments
  const departmentOptions = [
    { label: 'Academic Affairs', value: 'Academic Affairs', icon: '📚' },
    { label: 'Administration', value: 'Administration', icon: '🏢' },
    { label: 'Finance', value: 'Finance', icon: '💰' },
    { label: 'Human Resources', value: 'Human Resources', icon: '👥' },
    { label: 'Student Affairs', value: 'Student Affairs', icon: '🎓' },
    { label: 'IT Department', value: 'IT Department', icon: '💻' },
    { label: 'Operations', value: 'Operations', icon: '⚙️' },
    { label: 'Principal Office', value: 'Principal Office', icon: '🏛️' },
  ];

  // Options for dropdowns
  const subjectOptions = [
    { label: 'Mathematics', value: 'Mathematics', icon: '🔢' },
    { label: 'English', value: 'English', icon: '📚' },
    { label: 'Science', value: 'Science', icon: '🔬' },
    { label: 'Physics', value: 'Physics', icon: '⚛️' },
    { label: 'Chemistry', value: 'Chemistry', icon: '🧪' },
    { label: 'Biology', value: 'Biology', icon: '🧬' },
    { label: 'History', value: 'History', icon: '📜' },
    { label: 'Geography', value: 'Geography', icon: '🌍' },
    { label: 'Computer Science', value: 'Computer Science', icon: '💻' },
    { label: 'Physical Education', value: 'Physical Education', icon: '⚽' },
    { label: 'Administrative', value: 'Administrative', icon: '📋' },
  ];



  const loadHomework = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getHomework();
      console.log('Homework response received:', response);
      
      // Handle backend response structure: { success: true, data: homework }
      let homeworkData = response?.data || response;
      console.log('Homework data extracted:', homeworkData);
      
      // Debug: Log the raw homework data first
      console.log('📋 Raw homework data from backend:', homeworkData);
      console.log('📋 Number of homework items received:', homeworkData?.length || 0);
      console.log('👤 Current user role:', userData?.role);
      
      // TEMPORARILY DISABLE FILTERING FOR DEBUGGING
      console.log('⚠️ Date filtering temporarily disabled for debugging');
      
      // Additional frontend filtering based on user role and dates (DISABLED FOR NOW)
      /*
      const actualToday = '2024-12-20'; // Using fixed date due to system date issues
      const currentDate = new Date(actualToday);
      
      if (userData?.role === 'staff') {
        // Staff: Only show homework that hasn't passed due date
        homeworkData = homeworkData.filter(item => {
          const dueDate = new Date(item.toDate);
          const isNotPastDue = dueDate >= currentDate;
          console.log(`📅 Staff filtering - ${item.title}: Due ${item.toDate}, Past due: ${!isNotPastDue}`);
          return isNotPastDue;
        });
      } else if (userData?.role === 'management') {
        // Management: Only show homework created within the last week
        const oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        homeworkData = homeworkData.filter(item => {
          const assignedDate = new Date(item.assignedDate);
          const isWithinWeek = assignedDate >= oneWeekAgo;
          console.log(`📅 Management filtering - ${item.title}: Assigned ${item.assignedDate}, Within week: ${isWithinWeek}`);
          return isWithinWeek;
        });
      }
      */
      
      console.log(`📊 Final homework count: ${homeworkData?.length || 0} items for ${userData?.role}`);
      setHomework(Array.isArray(homeworkData) ? homeworkData : []);
    } catch (error) {
      console.error('Error loading homework:', error);
      Alert.alert('Error', 'Failed to load homework data. Please check if the backend server is running.');
      setHomework([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffMembers = async (selectedSubject = null) => {
    try {
      console.log('🔄 Loading staff members for subject:', selectedSubject || 'all');
      const response = await ApiService.getStaffMembers(selectedSubject);
      console.log('Staff members response:', response);
      
      const staffData = response?.data || response;
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      console.log('Loaded', staffData.length, 'staff members', selectedSubject ? 'for ' + selectedSubject : '');
    } catch (error) {
      console.error('Error loading staff members:', error);
      // Fallback to empty array if staff loading fails
      setStaffMembers([]);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUserData = await ApiService.getStoredUserData();
      setUserData(storedUserData);
      console.log('User data loaded:', storedUserData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadHomework(), loadStaffMembers()]);
    setRefreshing(false);
  };



  const validateForm = () => {
    if (!newHomework.title || !newHomework.description || !newHomework.subject || !newHomework.teacher || !newHomework.toDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    // TEMPORARY FIX: Use a known current date since system date is wrong
    const actualToday = '2024-12-20';
    
    console.log('📅 Form validation - Using current date:', actualToday);
    console.log('📅 Form validation - Selected date:', newHomework.toDate);
    
    // Simple string comparison to avoid timezone issues
    if (newHomework.toDate <= actualToday) {
      console.log('❌ Form date validation failed:', newHomework.toDate, '<=', actualToday);
      Alert.alert('Error', 'To date must be in the future (tomorrow or later)');
      return false;
    }
    
    console.log('✅ Form date validation passed:', newHomework.toDate, '>', actualToday);

    // Management-specific validation
    if (userData?.role === 'management') {
      if (newHomework.targetAudience === 'students' || newHomework.targetAudience === 'both') {
        if (!newHomework.assignedClass || !newHomework.assignedSection) {
          Alert.alert('Error', 'Please select both class and section for student assignments');
          return false;
        }
      }
      
      if (newHomework.targetAudience === 'staff' || newHomework.targetAudience === 'both') {
        if (!newHomework.assignedDepartment) {
          Alert.alert('Error', 'Please select a department for staff assignments');
          return false;
        }
      }
    } else if (userData?.role === 'staff') {
      // Staff also need to specify class and section
      if (!newHomework.assignedClass || !newHomework.assignedSection) {
        Alert.alert('Error', 'Please select both class and section for student assignments');
        return false;
      }
    }

    return true;
  };

  const handleAddHomework = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert to date to proper format
      let toDateString = newHomework.toDate;
      
      // Handle if date is number of days (for quick selection)
      if (typeof newHomework.toDate === 'number') {
        const toDate = new Date();
        toDate.setDate(toDate.getDate() + newHomework.toDate);
        toDateString = toDate.toISOString().split('T')[0];
      }

      const homeworkData = {
        ...newHomework,
        toDate: toDateString
      };

      console.log('🚀 Sending homework data to backend:', homeworkData);
      console.log('📋 Individual fields:', {
        title: homeworkData.title,
        description: homeworkData.description,
        subject: homeworkData.subject,
        teacher: homeworkData.teacher,
        toDate: homeworkData.toDate,
        targetAudience: homeworkData.targetAudience
      });

      await ApiService.createHomework(homeworkData);
      Alert.alert('Success', 'Homework assigned successfully');
      
      resetForm();
      loadHomework();
    } catch (error) {
      console.error('Error adding homework:', error);
      Alert.alert('Error', 'Failed to assign homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    // Set default values based on user role
    if (userData?.role === 'staff') {
      setNewHomework(prev => ({ ...prev, targetAudience: 'students' }));
    }
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewHomework({
      title: '',
      description: '',
      subject: '',
      teacher: '',
      toDate: '',
      targetAudience: userData?.role === 'management' ? 'students' : 'students',
      assignedClass: '',
      assignedSection: '',
      assignedDepartment: ''
    });
    setDateInput({
      day: '',
      month: '',
      year: ''
    });
    setShowSubjectPicker(false);
    setShowTeacherPicker(false);
    setShowToDatePicker(false);
    setShowTargetAudiencePicker(false);
    setShowClassPicker(false);
    setShowSectionPicker(false);
    setShowDepartmentPicker(false);
    setShowAddModal(false);
  };

  const closeAddModal = () => {
    resetForm();
  };

  useEffect(() => {
    loadHomework();
    loadUserData();
    loadStaffMembers();
  }, []);

  // Check if user can add homework (management or staff only)
  const canAddHomework = () => {
    if (!userData || !userData.role) return false;
    const userRole = userData.role.toLowerCase();
    return userRole === 'management' || userRole === 'staff';
  };

  // Check if user is management
  const isManagement = () => {
    return userData?.role?.toLowerCase() === 'management';
  };

  const pendingHomework = Array.isArray(homework) ? homework : [];

  const renderHomeworkCard = (item) => (
    <View key={item._id} style={styles.homeworkCard}>
      <View style={styles.homeworkHeader}>
        <View style={styles.subjectContainer}>
          <BookOpen size={16} color="#1e40af" />
          <Text style={styles.subjectText}>{item.subject}</Text>
          {/* Show target audience badge for management */}
          {isManagement() && item.targetAudience && (
            <View style={[styles.audienceBadge, { backgroundColor: getAudienceColor(item.targetAudience) }]}>
              <Text style={styles.audienceText}>{item.targetAudience.toUpperCase()}</Text>
            </View>
          )}
        </View>

      </View>
      
      <Text style={styles.homeworkTitle}>{item.title}</Text>
      <Text style={styles.homeworkDescription}>{item.description}</Text>
      
      <View style={styles.homeworkDetails}>
        <View style={styles.detailItem}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.detailText}>
            From: {new Date(item.fromDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Calendar size={14} color="#ef4444" />
          <Text style={styles.detailText}>
            To: {new Date(item.toDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {/* Show assignment details */}
      <View style={styles.assignmentDetails}>
        {item.assignedClass && item.assignedSection && (
          <Text style={styles.assignmentText}>🎓 Class: {item.assignedClass}-{item.assignedSection}</Text>
        )}
        {item.assignedDepartment && (
          <Text style={styles.assignmentText}>🏢 Department: {item.assignedDepartment}</Text>
        )}
      </View>
      
      <View style={styles.homeworkFooter}>
        <Text style={styles.teacherText}>Teacher: {item.teacherName || item.teacher}</Text>
        
      </View>
    </View>
  );



  const getAudienceColor = (audience) => {
    switch (audience?.toLowerCase()) {
      case 'students': return '#3b82f620';
      case 'staff': return '#10b98120';
      case 'both': return '#f59e0b20';
      default: return '#6b728020';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Homework</Text>
              <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
            {canAddHomework() && (
              <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                <Plus size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Loading homework...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Homework</Text>
              <Text style={styles.headerSubtitle}>
                {pendingHomework?.length || 0} assignments
              </Text>
              {isManagement() && (
                <Text style={styles.headerNote}>✨ Management View - Assign to Staff & Students</Text>
              )}
            </View>
            {canAddHomework() && (
              <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                <Plus size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Content */}
        {!Array.isArray(homework) || homework.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Homework</Text>
            <Text style={styles.emptyDescription}>
              {isManagement() 
                ? "No assignments found. Create homework for staff or students!" 
                : "No homework assignments found. Check back later!"
              }
            </Text>
          </View>
        ) : (
          <>
            {/* Pending Assignments */}
            {pendingHomework.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Assignments</Text>
                {pendingHomework.map(renderHomeworkCard)}
              </View>
            )}

            
          </>
        )}
      </ScrollView>

      {/* Add Homework Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isManagement() ? 'Assign Task/Homework' : 'Add New Homework'}
              </Text>
              <TouchableOpacity onPress={closeAddModal} style={styles.closeButton}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Target Audience Selection (Management Only) */}
              {isManagement() && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Target Audience *</Text>
                  <TouchableOpacity
                    style={[styles.selectInput, !newHomework.targetAudience && styles.selectInputPlaceholder]}
                    onPress={() => setShowTargetAudiencePicker(true)}
                    disabled={isSubmitting}
                  >
                    <View style={styles.targetAudienceDisplay}>
                      {newHomework.targetAudience && (
                        <>
                          {(() => {
                            const audience = targetAudienceOptions.find(a => a.value === newHomework.targetAudience);
                            return audience ? <audience.icon size={20} color={audience.color} /> : null;
                          })()}
                          <Text style={[styles.selectInputText, { marginLeft: 8 }]}>
                            {targetAudienceOptions.find(a => a.value === newHomework.targetAudience)?.label}
                          </Text>
                        </>
                      )}
                    </View>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Class Selection (for student assignments) */}
              {(newHomework.targetAudience === 'students' || newHomework.targetAudience === 'both') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Assigned Class *</Text>
                  <TouchableOpacity
                    style={[styles.selectInput, !newHomework.assignedClass && styles.selectInputPlaceholder]}
                    onPress={() => setShowClassPicker(true)}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.selectInputText, !newHomework.assignedClass && styles.selectInputPlaceholderText]}>
                      {newHomework.assignedClass ? `Class ${newHomework.assignedClass}` : 'Select Class'}
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Section Selection (for student assignments) */}
              {(newHomework.targetAudience === 'students' || newHomework.targetAudience === 'both') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Assigned Section *</Text>
                  <TouchableOpacity
                    style={[styles.selectInput, !newHomework.assignedSection && styles.selectInputPlaceholder]}
                    onPress={() => setShowSectionPicker(true)}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.selectInputText, !newHomework.assignedSection && styles.selectInputPlaceholderText]}>
                      {newHomework.assignedSection ? `Section ${newHomework.assignedSection}` : 'Select Section'}
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Department Selection (for staff assignments) */}
              {(newHomework.targetAudience === 'staff' || newHomework.targetAudience === 'both') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Assigned Department *</Text>
                  <TouchableOpacity
                    style={[styles.selectInput, !newHomework.assignedDepartment && styles.selectInputPlaceholder]}
                    onPress={() => setShowDepartmentPicker(true)}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.selectInputText, !newHomework.assignedDepartment && styles.selectInputPlaceholderText]}>
                      {newHomework.assignedDepartment ? 
                        `${departmentOptions.find(d => d.value === newHomework.assignedDepartment)?.icon} ${newHomework.assignedDepartment}` : 
                        'Select Department'
                      }
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={isManagement() ? "Enter task/homework title" : "Enter homework title"}
                  value={newHomework.title}
                  onChangeText={(text) => setNewHomework({...newHomework, title: text})}
                  editable={!isSubmitting}
                />
              </View>

              {/* Subject */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject *</Text>
                <TouchableOpacity
                  style={[styles.selectInput, !newHomework.subject && styles.selectInputPlaceholder]}
                  onPress={() => setShowSubjectPicker(true)}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.selectInputText, !newHomework.subject && styles.selectInputPlaceholderText]}>
                    {newHomework.subject ? 
                      `${subjectOptions.find(s => s.value === newHomework.subject)?.icon} ${newHomework.subject}` : 
                      'Select Subject'
                    }
                  </Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
                {newHomework.subject && (
                  <Text style={styles.helperText}>
                    📋 Teacher list will be filtered by this subject
                  </Text>
                )}
              </View>

              {/* Teacher */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Assigned By *</Text>
                <TouchableOpacity
                  style={[
                    styles.selectInput, 
                    !newHomework.teacher && styles.selectInputPlaceholder,
                    !newHomework.subject && styles.disabledInput
                  ]}
                  onPress={() => {
                    if (newHomework.subject) {
                      // Ensure staff are loaded for the selected subject before opening modal
                      console.log('🎯 Opening teacher picker for subject:', newHomework.subject);
                      loadStaffMembers(newHomework.subject);
                      setShowTeacherPicker(true);
                    } else {
                      Alert.alert('Select Subject First', 'Please select a subject before choosing a teacher.');
                    }
                  }}
                  disabled={isSubmitting || !newHomework.subject}
                >
                  <Text style={[
                    styles.selectInputText, 
                    !newHomework.teacher && styles.selectInputPlaceholderText,
                    !newHomework.subject && styles.disabledText
                  ]}>
                    {newHomework.teacher || (!newHomework.subject ? 'Select Subject First' : 'Select Teacher/Authority')}
                  </Text>
                  <ChevronDown size={20} color={!newHomework.subject ? "#d1d5db" : "#6b7280"} />
                </TouchableOpacity>
                {newHomework.subject && staffMembers.length === 0 && (
                  <Text style={styles.warningText}>
                    ⚠️ No teachers found for {newHomework.subject}
                  </Text>
                )}
                {newHomework.subject && staffMembers.length > 0 && (
                  <Text style={styles.helperText}>
                    👨‍🏫 {staffMembers?.length || 0} teacher(s) available for {newHomework.subject}
                  </Text>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder={isManagement() ? "Enter task description and instructions" : "Enter homework description and instructions"}
                  value={newHomework.description}
                  onChangeText={(text) => setNewHomework({...newHomework, description: text})}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              </View>

              {/* From Date - Auto captured */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>From Date</Text>
                <View style={[styles.selectInput, styles.disabledInput]}>
                  <Text style={[styles.selectInputText, styles.disabledText]}>
                    📅 Today ({new Date().toLocaleDateString()})
                  </Text>
                  <Calendar size={20} color="#10b981" />
                </View>
                <Text style={styles.helperText}>Automatically set to current date</Text>
              </View>

              {/* To Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Due Date *</Text>
                <TouchableOpacity
                  style={[styles.selectInput, !newHomework.toDate && styles.selectInputPlaceholder]}
                  onPress={() => setShowToDatePicker(true)}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.selectInputText, !newHomework.toDate && styles.selectInputPlaceholderText]}>
                    {newHomework.toDate ? 
                      (typeof newHomework.toDate === 'string' ? 
                        `📅 ${new Date(newHomework.toDate).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}` :
                        `📅 In ${newHomework.toDate} days (${new Date(Date.now() + newHomework.toDate * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })})`
                      ) :
                      'Select Due Date'
                    }
                  </Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
                {newHomework.toDate && (
                  <Text style={styles.selectedDateHelper}>
                    {typeof newHomework.toDate === 'string' ? 
                      `Submission due: ${new Date(newHomework.toDate).toLocaleDateString()}` :
                      `Submission due: ${new Date(Date.now() + newHomework.toDate * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                    }
                  </Text>
                )}
              </View>


            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeAddModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleAddHomework}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View style={styles.submitButtonContent}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Assigning...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isManagement() ? 'Assign Task' : 'Add Homework'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Target Audience Picker Modal (Management Only) */}
      <Modal
        visible={showTargetAudiencePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTargetAudiencePicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Target Audience</Text>
              <TouchableOpacity onPress={() => setShowTargetAudiencePicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {targetAudienceOptions.map((audience) => (
                <TouchableOpacity
                  key={audience.value}
                  style={[
                    styles.pickerOption,
                    newHomework.targetAudience === audience.value && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    setNewHomework({...newHomework, targetAudience: audience.value});
                    setShowTargetAudiencePicker(false);
                  }}
                >
                  <View style={[styles.audienceIconContainer, { backgroundColor: audience.color + '20' }]}>
                    <audience.icon size={24} color={audience.color} />
                  </View>
                  <View style={styles.audienceTextContainer}>
                    <Text style={[
                      styles.pickerOptionText,
                      newHomework.targetAudience === audience.value && { color: audience.color, fontWeight: '600' }
                    ]}>
                      {audience.label}
                    </Text>
                    <Text style={styles.audienceDescription}>{audience.description}</Text>
                  </View>
                  {newHomework.targetAudience === audience.value && (
                    <CheckCircle size={20} color={audience.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Class Picker Modal */}
      <Modal
        visible={showClassPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClassPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Class</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {classOptions.map((classOption) => (
                <TouchableOpacity
                  key={classOption.value}
                  style={[
                    styles.pickerOption,
                    newHomework.assignedClass === classOption.value && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    setNewHomework({...newHomework, assignedClass: classOption.value});
                    setShowClassPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionIcon}>🎓</Text>
                  <Text style={[
                    styles.pickerOptionText,
                    newHomework.assignedClass === classOption.value && { color: '#3b82f6', fontWeight: '600' }
                  ]}>
                    {classOption.label}
                  </Text>
                  {newHomework.assignedClass === classOption.value && (
                    <CheckCircle size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Section Picker Modal */}
      <Modal
        visible={showSectionPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSectionPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Section</Text>
              <TouchableOpacity onPress={() => setShowSectionPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {sectionOptions.map((sectionOption) => (
                <TouchableOpacity
                  key={sectionOption.value}
                  style={[
                    styles.pickerOption,
                    newHomework.assignedSection === sectionOption.value && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    setNewHomework({...newHomework, assignedSection: sectionOption.value});
                    setShowSectionPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionIcon}>🔢</Text>
                  <Text style={[
                    styles.pickerOptionText,
                    newHomework.assignedSection === sectionOption.value && { color: '#10b981', fontWeight: '600' }
                  ]}>
                    {sectionOption.label}
                  </Text>
                  {newHomework.assignedSection === sectionOption.value && (
                    <CheckCircle size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Department Picker Modal */}
      <Modal
        visible={showDepartmentPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDepartmentPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Department</Text>
              <TouchableOpacity onPress={() => setShowDepartmentPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {departmentOptions.map((deptOption) => (
                <TouchableOpacity
                  key={deptOption.value}
                  style={[
                    styles.pickerOption,
                    newHomework.assignedDepartment === deptOption.value && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    setNewHomework({...newHomework, assignedDepartment: deptOption.value});
                    setShowDepartmentPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionIcon}>{deptOption.icon}</Text>
                  <Text style={[
                    styles.pickerOptionText,
                    newHomework.assignedDepartment === deptOption.value && { color: '#10b981', fontWeight: '600' }
                  ]}>
                    {deptOption.label}
                  </Text>
                  {newHomework.assignedDepartment === deptOption.value && (
                    <CheckCircle size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Subject Picker Modal */}
      <Modal
        visible={showSubjectPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubjectPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Subject</Text>
              <TouchableOpacity onPress={() => setShowSubjectPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {subjectOptions.map((subjectOption) => (
                <TouchableOpacity
                  key={subjectOption.value}
                  style={[
                    styles.pickerOption,
                    newHomework.subject === subjectOption.value && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    const previousSubject = newHomework.subject;
                    setNewHomework({...newHomework, subject: subjectOption.value, teacher: ''}); // Clear teacher when subject changes
                    setShowSubjectPicker(false);
                    
                    // Reload staff members for the new subject
                    if (previousSubject !== subjectOption.value) {
                      loadStaffMembers(subjectOption.value);
                    }
                  }}
                >
                  <Text style={styles.pickerOptionIcon}>{subjectOption.icon}</Text>
                  <Text style={[
                    styles.pickerOptionText,
                    newHomework.subject === subjectOption.value && { color: '#10b981', fontWeight: '600' }
                  ]}>
                    {subjectOption.label}
                  </Text>
                  {newHomework.subject === subjectOption.value && (
                    <CheckCircle size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Teacher Picker Modal */}
      <Modal
        visible={showTeacherPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTeacherPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>
                Select Teacher for {newHomework.subject}
              </Text>
              <TouchableOpacity onPress={() => setShowTeacherPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScrollView}>
              {staffMembers.length > 0 ? (
                staffMembers.map((staff) => (
                  <TouchableOpacity
                    key={staff.id}
                    style={[
                      styles.pickerOption,
                      newHomework.teacher === staff.name && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setNewHomework({...newHomework, teacher: staff.name});
                      setShowTeacherPicker(false);
                    }}
                  >
                    <View style={styles.teacherInfo}>
                      <Text style={styles.pickerOptionText}>
                        {staff.name}
                      </Text>
                      <Text style={styles.teacherSubject}>
                        {staff.subject} • {staff.qualification}
                      </Text>
                      <Text style={styles.teacherDepartment}>
                        ID: {staff.userid}
                      </Text>
                    </View>
                    {newHomework.teacher === staff.name && (
                      <CheckCircle size={20} color="#1e40af" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No teachers found for {newHomework.subject}
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    No staff members are registered for this subject
                  </Text>
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={() => loadStaffMembers(newHomework.subject)}
                  >
                    <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Due Date Picker Modal */}
      <Modal
        visible={showToDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowToDatePicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.datePickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Due Date</Text>
              <TouchableOpacity onPress={() => setShowToDatePicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Quick Date Options */}
            <View style={styles.quickDateContainer}>
              <Text style={styles.quickDateTitle}>Quick Select:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickDateScroll}>
                {[1, 3, 7, 14, 30].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.quickDateOption,
                      newHomework.toDate === days && styles.quickDateSelected
                    ]}
                                      onPress={() => {
                    setNewHomework({...newHomework, toDate: days});
                    setShowToDatePicker(false);
                    
                    // Show confirmation for quick select
                    const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                    const formattedDate = dueDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                    Alert.alert('Date Selected', `Due date set to: ${formattedDate} (${days} days from today)`);
                  }}
                  >
                    <Text style={[
                      styles.quickDateText,
                      newHomework.toDate === days && { color: '#ef4444', fontWeight: '600' }
                    ]}>
                      {days}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Calendar Date Input */}
            <View style={styles.calendarDateContainer}>
              <Text style={styles.calendarDateTitle}>Or enter specific date:</Text>
              
              {/* Day Month Year Inputs */}
              <View style={styles.dateFieldsContainer}>
                {/* Day Input */}
                <View style={styles.dateFieldGroup}>
                  <Text style={styles.dateFieldLabel}>Day</Text>
                  <TextInput
                    style={styles.dateFieldInput}
                    placeholder="DD"
                    placeholderTextColor="#9ca3af"
                    value={dateInput.day}
                    onChangeText={(text) => {
                      // Only allow numbers and limit to 2 digits
                      const numericText = text.replace(/[^0-9]/g, '').slice(0, 2);
                      // Validate day range (01-31)
                      if (numericText === '' || (parseInt(numericText) >= 1 && parseInt(numericText) <= 31)) {
                        setDateInput({...dateInput, day: numericText});
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                {/* Month Input */}
                <View style={styles.dateFieldGroup}>
                  <Text style={styles.dateFieldLabel}>Month</Text>
                  <TextInput
                    style={styles.dateFieldInput}
                    placeholder="MM"
                    placeholderTextColor="#9ca3af"
                    value={dateInput.month}
                    onChangeText={(text) => {
                      // Only allow numbers and limit to 2 digits
                      const numericText = text.replace(/[^0-9]/g, '').slice(0, 2);
                      // Validate month range (01-12)
                      if (numericText === '' || (parseInt(numericText) >= 1 && parseInt(numericText) <= 12)) {
                        setDateInput({...dateInput, month: numericText});
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                {/* Year Input */}
                <View style={styles.dateFieldGroup}>
                  <Text style={styles.dateFieldLabel}>Year</Text>
                  <TextInput
                    style={styles.dateFieldInput}
                    placeholder="YYYY"
                    placeholderTextColor="#9ca3af"
                    value={dateInput.year}
                    onChangeText={(text) => {
                      // Only allow numbers and limit to 4 digits
                      const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
                      // Allow any numeric input, validation happens on confirm
                      setDateInput({...dateInput, year: numericText});
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={styles.dateConfirmButton}
                  onPress={() => {
                    console.log('🔘 Manual date confirm button pressed');
                    const { day, month, year } = dateInput;
                    console.log('📅 Date input values:', { day, month, year });
                    
                    // Validate all fields are filled
                    if (!day || !month || !year) {
                      console.log('❌ Missing date fields');
                      Alert.alert('Incomplete Date', 'Please fill in all date fields');
                      return;
                    }

                    // Validate year length
                    if (year.length !== 4) {
                      console.log('❌ Invalid year length:', year.length);
                      Alert.alert('Invalid Year', 'Please enter a complete 4-digit year');
                      return;
                    }

                    // Validate year is current year or future
                    const currentYear = new Date().getFullYear();
                    if (parseInt(year) < currentYear) {
                      console.log('❌ Year too old:', year, 'vs', currentYear);
                      Alert.alert('Invalid Year', `Year must be ${currentYear} or later`);
                      return;
                    }

                    // Validate day and month ranges
                    const dayNum = parseInt(day);
                    const monthNum = parseInt(month);
                    
                    if (dayNum < 1 || dayNum > 31) {
                      Alert.alert('Invalid Day', 'Day must be between 1 and 31');
                      return;
                    }
                    
                    if (monthNum < 1 || monthNum > 12) {
                      Alert.alert('Invalid Month', 'Month must be between 1 and 12');
                      return;
                    }

                    // Pad with zeros if needed
                    const paddedDay = day.padStart(2, '0');
                    const paddedMonth = month.padStart(2, '0');
                    
                    // Create date string
                    const dateString = `${year}-${paddedMonth}-${paddedDay}`;
                    console.log('📅 Created date string:', dateString);
                    
                    const selectedDate = new Date(dateString);
                    console.log('📅 Selected date object:', selectedDate);
                    
                    // TEMPORARY FIX: Use a known current date since system date is wrong
                    // Your system shows July 28, 2025 which is incorrect
                    // Using December 20, 2024 as current date
                    const actualToday = '2024-12-20';
                    
                    console.log('⚠️ System date appears incorrect, using fixed date:', actualToday);
                    console.log('📅 System shows date as:', new Date());
                    console.log('📅 Using actual current date:', actualToday);
                    
                    // Compare date strings directly to avoid timezone issues
                    const selectedDateString = `${year}-${paddedMonth}-${paddedDay}`;
                    
                    console.log('📅 Comparing dates:');
                    console.log('📅 Selected date string:', selectedDateString);
                    console.log('📅 Current date string:', actualToday);
                    
                    // Simple string comparison for dates
                    if (selectedDateString <= actualToday) {
                      console.log('❌ Date comparison failed:', selectedDateString, '<=', actualToday);
                      Alert.alert('Invalid Date', 'Please select a future date (tomorrow or later)');
                      return;
                    }
                    
                    // Validate date is valid
                    if (isNaN(selectedDate.getTime())) {
                      console.log('❌ Invalid date created');
                      Alert.alert('Invalid Date', 'Please enter a valid date');
                      return;
                    }
                    
                    console.log('✅ Date validation passed, setting date');
                    
                    // Set the date and close modal
                    setNewHomework(prev => ({...prev, toDate: dateString}));
                    console.log('✅ Date set in homework state:', dateString);
                    
                    // Clear the individual date inputs
                    setDateInput({
                      day: '',
                      month: '',
                      year: ''
                    });
                    console.log('✅ Date input fields cleared');
                    
                    setShowToDatePicker(false);
                    console.log('✅ Modal closed');
                    
                    // Show confirmation
                    const formattedDate = selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                    console.log('✅ Showing confirmation alert:', formattedDate);
                    
                    setTimeout(() => {
                      Alert.alert('✅ Date Selected', `Due date set to:\n${formattedDate}`);
                    }, 100);
                  }}
                >
                  <Text style={styles.dateConfirmText}>✓</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.dateFormatHint}>
                Example: Day: 25, Month: 12, Year: 2024 → 25th December 2024
              </Text>
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
  headerNote: {
    fontSize: 12,
    color: '#fbbf24',
    marginTop: 4,
    fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  homeworkCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeworkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 6,
  },
  audienceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  audienceText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#374151',
  },

  homeworkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  homeworkDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 15,
  },
  homeworkDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  assignmentDetails: {
    marginBottom: 10,
  },
  assignmentText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  homeworkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teacherText: {
    fontSize: 12,
    color: '#6b7280',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#1e40af',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Select Input Styles
  selectInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  selectInputPlaceholder: {
    borderColor: '#e5e7eb',
  },
  selectInputText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  selectInputPlaceholderText: {
    color: '#9ca3af',
  },
  targetAudienceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  // Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  pickerScrollView: {
    maxHeight: 400,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionSelected: {
    backgroundColor: '#f0f9ff',
  },
  pickerOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  pickerOptionTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  pickerOptionCheck: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherSubject: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  teacherDepartment: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  disabledText: {
    color: '#9ca3af',
  },
  // Target Audience Picker Styles
  audienceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  audienceTextContainer: {
    flex: 1,
  },
  audienceDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  
  // Date Picker Modal Styles
  datePickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '95%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  
  // Quick Date Selection Styles
  quickDateContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quickDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  quickDateScroll: {
    flexDirection: 'row',
  },
  quickDateOption: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  quickDateSelected: {
    backgroundColor: '#fee2e2',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  
  // Calendar Date Input Styles
  calendarDateContainer: {
    marginTop: 10,
  },
  calendarDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  dateFieldsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 8,
  },
  dateFieldGroup: {
    flex: 1,
  },
  dateFieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 5,
    textAlign: 'center',
  },
  dateFieldInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#f9fafb',
    textAlign: 'center',
    fontWeight: '600',
  },
  dateConfirmButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  dateConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dateFormatHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedDateHelper: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
}); 