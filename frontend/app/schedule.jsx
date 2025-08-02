import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput, Image, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Calendar, Clock, CheckCircle, Circle, FileText, Plus, AlertCircle, X, ChevronDown, Users, Building2, GraduationCap, Star, TrendingUp, Award, Bookmark, Search, Paperclip, File, Image as ImageIcon, Trash2, Download, ChevronLeft, CalendarDays } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ApiService from '../services/api';
import { router } from 'expo-router';

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Add schedule modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScheduleTypePicker, setShowScheduleTypePicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showStudyHoursPicker, setShowStudyHoursPicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showTargetAudiencePicker, setShowTargetAudiencePicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  
  // Calendar and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    scheduleType: '',
    subject: '',
    studyHours: '',
    toDate: '',
    targetAudience: 'students',
    assignedClass: '',
    assignedSection: '',
    assignedDepartment: '',
    attachments: []
  });

  // Separate date input states
  const [dateInput, setDateInput] = useState({
    day: '',
    month: '',
    year: ''
  });

  // Target audience options with access control
  const getTargetAudienceOptions = () => {
    const allOptions = [
      { 
        label: 'Students', 
        value: 'students', 
        icon: GraduationCap, 
        color: '#3b82f6',
        description: 'Schedule for students',
        allowedFor: ['staff', 'management']
      },
      { 
        label: 'Staff', 
        value: 'staff', 
        icon: Users, 
        color: '#10b981',
        description: 'Schedule for teaching staff',
        allowedFor: ['management']
      },
      { 
        label: 'Both', 
        value: 'both', 
        icon: Building2, 
        color: '#f59e0b',
        description: 'Schedule for both students and staff',
        allowedFor: ['management']
      },
    ];

    // Filter options based on user role
    if (!userData?.role) return allOptions;
    
    return allOptions.filter(option => 
      option.allowedFor.includes(userData.role)
    );
  };

  const targetAudienceOptions = getTargetAudienceOptions();

  // Schedule type options
  const scheduleTypeOptions = [
    { label: 'Study Schedule', value: 'study' },
    { label: 'Exam Schedule', value: 'exam' },
    { label: 'Revision Schedule', value: 'revision' },
    { label: 'Assignment Schedule', value: 'assignment' },
    { label: 'Project Schedule', value: 'project' },
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

  // Subject options
  const subjectOptions = [
    { label: 'Mathematics', value: 'Mathematics' },
    { label: 'English', value: 'English' },
    { label: 'Science', value: 'Science' },
    { label: 'Social Studies', value: 'Social Studies' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'Computer Science', value: 'Computer Science' },
    { label: 'Physics', value: 'Physics' },
    { label: 'Chemistry', value: 'Chemistry' },
    { label: 'Biology', value: 'Biology' },
    { label: 'Economics', value: 'Economics' },
    { label: 'History', value: 'History' },
    { label: 'Geography', value: 'Geography' },
  ];

  // Study hours options
  const studyHoursOptions = [
    { label: '30 minutes daily', value: '30 minutes daily' },
    { label: '1 hour daily', value: '1 hour daily' },
    { label: '1.5 hours daily', value: '1.5 hours daily' },
    { label: '2 hours daily', value: '2 hours daily' },
    { label: '3 hours daily', value: '3 hours daily' },
    { label: '2 hours weekly', value: '2 hours weekly' },
    { label: '3 hours weekly', value: '3 hours weekly' },
    { label: '4 hours weekly', value: '4 hours weekly' },
    { label: '5 hours weekly', value: '5 hours weekly' },
  ];

  useEffect(() => {
    loadSchedules();
    loadUserData();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getSchedules();
      
      if (response.success) {
        setSchedules(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load schedules');
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUserData = await ApiService.getStoredUserData();
      setUserData(storedUserData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  };

  const validateForm = () => {
    if (!newSchedule.title.trim()) {
      Alert.alert('Error', 'Please enter a schedule title');
      return false;
    }
    if (!newSchedule.description.trim()) {
      Alert.alert('Error', 'Please enter a schedule description');
      return false;
    }
    if (!newSchedule.scheduleType) {
      Alert.alert('Error', 'Please select a schedule type');
      return false;
    }
    if (!newSchedule.subject) {
      Alert.alert('Error', 'Please select a subject');
      return false;
    }
    if (!newSchedule.studyHours) {
      Alert.alert('Error', 'Please select study hours');
      return false;
    }
    if (!newSchedule.toDate) {
      Alert.alert('Error', 'Please select a due date');
      return false;
    }
    if (!newSchedule.targetAudience) {
      Alert.alert('Error', 'Please select target audience');
      return false;
    }
    
    // Validate target audience specific fields
    if ((newSchedule.targetAudience === 'students' || newSchedule.targetAudience === 'both') && 
        (!newSchedule.assignedClass || !newSchedule.assignedSection)) {
      Alert.alert('Error', 'Please select class and section for student schedules');
      return false;
    }
    
    if ((newSchedule.targetAudience === 'staff' || newSchedule.targetAudience === 'both') && 
        !newSchedule.assignedDepartment) {
      Alert.alert('Error', 'Please enter department for staff schedules');
      return false;
    }
    
    return true;
  };

  const handleAddSchedule = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(newSchedule.toDate)) {
        Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
        return;
      }
      
      const scheduleData = {
        ...newSchedule,
        toDate: newSchedule.toDate
      };
      
      console.log('Sending schedule data:', scheduleData);
      
      const response = await ApiService.createSchedule(scheduleData);
      
      if (response.success) {
        setSchedules(prev => [response.data, ...prev]);
        setShowAddModal(false);
        resetForm();
        Alert.alert('Success', 'Schedule added successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to add schedule');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      Alert.alert('Error', 'Failed to add schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    resetForm();
  };

  const resetForm = () => {
    setNewSchedule({
      title: '',
      description: '',
      scheduleType: '',
      subject: '',
      studyHours: '',
      toDate: '',
      targetAudience: 'students',
      assignedClass: '',
      assignedSection: '',
      assignedDepartment: '',
      attachments: []
    });
    setDateInput({
      day: '',
      month: '',
      year: ''
    });
  };

<<<<<<< HEAD
  // Attachment handling functions
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 2MB.');
          return;
        }

        const attachment = {
          name: file.name,
          uri: file.uri,
          size: file.size,
          type: 'document',
          mimeType: file.mimeType,
        };

        setNewSchedule(prev => ({
          ...prev,
          attachments: [...prev.attachments, attachment]
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (2MB limit)
        if (file.fileSize > 2 * 1024 * 1024) {
          Alert.alert('Image Too Large', 'Please select an image smaller than 2MB.');
          return;
        }

        const attachment = {
          name: `image_${Date.now()}.jpg`,
          uri: file.uri,
          size: file.fileSize,
          type: 'image',
          mimeType: 'image/jpeg',
        };

        setNewSchedule(prev => ({
          ...prev,
          attachments: [...prev.attachments, attachment]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeAttachment = (index) => {
    setNewSchedule(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const downloadAttachment = async (attachment) => {
    try {
      Alert.alert('Downloading', 'Please wait while we download your file...');
      
      if (Platform.OS === 'web') {
        // For web platform, open the file in a new tab or trigger download
        const link = document.createElement('a');
        link.href = attachment.uri;
        link.download = attachment.name || `attachment_${Date.now()}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.alert('Download Complete', `File "${attachment.name}" download has been initiated.`);
      } else {
        // For mobile platforms, use expo-file-system and expo-sharing
        const fileName = attachment.name || `attachment_${Date.now()}`;
        const fileExtension = attachment.mimeType ? attachment.mimeType.split('/')[1] : 'pdf';
        const fileUri = `${FileSystem.documentDirectory}${fileName}.${fileExtension}`;
        
        const downloadResult = await FileSystem.downloadAsync(
          attachment.uri,
          fileUri
        );
        
        if (downloadResult.status === 200) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: attachment.mimeType || 'application/octet-stream',
              dialogTitle: `Download ${attachment.name}`,
              UTI: 'public.item'
            });
          } else {
            Alert.alert('Download Complete', `File "${attachment.name}" has been saved to your device.`);
          }
        } else {
          Alert.alert('Download Failed', 'Failed to download the file. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      Alert.alert('Error', 'Failed to download attachment');
    }
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
    setIsSubmitting(false);
  };

  const canAddSchedule = () => {
    return userData?.role === 'management' || userData?.role === 'staff';
  };

    const getAccessControlInfo = () => {
    if (!userData?.role) return '';

    switch (userData.role) {
      case 'staff':
        return 'You can assign schedules to students only';
      case 'management':
        return 'You can assign schedules to anyone';
      default:
        return 'You cannot create schedules';
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  // Filter schedules based on search query and selected date
  const filteredSchedules = schedules.filter(item => {
    const scheduleDate = new Date(item.toDate);
    
    // Filter by selected date if calendar is not showing
    if (!showCalendar && !isSameDay(scheduleDate, selectedDate)) {
      return false;
    }
    
    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        (item.teacher && item.teacher.toLowerCase().includes(query)) ||
        (item.createdBy?.name && item.createdBy.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const getAudienceColor = (audience) => {
    switch (audience) {
      case 'students': return '#3b82f6';
      case 'staff': return '#10b981';
      case 'both': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getScheduleTypeColor = (type) => {
    switch (type) {
      case 'meal': return '#ef4444';
      case 'study': return '#3b82f6';
      case 'activity': return '#10b981';
      case 'maintenance': return '#f59e0b';
      case 'event': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const renderScheduleCard = (item) => (
    <View key={item.id} style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleTitleRow}>
          <View style={styles.scheduleTypeBadge}>
            <Text style={[styles.scheduleTypeText, { color: getScheduleTypeColor(item.scheduleType) }]}>
              {item.scheduleType.toUpperCase()}
            </Text>
          </View>
          <View style={styles.scheduleDate}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.scheduleDateText}>
              {new Date(item.toDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.scheduleTitleSection}>
          <Text style={styles.scheduleTitle}>{item.title}</Text>
          <View style={styles.audienceBadge}>
            <Text style={[styles.audienceText, { color: getAudienceColor(item.targetAudience) }]}>
              {item.targetAudience.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.scheduleContent}>
        <Text style={styles.scheduleDescription}>{item.description}</Text>
        
                 <View style={styles.scheduleDetails}>
           <View style={styles.detailItem}>
             <Users size={16} color="#6b7280" />
             <Text style={styles.detailText}>{item.teacher}</Text>
           </View>
           
           {item.subject && (
             <View style={styles.detailItem}>
               <BookOpen size={16} color="#6b7280" />
               <Text style={styles.detailText}>{item.subject}</Text>
             </View>
           )}
           
           {item.studyHours && (
             <View style={styles.detailItem}>
               <Clock size={16} color="#6b7280" />
               <Text style={styles.detailText}>{item.studyHours}</Text>
             </View>
           )}
           
           {item.assignedClass && (
             <View style={styles.detailItem}>
               <GraduationCap size={16} color="#6b7280" />
               <Text style={styles.detailText}>
                 Class {item.assignedClass}{item.assignedSection ? ` - Section ${item.assignedSection}` : ''}
               </Text>
             </View>
           )}
         </View>

        {item.attachments && item.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={styles.attachmentsTitle}>Attachments:</Text>
<<<<<<< HEAD
            <View style={styles.attachmentsContainer}>
              {item.attachments.map((attachment, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.attachmentCard}
                  onPress={() => downloadAttachment(attachment)}
                >
                  <LinearGradient
                    colors={['#f8fafc', '#e2e8f0']}
                    style={styles.attachmentCardGradient}
                  >
                    {attachment.type === 'image' ? (
                      <Image source={{ uri: attachment.uri }} style={styles.attachmentThumbnail} />
                    ) : (
                      <View style={styles.attachmentDocument}>
                        <File size={20} color="#667eea" />
                      </View>
                    )}
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.attachmentSize}>
                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </View>
                    <Download size={16} color="#3b82f6" />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
=======
            {item.attachments.map((attachment, index) => (
              <TouchableOpacity key={index} style={styles.attachmentItem}>
                <FileText size={16} color="#3b82f6" />
                <Text style={styles.attachmentText}>{attachment.name}</Text>
              </TouchableOpacity>
            ))}
>>>>>>> origin/main
          </View>
        )}
      </View>

      <View style={styles.scheduleFooter}>
        <View style={styles.scheduleMeta}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.scheduleMetaText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Loading schedules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
                         <View style={styles.headerInfo}>
               <Text style={styles.headerTitle}>Study Schedule</Text>
               <Text style={styles.headerSubtitle}>Manage student study schedules and assignments</Text>
             </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.calendarButton} onPress={() => setShowCalendar(!showCalendar)}>
                <Calendar size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchButton} onPress={() => setShowSearch(!showSearch)}>
                <Search size={20} color="#ffffff" />
              </TouchableOpacity>
              {canAddSchedule() && (
                <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                  <Plus size={20} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Calendar Overlay */}
        {showCalendar && (
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity 
                  onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <Text style={styles.calendarNavButton}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>{formatMonthYear(currentMonth)}</Text>
                <TouchableOpacity 
                  onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <Text style={styles.calendarNavButton}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calendarCloseButton}
                  onPress={() => setShowCalendar(false)}
                >
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.calendarDaysHeader}>
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                  <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.calendarGrid}>
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                  <View key={`empty-${i}`} style={styles.calendarDay} />
                ))}
                {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const daySchedules = schedules.filter(item => isSameDay(new Date(item.toDate), date));
                  const hasSchedules = daySchedules.length > 0;
                  
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDay,
                        isSameDay(date, selectedDate) && styles.calendarDaySelected,
                        hasSchedules && styles.calendarDayWithEvents
                      ]}
                      onPress={() => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        isSameDay(date, selectedDate) && styles.calendarDayTextSelected
                      ]}>
                        {day}
                      </Text>
                      {hasSchedules && (
                        <View style={styles.calendarEventIndicator}>
                          <Text style={styles.calendarEventIcon}>📅</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search schedules..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {schedules.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CalendarDays size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No Study Schedules Found</Text>
              <Text style={styles.emptyText}>
                {canAddSchedule() 
                  ? 'Create the first study schedule for students' 
                  : 'No study schedules have been posted yet'
                }
              </Text>
              {canAddSchedule() && (
                <TouchableOpacity style={styles.emptyAddButton} onPress={openAddModal}>
                  <Plus size={20} color="#ffffff" />
                  <Text style={styles.emptyAddButtonText}>Add Schedule</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Date Header */}
              {!showCalendar && (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderTitle}>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} Schedules
                  </Text>
                  <Text style={styles.dateHeaderSubtitle}>
                    {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''} found
                  </Text>
                </View>
              )}
              
              {/* Schedules List */}
              {filteredSchedules.length > 0 ? (
                <View style={styles.schedulesList}>
                  {filteredSchedules.map(renderScheduleCard)}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <CalendarDays size={64} color="#d1d5db" />
                  <Text style={styles.emptyTitle}>
                    {showCalendar ? 'No Schedules' : 'No Schedules for Selected Date'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {showCalendar 
                      ? 'No schedules found for this period' 
                      : 'No schedules found for the selected date'
                    }
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Schedule Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeAddModal} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Schedule</Text>
            <TouchableOpacity 
              onPress={handleAddSchedule} 
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Schedule Details</Text>
              
              {canAddSchedule() && (
                <View style={styles.accessControlInfo}>
                  <AlertCircle size={16} color="#3b82f6" />
                  <Text style={styles.accessControlText}>{getAccessControlInfo()}</Text>
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={newSchedule.title}
                  onChangeText={(text) => setNewSchedule(prev => ({ ...prev, title: text }))}
                  placeholder="Enter schedule title"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  value={newSchedule.description}
                  onChangeText={(text) => setNewSchedule(prev => ({ ...prev, description: text }))}
                  placeholder="Enter schedule description"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Schedule Type</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowScheduleTypePicker(true)}
                >
                  <Text style={newSchedule.scheduleType ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {scheduleTypeOptions.find(opt => opt.value === newSchedule.scheduleType)?.label || 'Select schedule type'}
                  </Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowSubjectPicker(true)}
                >
                  <Text style={newSchedule.subject ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {newSchedule.subject || 'Select subject'}
                  </Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Study Hours</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowStudyHoursPicker(true)}
                >
                  <Text style={newSchedule.studyHours ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {newSchedule.studyHours || 'Select study hours'}
                  </Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={newSchedule.toDate}
                  onChangeText={(text) => setNewSchedule(prev => ({ ...prev, toDate: text }))}
                  placeholder="YYYY-MM-DD (e.g., 2024-12-31)"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Audience</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowTargetAudiencePicker(true)}
                >
                  <Text style={newSchedule.targetAudience ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {targetAudienceOptions.find(opt => opt.value === newSchedule.targetAudience)?.label || 'Select target audience'}
                  </Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Class and Section fields for students */}
              {(newSchedule.targetAudience === 'students' || newSchedule.targetAudience === 'both') && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Class</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowClassPicker(true)}
                    >
                      <Text style={newSchedule.assignedClass ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                        {classOptions.find(opt => opt.value === newSchedule.assignedClass)?.label || 'Select class'}
                      </Text>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Section</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowSectionPicker(true)}
                    >
                      <Text style={newSchedule.assignedSection ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                        {sectionOptions.find(opt => opt.value === newSchedule.assignedSection)?.label || 'Select section'}
                      </Text>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Department field for staff */}
              {(newSchedule.targetAudience === 'staff' || newSchedule.targetAudience === 'both') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Department</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newSchedule.assignedDepartment}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, assignedDepartment: text }))}
                    placeholder="Enter department"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              )}
<<<<<<< HEAD

              {/* Attachments Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Attachments (Optional)</Text>
                <View style={styles.attachmentButtons}>
                  <TouchableOpacity style={styles.attachmentButton} onPress={handlePickDocument}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.attachmentButtonGradient}
                    >
                      <File size={16} color="#ffffff" />
                      <Text style={styles.attachmentButtonText}>Add Document</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attachmentButton} onPress={handlePickImage}>
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.attachmentButtonGradient}
                    >
                      <ImageIcon size={16} color="#ffffff" />
                      <Text style={styles.attachmentButtonText}>Add Image</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                
                {newSchedule.attachments.length > 0 && (
                  <View style={styles.attachmentsList}>
                    {newSchedule.attachments.map((attachment, index) => (
                      <View key={index} style={styles.attachmentItem}>
                        <LinearGradient
                          colors={['#f3f4f6', '#e5e7eb']}
                          style={styles.attachmentItemGradient}
                        >
                          {attachment.type === 'image' ? (
                            <Image source={{ uri: attachment.uri }} style={styles.attachmentThumbnail} />
                          ) : (
                            <View style={styles.attachmentDocument}>
                              <File size={20} color="#667eea" />
                            </View>
                          )}
                          <View style={styles.attachmentInfo}>
                            <Text style={styles.attachmentName} numberOfLines={1}>
                              {attachment.name}
                            </Text>
                            <Text style={styles.attachmentSize}>
                              {(attachment.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.removeAttachmentButton}
                            onPress={() => removeAttachment(index)}
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>
                    ))}
                  </View>
                )}
              </View>
=======
>>>>>>> origin/main
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Picker Modals */}
      {/* Schedule Type Picker */}
      <Modal
        visible={showScheduleTypePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Schedule Type</Text>
              <TouchableOpacity onPress={() => setShowScheduleTypePicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerContent}>
              {scheduleTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    setNewSchedule(prev => ({ ...prev, scheduleType: option.value }));
                    setShowScheduleTypePicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Subject Picker */}
      <Modal
        visible={showSubjectPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Subject</Text>
              <TouchableOpacity onPress={() => setShowSubjectPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerContent}>
              {subjectOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    setNewSchedule(prev => ({ ...prev, subject: option.value }));
                    setShowSubjectPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Study Hours Picker */}
      <Modal
        visible={showStudyHoursPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Study Hours</Text>
              <TouchableOpacity onPress={() => setShowStudyHoursPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerContent}>
              {studyHoursOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    setNewSchedule(prev => ({ ...prev, studyHours: option.value }));
                    setShowStudyHoursPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Target Audience Picker */}
      <Modal
        visible={showTargetAudiencePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Target Audience</Text>
              <TouchableOpacity onPress={() => setShowTargetAudiencePicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerContent}>
              {targetAudienceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    setNewSchedule(prev => ({ ...prev, targetAudience: option.value }));
                    setShowTargetAudiencePicker(false);
                  }}
                >
                  <View style={styles.pickerOptionContent}>
                    <Text style={styles.pickerOptionText}>{option.label}</Text>
                    <Text style={styles.pickerOptionDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {targetAudienceOptions.length === 0 && (
                <View style={styles.noOptionsContainer}>
                  <Text style={styles.noOptionsText}>No options available for your role</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Class Picker */}
      <Modal
        visible={showClassPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Class</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerContent}>
              {classOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    setNewSchedule(prev => ({ ...prev, assignedClass: option.value }));
                    setShowClassPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Section Picker */}
      <Modal
        visible={showSectionPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Section</Text>
              <TouchableOpacity onPress={() => setShowSectionPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerContent}>
              {sectionOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    setNewSchedule(prev => ({ ...prev, assignedSection: option.value }));
                    setShowSectionPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  schedulesList: {
    gap: 15,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeader: {
    marginBottom: 15,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleTypeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scheduleTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleDateText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  scheduleTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  audienceBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  audienceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleContent: {
    marginBottom: 15,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 15,
  },
  scheduleDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  attachmentsSection: {
    marginTop: 15,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  attachmentText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 8,
  },
<<<<<<< HEAD
  attachmentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  attachmentDocument: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
  },
  attachmentInfo: {
    flex: 1,
    marginRight: 10,
  },
  attachmentName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#6b7280',
  },
=======
>>>>>>> origin/main
  scheduleFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  scheduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleMetaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  // Calendar styles
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  calendarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    paddingHorizontal: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingVertical: 8,
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
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  calendarDaySelected: {
    backgroundColor: '#667eea',
  },
  calendarDayTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  calendarDayWithEvents: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  calendarCloseButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarEventIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarEventIcon: {
    fontSize: 12,
  },
  dateHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  dateHeaderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  formSection: {
    padding: 20,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
  },
  pickerButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  pickerButtonPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerOptionContent: {
    flex: 1,
  },
  pickerOptionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  noOptionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noOptionsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  accessControlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  accessControlText: {
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 8,
    flex: 1,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  pickerContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pickerOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
<<<<<<< HEAD
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  attachmentButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  attachmentButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  attachmentButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  attachmentsList: {
    gap: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  attachmentItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  attachmentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  attachmentDocument: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
  },
  attachmentInfo: {
    flex: 1,
    marginRight: 10,
  },
  attachmentName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeAttachmentButton: {
    padding: 5,
  },
  attachmentsContainer: {
    gap: 10,
  },
  attachmentCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  attachmentCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
=======
>>>>>>> origin/main
}); 