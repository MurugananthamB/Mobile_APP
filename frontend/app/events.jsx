import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert, Platform, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, MapPin, Users, Star, Plus, X, Search, ChevronLeft, ChevronDown, File, Image as ImageIcon, Trash2, Download } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ApiService from '../services/api';

// Helper functions for date and time formatting
const formatDateForDisplay = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const formatTimeForDisplay = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeForAPI = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Web-compatible date and time picker components
const WebDatePicker = ({ value, onChange, minimumDate, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  const [currentMonth, setCurrentMonth] = useState(value);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(value);
      setTempDate(value);
    }
  }, [isOpen, value]);

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

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minimumDate && selectedDate < minimumDate) {
      setError('Date cannot be in the past');
      return;
    }
    setTempDate(selectedDate);
    setError('');
  };

  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleConfirm = () => {
    if (error) return;
    onChange(null, tempDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDate(value);
    setCurrentMonth(value);
    setError('');
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isSameDay(date, tempDate);
      const isToday = isSameDay(date, new Date());
      const isPast = minimumDate && date < minimumDate;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isToday && styles.calendarDayToday,
            isPast && styles.calendarDayDisabled
          ]}
          onPress={() => !isPast && handleDateSelect(day)}
          disabled={isPast}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            isToday && styles.calendarDayTextToday,
            isPast && styles.calendarDayTextDisabled
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dateTimeSelector}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.selectorContent}>
          <Calendar size={20} color="#6b7280" />
          <Text style={styles.selectorText}>
            {formatDateForDisplay(value)}
          </Text>
        </View>
        <ChevronDown size={20} color="#6b7280" />
      </TouchableOpacity>

      {isOpen && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <Text style={styles.pickerTitle}>{title}</Text>
              
              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  style={styles.calendarNavButton}
                  onPress={() => handleMonthChange('prev')}
                >
                  <Text style={styles.calendarNavText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.calendarMonthYear}>{formatMonthYear(currentMonth)}</Text>
                <TouchableOpacity
                  style={styles.calendarNavButton}
                  onPress={() => handleMonthChange('next')}
                >
                  <Text style={styles.calendarNavText}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Calendar Days Header */}
              <View style={styles.calendarDaysHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {renderCalendar()}
              </View>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.pickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.pickerButtonConfirm, error && styles.disabledButton]}
                  onPress={handleConfirm}
                  disabled={!!error}
                >
                  <Text style={styles.pickerButtonTextConfirm}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const WebTimePicker = ({ value, onChange, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTime, setTempTime] = useState(value);
  const [error, setError] = useState('');
  const hoursScrollRef = useRef(null);
  const minutesScrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Scroll to current time when modal opens
      setTimeout(() => {
        if (hoursScrollRef.current) {
          hoursScrollRef.current.scrollTo({
            y: tempTime.getHours() * 50,
            animated: true
          });
        }
        if (minutesScrollRef.current) {
          minutesScrollRef.current.scrollTo({
            y: Math.floor(tempTime.getMinutes() / 5) * 50,
            animated: true
          });
        }
      }, 100);
    }
  }, [isOpen]);

  const handleTimeSelect = (hours, minutes) => {
    const newTime = new Date();
    newTime.setHours(hours, minutes, 0, 0);
    setTempTime(newTime);
    setError('');
  };

  const handleConfirm = () => {
    if (error) return;
    onChange(null, tempTime);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempTime(value);
    setError('');
    setIsOpen(false);
  };

  const renderTimePicker = () => {
    const hours = [];
    const minutes = [];

    // Generate hours (0-23)
    for (let hour = 0; hour < 24; hour++) {
      hours.push(
        <TouchableOpacity
          key={hour}
          style={[
            styles.timeOption,
            tempTime.getHours() === hour && styles.timeOptionSelected
          ]}
          onPress={() => handleTimeSelect(hour, tempTime.getMinutes())}
        >
          <Text style={[
            styles.timeOptionText,
            tempTime.getHours() === hour && styles.timeOptionTextSelected
          ]}>
            {hour.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      );
    }

    // Generate minutes (0-59, step by 5)
    for (let minute = 0; minute < 60; minute += 5) {
      minutes.push(
        <TouchableOpacity
          key={minute}
          style={[
            styles.timeOption,
            tempTime.getMinutes() === minute && styles.timeOptionSelected
          ]}
          onPress={() => handleTimeSelect(tempTime.getHours(), minute)}
        >
          <Text style={[
            styles.timeOptionText,
            tempTime.getMinutes() === minute && styles.timeOptionTextSelected
          ]}>
            {minute.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.timePickerColumn}>
          <Text style={styles.timePickerLabel}>Hour</Text>
          <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false} ref={hoursScrollRef}>
            {hours}
          </ScrollView>
        </View>
        <Text style={styles.timePickerSeparator}>:</Text>
        <View style={styles.timePickerColumn}>
          <Text style={styles.timePickerLabel}>Minute</Text>
          <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false} ref={minutesScrollRef}>
            {minutes}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dateTimeSelector}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.selectorContent}>
          <Clock size={20} color="#6b7280" />
          <Text style={styles.selectorText}>
            {formatTimeForDisplay(value)}
          </Text>
        </View>
        <ChevronDown size={20} color="#6b7280" />
      </TouchableOpacity>

      {isOpen && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <Text style={styles.pickerTitle}>{title}</Text>
              
              {renderTimePicker()}

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.pickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.pickerButtonConfirm, error && styles.disabledButton]}
                  onPress={handleConfirm}
                  disabled={!!error}
                >
                  <Text style={styles.pickerButtonTextConfirm}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams(); // Get route parameters
  const [userData, setUserData] = useState(null);
  const scrollViewRef = useRef(null);
  
  // Add event modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Date and Time picker states
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [showValidityDatePicker, setShowValidityDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [eventDate, setEventDate] = useState(new Date());
  const [validityDate, setValidityDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  
  // Search and calendar states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Highlight states for notifications
  const [highlightedEventId, setHighlightedEventId] = useState(null);
  const [highlightedEvent, setHighlightedEvent] = useState(null);
  const [highlightedEventIndex, setHighlightedEventIndex] = useState(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: new Date(),
    validityDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    venue: '',
    organizer: '',
    documents: [],
    images: []
  });

  useEffect(() => {
    loadUserData();
    loadEvents();
  }, []);

  // Handle parameters from notifications
  useEffect(() => {
    if (params.eventId && params.highlightEvent === 'true') {
      setHighlightedEventId(params.eventId);
      
      // Find the event index for scrolling
      const eventIndex = events.findIndex(event => event._id === params.eventId);
      if (eventIndex !== -1) {
        setHighlightedEventIndex(eventIndex);
        
        // Scroll to the highlighted event after a short delay
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              y: eventIndex * 300, // Approximate height per event
              animated: true
            });
          }
        }, 500);
      }
      
      // Clear highlight after 5 seconds
      setTimeout(() => {
        setHighlightedEventId(null);
        setHighlightedEvent(null);
        setHighlightedEventIndex(null);
      }, 5000);
    }
  }, [params.eventId, params.highlightEvent, events]);


  const loadUserData = async () => {
    try {
      const storedUserData = await ApiService.getStoredUserData();
      console.log('👤 Loaded user data:', storedUserData);
      
      // Also check if token exists
      const token = await ApiService.getStoredToken();
      console.log('🔑 Stored token exists:', !!token);
      
      setUserData(storedUserData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadEvents = async () => {
    try {
      console.log('🔄 Loading events...');
      setLoading(true);
      const response = await ApiService.getEvents();
      console.log('📡 Events API response:', response);
      
      if (response.success) {
        console.log('✅ Events loaded successfully:', response.data);
        setEvents(response.data);
      } else {
        console.log('❌ Failed to load events:', response.message);
      }
    } catch (error) {
      console.error('❌ Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const validateForm = () => {
    console.log('🔍 Frontend validation - checking form data:', newEvent);
    
    if (!newEvent.title || !newEvent.description || 
        !newEvent.eventDate || !newEvent.validityDate || 
        !newEvent.startTime || !newEvent.endTime || 
        !newEvent.venue || !newEvent.organizer) {
      console.log('❌ Frontend validation failed - missing fields');
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return false;
    }

    console.log('📅 Frontend date validation...');
    
    // Validate dates
    const eventDate = new Date(newEvent.eventDate);
    const validityDate = new Date(newEvent.validityDate);
    const today = new Date();
    
    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    validityDate.setHours(0, 0, 0, 0);
    
    console.log('Event date:', eventDate, 'Valid:', !isNaN(eventDate.getTime()));
    console.log('Validity date:', validityDate, 'Valid:', !isNaN(validityDate.getTime()));
    console.log('Today:', today);

    if (isNaN(eventDate.getTime())) {
      Alert.alert('Validation Error', 'Invalid event date');
      return false;
    }

    if (isNaN(validityDate.getTime())) {
      Alert.alert('Validation Error', 'Invalid validity date');
      return false;
    }

    // Allow event date to be today (exact creation date)
    if (eventDate < today) {
      Alert.alert('Validation Error', 'Event date cannot be in the past');
      return false;
    }

    // Allow validity date to be today or future
    if (validityDate < today) {
      Alert.alert('Validation Error', 'Validity date cannot be in the past');
      return false;
    }

    if (validityDate > eventDate) {
      Alert.alert('Validation Error', 'Validity date cannot be after the event date');
      return false;
    }

    console.log('✅ Frontend validation passed');
    return true;
  };

  // File upload functions
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain'
        ],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
          Alert.alert(
            'File Too Large', 
            'Document size must be 2MB or less. Please select a smaller file.'
          );
          return;
        }
        
        const document = {
          name: file.name,
          uri: file.uri,
          size: file.size,
          type: 'document',
          mimeType: file.mimeType
        };
        
        setNewEvent(prev => ({
          ...prev,
          documents: [...prev.documents, document]
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        
        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (image.fileSize > maxSize) {
          Alert.alert(
            'Image Too Large', 
            'Image size must be 2MB or less. Please select a smaller image.'
          );
          return;
        }
        
        const imageFile = {
          name: `image_${Date.now()}.jpg`,
          uri: image.uri,
          size: image.fileSize,
          type: 'image',
          mimeType: 'image/jpeg'
        };
        
        setNewEvent(prev => ({
          ...prev,
          images: [...prev.images, imageFile]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeDocument = (index) => {
    setNewEvent(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index) => {
    setNewEvent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Download functions
  const downloadDocument = async (documentItem) => {
    try {
      Alert.alert('Downloading', 'Please wait while we download your document...');
      
      if (Platform.OS === 'web') {
        // For web platform, open the file in a new tab or trigger download
        const link = document.createElement('a');
        link.href = documentItem.uri;
        link.download = documentItem.name || `document_${Date.now()}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.alert('Download Complete', `Document "${documentItem.name || 'Document'}" download has been initiated.`);
      } else {
        // For mobile platforms, use expo-file-system and expo-sharing
        const fileName = documentItem.name || `document_${Date.now()}`;
        const fileExtension = documentItem.mimeType ? documentItem.mimeType.split('/')[1] : 'pdf';
        const fileUri = `${FileSystem.documentDirectory}${fileName}.${fileExtension}`;
        
        const downloadResult = await FileSystem.downloadAsync(
          documentItem.uri,
          fileUri
        );
        
        if (downloadResult.status === 200) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: documentItem.mimeType || 'application/octet-stream',
              dialogTitle: `Download ${documentItem.name || 'Document'}`,
              UTI: 'public.item'
            });
          } else {
            Alert.alert('Download Complete', `Document "${documentItem.name || 'Document'}" has been saved to your device.`);
          }
        } else {
          Alert.alert('Download Failed', 'Failed to download the document. Please try again.');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Error', 'Failed to download the document. Please try again.');
    }
  };

  const downloadImage = async (imageItem) => {
    try {
      Alert.alert('Downloading', 'Please wait while we download your image...');
      
      if (Platform.OS === 'web') {
        // For web platform, open the file in a new tab or trigger download
        const link = document.createElement('a');
        link.href = imageItem.uri;
        link.download = imageItem.name || `image_${Date.now()}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.alert('Download Complete', `Image "${imageItem.name || 'Image'}" download has been initiated.`);
      } else {
        // For mobile platforms, use expo-file-system and expo-sharing
        const fileName = imageItem.name || `image_${Date.now()}.jpg`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        const downloadResult = await FileSystem.downloadAsync(
          imageItem.uri,
          fileUri
        );
        
        if (downloadResult.status === 200) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: imageItem.mimeType || 'image/jpeg',
              dialogTitle: `Download ${imageItem.name || 'Image'}`,
              UTI: 'public.image'
            });
          } else {
            Alert.alert('Download Complete', `Image "${imageItem.name || 'Image'}" has been saved to your device.`);
          }
        } else {
          Alert.alert('Download Failed', 'Failed to download the image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Error', 'Failed to download the image. Please try again.');
    }
  };

  const handleCreateEvent = async () => {
    console.log('🚀 handleCreateEvent called');
    console.log('📋 Current form data:', newEvent);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('⏳ Setting submitting state to true');
      
      // Combine date fields into proper format
      const eventDate = formatDateForAPI(newEvent.eventDate);
      const validityDate = formatDateForAPI(newEvent.validityDate);
      const startTime = formatTimeForAPI(newEvent.startTime);
      const endTime = formatTimeForAPI(newEvent.endTime);
      
      console.log('📅 Combined dates - Event:', eventDate, 'Validity:', validityDate);
      console.log('⏰ Combined times - Start:', startTime, 'End:', endTime);
      
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: eventDate,
        validityDate: validityDate,
        startTime: startTime,
        endTime: endTime,
        venue: newEvent.venue,
        organizer: newEvent.organizer,
        documents: newEvent.documents || [],
        images: newEvent.images || []
      };

      console.log('📝 Final event data to send:', eventData);
      console.log('📝 Field-by-field check:');
      console.log('  - title:', !!eventData.title, eventData.title);
      console.log('  - description:', !!eventData.description, eventData.description);
      console.log('  - date:', !!eventData.date, eventData.date);
      console.log('  - validityDate:', !!eventData.validityDate, eventData.validityDate);
      console.log('  - startTime:', !!eventData.startTime, eventData.startTime);
      console.log('  - endTime:', !!eventData.endTime, eventData.endTime);
      console.log('  - venue:', !!eventData.venue, eventData.venue);
      console.log('  - organizer:', !!eventData.organizer, eventData.organizer);
      console.log('🔗 About to call ApiService.createEvent...');

      const response = await ApiService.createEvent(eventData);
      
      console.log('📝 API Response received:', response);
      
      if (response.success) {
        console.log('✅ Event created successfully');
        Alert.alert('Success', 'Event created successfully!');
        setShowAddModal(false);
        resetForm();
        await loadEvents(); // Refresh the events list
      } else {
        console.log('❌ API returned error:', response.message);
        Alert.alert('Error', response.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('❌ Error creating event:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Error', error.message || 'Failed to create event');
    } finally {
      console.log('🏁 Setting submitting state to false');
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      eventDate: new Date(),
      validityDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      venue: '',
      organizer: '',
      documents: [],
      images: []
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setShowCategoryDropdown(false);
    resetForm();
  };

  const handleClearEvents = async () => {
    Alert.alert(
      'Clear All Events',
      'Are you sure you want to delete all events? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.clearAllEvents();
              if (response.success) {
                Alert.alert('Success', `Successfully cleared ${response.data.deletedCount} events`);
                await loadEvents(); // Refresh the events list
              } else {
                Alert.alert('Error', response.message || 'Failed to clear events');
              }
            } catch (error) {
              console.error('Error clearing events:', error);
              Alert.alert('Error', error.message || 'Failed to clear events');
            }
          },
        },
      ]
    );
  };

  // Check if user can add events (management or staff only)
  const canAddEvent = () => {
    console.log('🔍 Checking if user can add events:', userData);
    if (!userData || !userData.role) {
      console.log('❌ No user data or role');
      return false;
    }
    const userRole = userData.role.toLowerCase();
    const canAdd = userRole === 'management' || userRole === 'staff';
    console.log('✅ User role:', userRole, 'Can add events:', canAdd);
    return canAdd;
  };

  // Calculate days until validity date
  const getDaysUntilValidity = (validityDate) => {
    const today = new Date();
    const validity = new Date(validityDate);
    const diffTime = validity - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate days until event date
  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Format event date for display
  const formatEventDate = (eventDate) => {
    const date = new Date(eventDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Filter events based on search query and selected date
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    
    // Filter by selected date if calendar is not showing
    if (!showCalendar && !isSameDay(eventDate, selectedDate)) {
      return false;
    }
    
    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        (event.organizer && event.organizer.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Predefined category options (now used as title)
  const categoryOptions = [
    { value: 'General Meeting', label: 'General Meeting', icon: '👥', color: '#667eea' },
    { value: 'Review Meeting', label: 'Review Meeting', icon: '📊', color: '#059669' },
    { value: 'Orientation Program', label: 'Orientation Program', icon: '🎯', color: '#7c3aed' },
    { value: 'Conference', label: 'Conference', icon: '🎤', color: '#6b7280' },
    { value: 'Seminar', label: 'Seminar', icon: '📚', color: '#6b7280' },
    { value: 'Committee Meeting', label: 'Committee Meeting', icon: '👨‍👨‍👦‍👦', color: '#6b7280' },
    { value: 'Other', label: 'Other', icon: '📌', color: '#6b7280' },
  ];



  // Get category color and styling based on title
  const getCategoryStyle = (title) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('sport') || titleLower.includes('athletic') || titleLower.includes('fitness')) {
      return {
        backgroundColor: '#10b981',
        color: '#ffffff',
        icon: '🏃‍♂️'
      };
    } else if (titleLower.includes('academic') || titleLower.includes('education')) {
      return {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        icon: '📚'
      };
    } else if (titleLower.includes('cultural') || titleLower.includes('art')) {
      return {
        backgroundColor: '#8b5cf6',
        color: '#ffffff',
        icon: '🎭'
      };
    } else if (titleLower.includes('technology') || titleLower.includes('tech')) {
      return {
        backgroundColor: '#f59e0b',
        color: '#ffffff',
        icon: '💻'
      };
    } else if (titleLower.includes('social') || titleLower.includes('celebration')) {
      return {
        backgroundColor: '#ec4899',
        color: '#ffffff',
        icon: '🎉'
      };
    } else if (titleLower.includes('workshop') || titleLower.includes('training')) {
      return {
        backgroundColor: '#06b6d4',
        color: '#ffffff',
        icon: '🔧'
      };
    } else if (titleLower.includes('meeting')) {
      return {
        backgroundColor: '#667eea',
        color: '#ffffff',
        icon: '👥'
      };
    } else if (titleLower.includes('orientation')) {
      return {
        backgroundColor: '#7c3aed',
        color: '#ffffff',
        icon: '🎓'
      };
    } else {
      return {
        backgroundColor: '#6b7280',
        color: '#ffffff',
        icon: '📅'
      };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Events</Text>
              <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
              {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)')} 
              style={styles.backButton}
            >
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Schedule</Text>
            </View>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Search size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          {showSearch && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search events..."
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}
          
          {/* Date Selector */}
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={styles.dateSelectorText}>{formatMonthYear(selectedDate)}</Text>
            <ChevronDown size={20} color="#ffffff" />
          </TouchableOpacity>
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
                  const dayEvents = events.filter(event => isSameDay(new Date(event.date), date));
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDay,
                        isSameDay(date, selectedDate) && styles.calendarDaySelected,
                        hasEvents && styles.calendarDayWithEvents
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
                      {hasEvents && (
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

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ref={scrollViewRef}
      >
        {/* Timeline Events */}
        <View style={styles.timelineContainer}>
          {/* Week Group */}
          <View style={styles.weekGroup}>
            <View style={styles.weekHeader}>
              <View style={styles.weekIndicator}>
                <View style={styles.weekDot} />
              </View>
              <Text style={styles.weekLabel}>
                {showCalendar ? 'All Events' : `${formatEventDate(selectedDate)} Events`}
              </Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No events found matching your search' : 'No events found'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try adjusting your search terms' : 'Create your first event to get started!'}
                </Text>
              </View>
            ) : (
              filteredEvents.map((event, index) => {
                const categoryStyle = getCategoryStyle(event.title);
                const eventDate = new Date(event.date);
                const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const dayOfMonth = eventDate.getDate();
                
                return (
                  <View key={event._id || index} style={styles.timelineEvent}>
                    {/* Date Column */}
                    <View style={styles.dateColumn}>
                      <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
                      <Text style={styles.dayOfMonth}>{dayOfMonth}</Text>
                    </View>
                    
                    {/* Event Card */}
                    <LinearGradient
                      colors={[categoryStyle.backgroundColor, categoryStyle.backgroundColor + '80']}
                      style={[
                        styles.eventCard,
                        highlightedEventId === event._id && {
                          borderWidth: 3,
                          borderColor: '#ffd700',
                          shadowColor: '#ffd700',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 10,
                          elevation: 8,
                        }
                      ]}
                    >
                      {highlightedEventId === event._id && (
                        <View style={styles.highlightBadge}>
                          <Text style={styles.highlightText}>📢 New Event</Text>
                        </View>
                      )}
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      
                      {/* Event Description */}
                      {event.description && (
                        <Text style={styles.eventDescription}>{event.description}</Text>
                      )}
                      
                      {/* Event Details */}
                      <View style={styles.eventDetails}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailIcon}>🎯</Text>
                          <Text style={styles.detailText}>{event.title}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <MapPin size={14} color="#ffffff" />
                          <Text style={styles.detailText}>{event.venue}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Clock size={14} color="#ffffff" />
                          <Text style={styles.detailText}>{event.startTime} - {event.endTime}</Text>
                        </View>
                        
                        {/* Organizer */}
                        {event.organizer && (
                          <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>👤</Text>
                            <Text style={styles.detailText}>Organizer: {event.organizer}</Text>
                          </View>
                        )}
                        
                        {/* Documents */}
                        {event.documents && event.documents.length > 0 && (
                          <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>📄</Text>
                            <Text style={styles.detailText}>
                              Documents: {event.documents.length} file(s)
                            </Text>
                          </View>
                        )}
                        
                        {/* Documents List */}
                        {event.documents && event.documents.length > 0 && (
                          <View style={styles.attachmentsSection}>
                            {event.documents.map((documentItem, index) => (
                              <TouchableOpacity 
                                key={index} 
                                style={styles.attachmentCard}
                                onPress={() => downloadDocument(documentItem)}
                              >
                                <LinearGradient
                                  colors={['#3b82f6', '#1d4ed8']}
                                  style={styles.attachmentCardGradient}
                                >
                                  <View style={styles.attachmentCardDocument}>
                                    <File size={20} color="#ffffff" />
                                  </View>
                                  <View style={styles.attachmentCardContent}>
                                    <Text style={styles.attachmentCardName} numberOfLines={1}>
                                      {documentItem.name}
                                    </Text>
                                    <Text style={styles.attachmentCardSize}>
                                      {(documentItem.size / 1024 / 1024).toFixed(2)} MB
                                    </Text>
                                  </View>
                                  <Download size={16} color="#ffffff" />
                                </LinearGradient>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                        
                        {/* Images */}
                        {event.images && event.images.length > 0 && (
                          <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>🖼️</Text>
                            <Text style={styles.detailText}>
                              Images: {event.images.length} image(s)
                            </Text>
                          </View>
                        )}
                        
                        {/* Images List */}
                        {event.images && event.images.length > 0 && (
                          <View style={styles.attachmentsSection}>
                            {event.images.map((imageItem, index) => (
                              <TouchableOpacity 
                                key={index} 
                                style={styles.attachmentCard}
                                onPress={() => downloadImage(imageItem)}
                              >
                                <LinearGradient
                                  colors={['#10b981', '#059669']}
                                  style={styles.attachmentCardGradient}
                                >
                                  <View style={styles.attachmentCardImage}>
                                    <Image source={{ uri: imageItem.uri }} style={styles.attachmentThumbnail} />
                                  </View>
                                  <View style={styles.attachmentCardContent}>
                                    <Text style={styles.attachmentCardName} numberOfLines={1}>
                                      {imageItem.name}
                                    </Text>
                                    <Text style={styles.attachmentCardSize}>
                                      {(imageItem.size / 1024 / 1024).toFixed(2)} MB
                                    </Text>
                                  </View>
                                  <Download size={16} color="#ffffff" />
                                </LinearGradient>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                        
                        {/* Registration Status */}
                        <View style={styles.detailItem}>
                          <Text style={styles.detailIcon}>📅</Text>
                          <Text style={styles.detailText}>
                            Registration closes in {getDaysUntilValidity(event.validityDate)} days
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                );
              })
            )}
          </View>
        </View>
        
        {/* Add Event Button */}
        {canAddEvent() && (
          <TouchableOpacity style={styles.floatingAddButton} onPress={openAddModal}>
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </ScrollView>

                    {/* Add Event Modal */}
       <Modal
         visible={showAddModal}
         animationType="slide"
         transparent={true}
         onRequestClose={closeAddModal}
       >
         <TouchableOpacity 
           style={styles.modalOverlay} 
           activeOpacity={1} 
           onPress={() => {
             setShowCategoryDropdown(false);
           }}
         >
           <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Event</Text>
              <TouchableOpacity onPress={closeAddModal}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Category (Title) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Event Category *</Text>
                <TouchableOpacity
                  style={styles.dropdownContainer}
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <View style={styles.dropdownHeader}>
                    {newEvent.title ? (
                      <View style={styles.selectedCategory}>
                        <Text style={styles.selectedCategoryIcon}>
                          {categoryOptions.find(opt => opt.value === newEvent.title)?.icon || '📅'}
                        </Text>
                        <Text style={styles.selectedCategoryText}>
                          {categoryOptions.find(opt => opt.value === newEvent.title)?.label || 'Select Category'}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.dropdownPlaceholder}>Select Category</Text>
                    )}
                    <ChevronDown 
                      size={20} 
                      color="#6b7280" 
                      style={[
                        styles.dropdownArrow,
                        showCategoryDropdown && styles.dropdownArrowRotated
                      ]}
                    />
                  </View>
                </TouchableOpacity>
                
                                 {/* Dropdown Options */}
                 {showCategoryDropdown && (
                   <View style={styles.dropdownOptions}>
                     <ScrollView 
                       nestedScrollEnabled={true}
                       showsVerticalScrollIndicator={false}
                       style={{ maxHeight: 200 }}
                     >
                       {categoryOptions.map((option) => (
                         <TouchableOpacity
                           key={option.value}
                           style={[
                             styles.dropdownOption,
                             newEvent.title === option.value && styles.dropdownOptionSelected
                           ]}
                           onPress={() => {
                             setNewEvent({...newEvent, title: option.value});
                             setShowCategoryDropdown(false);
                           }}
                         >
                           <Text style={styles.dropdownOptionIcon}>{option.icon}</Text>
                           <Text style={[
                             styles.dropdownOptionText,
                             newEvent.title === option.value && styles.dropdownOptionTextSelected
                           ]}>
                             {option.label}
                           </Text>
                         </TouchableOpacity>
                       ))}
                     </ScrollView>
                   </View>
                 )}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newEvent.description}
                  onChangeText={(text) => setNewEvent({...newEvent, description: text})}
                  placeholder="Enter event description"
                  multiline
                  numberOfLines={3}
                />
              </View>



              {/* Event Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Event Date *</Text>
                {Platform.OS === 'web' ? (
                  <WebDatePicker
                    value={newEvent.eventDate}
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setNewEvent({...newEvent, eventDate: selectedDate});
                      }
                    }}
                    minimumDate={new Date()}
                    title="Select Event Date"
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.dateTimeSelector}
                    onPress={() => setShowEventDatePicker(true)}
                  >
                    <View style={styles.selectorContent}>
                      <Calendar size={20} color="#6b7280" />
                      <Text style={styles.selectorText}>
                        {formatDateForDisplay(newEvent.eventDate)}
                      </Text>
                    </View>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Time */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Start Time *</Text>
                  {Platform.OS === 'web' ? (
                    <WebTimePicker
                      value={newEvent.startTime}
                      onChange={(event, selectedTime) => {
                        if (selectedTime) {
                          setNewEvent({...newEvent, startTime: selectedTime});
                        }
                      }}
                      title="Select Start Time"
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.dateTimeSelector}
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <View style={styles.selectorContent}>
                        <Clock size={20} color="#6b7280" />
                        <Text style={styles.selectorText}>
                          {formatTimeForDisplay(newEvent.startTime)}
                        </Text>
                      </View>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>End Time *</Text>
                  {Platform.OS === 'web' ? (
                    <WebTimePicker
                      value={newEvent.endTime}
                      onChange={(event, selectedTime) => {
                        if (selectedTime) {
                          setNewEvent({...newEvent, endTime: selectedTime});
                        }
                      }}
                      title="Select End Time"
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.dateTimeSelector}
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <View style={styles.selectorContent}>
                        <Clock size={20} color="#6b7280" />
                        <Text style={styles.selectorText}>
                          {formatTimeForDisplay(newEvent.endTime)}
                        </Text>
                      </View>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Venue */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Venue *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEvent.venue}
                  onChangeText={(text) => setNewEvent({...newEvent, venue: text})}
                  placeholder="Enter venue"
                />
              </View>



              {/* Validity Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Validity Date *</Text>
                {Platform.OS === 'web' ? (
                  <WebDatePicker
                    value={newEvent.validityDate}
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setNewEvent({...newEvent, validityDate: selectedDate});
                      }
                    }}
                    minimumDate={new Date()}
                    title="Select Validity Date"
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.dateTimeSelector}
                    onPress={() => setShowValidityDatePicker(true)}
                  >
                    <View style={styles.selectorContent}>
                      <Calendar size={20} color="#6b7280" />
                      <Text style={styles.selectorText}>
                        {formatDateForDisplay(newEvent.validityDate)}
                      </Text>
                    </View>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Organizer */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Organizer</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEvent.organizer}
                  onChangeText={(text) => setNewEvent({...newEvent, organizer: text})}
                  placeholder="Enter organizer name"
                />
              </View>

              {/* Documents */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Documents (Optional)</Text>
                <Text style={styles.helperText}>
                  📎 Add PDFs, Word files, PPTs, or text files to support your event
                </Text>
                
                {/* Document Upload Button */}
                <TouchableOpacity
                  style={[styles.attachmentButton, styles.documentButton]}
                  onPress={handlePickDocument}
                  disabled={isSubmitting}
                >
                  <File size={20} color="#3b82f6" />
                  <Text style={styles.attachmentButtonText}>Add Document</Text>
                </TouchableOpacity>
                
                {/* Display Selected Documents */}
                {newEvent.documents && newEvent.documents.length > 0 && (
                  <View style={styles.attachmentsList}>
                    {newEvent.documents.map((doc, index) => (
                      <View key={index} style={styles.attachmentItem}>
                        <View style={styles.attachmentInfo}>
                          <File size={16} color="#3b82f6" />
                          <Text style={styles.attachmentName} numberOfLines={1}>
                            {doc.name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeDocument(index)}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Images */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Images (Optional)</Text>
                <Text style={styles.helperText}>
                  🖼️ Add images to showcase your event
                </Text>
                
                {/* Image Upload Button */}
                <TouchableOpacity
                  style={[styles.attachmentButton, styles.imageButton]}
                  onPress={handlePickImage}
                  disabled={isSubmitting}
                >
                  <ImageIcon size={20} color="#10b981" />
                  <Text style={styles.attachmentButtonText}>Add Image</Text>
                </TouchableOpacity>
                
                {/* Display Selected Images */}
                {newEvent.images && newEvent.images.length > 0 && (
                  <View style={styles.attachmentsList}>
                    {newEvent.images.map((img, index) => (
                      <View key={index} style={styles.attachmentItem}>
                        <View style={styles.attachmentInfo}>
                          <ImageIcon size={16} color="#10b981" />
                          <Text style={styles.attachmentName} numberOfLines={1}>
                            {img.name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(index)}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={closeAddModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton, isSubmitting && styles.disabledButton]} 
                onPress={handleCreateEvent}
                disabled={isSubmitting}
              >
                <Text style={styles.createButtonText}>
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date and Time Pickers */}
      {(showEventDatePicker || showValidityDatePicker || showStartTimePicker || showEndTimePicker) && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              {showEventDatePicker && (
                <>
                  <Text style={styles.pickerTitle}>Select Event Date</Text>
                  <DateTimePicker
                    value={newEvent.eventDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowEventDatePicker(false);
                      }
                      if (selectedDate) {
                        setNewEvent({...newEvent, eventDate: selectedDate});
                      }
                    }}
                    minimumDate={new Date()}
                  />
                  {Platform.OS === 'ios' && (
                    <View style={styles.pickerButtons}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowEventDatePicker(false)}
                      >
                        <Text style={styles.pickerButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.pickerButton, styles.pickerButtonConfirm]}
                        onPress={() => setShowEventDatePicker(false)}
                      >
                        <Text style={styles.pickerButtonTextConfirm}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {showValidityDatePicker && (
                <>
                  <Text style={styles.pickerTitle}>Select Validity Date</Text>
                  <DateTimePicker
                    value={newEvent.validityDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowValidityDatePicker(false);
                      }
                      if (selectedDate) {
                        setNewEvent({...newEvent, validityDate: selectedDate});
                      }
                    }}
                    minimumDate={new Date()}
                  />
                  {Platform.OS === 'ios' && (
                    <View style={styles.pickerButtons}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowValidityDatePicker(false)}
                      >
                        <Text style={styles.pickerButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.pickerButton, styles.pickerButtonConfirm]}
                        onPress={() => setShowValidityDatePicker(false)}
                      >
                        <Text style={styles.pickerButtonTextConfirm}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {showStartTimePicker && (
                <>
                  <Text style={styles.pickerTitle}>Select Start Time</Text>
                  <DateTimePicker
                    value={newEvent.startTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                      if (Platform.OS === 'android') {
                        setShowStartTimePicker(false);
                      }
                      if (selectedTime) {
                        setNewEvent({...newEvent, startTime: selectedTime});
                      }
                    }}
                  />
                  {Platform.OS === 'ios' && (
                    <View style={styles.pickerButtons}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowStartTimePicker(false)}
                      >
                        <Text style={styles.pickerButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.pickerButton, styles.pickerButtonConfirm]}
                        onPress={() => setShowStartTimePicker(false)}
                      >
                        <Text style={styles.pickerButtonTextConfirm}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {showEndTimePicker && (
                <>
                  <Text style={styles.pickerTitle}>Select End Time</Text>
                  <DateTimePicker
                    value={newEvent.endTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                      if (Platform.OS === 'android') {
                        setShowEndTimePicker(false);
                      }
                      if (selectedTime) {
                        setNewEvent({...newEvent, endTime: selectedTime});
                      }
                    }}
                  />
                  {Platform.OS === 'ios' && (
                    <View style={styles.pickerButtons}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowEndTimePicker(false)}
                      >
                        <Text style={styles.pickerButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.pickerButton, styles.pickerButtonConfirm]}
                        onPress={() => setShowEndTimePicker(false)}
                      >
                        <Text style={styles.pickerButtonTextConfirm}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
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
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  calendarNavText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
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
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
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
  calendarDayToday: {
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  calendarDayTextToday: {
    color: '#1e40af',
    fontWeight: '600',
  },
  calendarDayDisabled: {
    opacity: 0.5,
  },
  calendarDayTextDisabled: {
    color: '#9ca3af',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timelineContainer: {
    paddingTop: 20,
  },
  weekGroup: {
    marginBottom: 30,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 12,
  },
  weekDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateColumn: {
    width: 60,
    alignItems: 'center',
    marginRight: 16,
  },
  dayOfWeek: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  dayOfMonth: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  eventCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
  },
  detailIcon: {
    fontSize: 16,
  },

  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
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
    color: '#6b7280',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#1e40af',
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    minHeight: 48,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Dropdown Styles
     dropdownContainer: {
     borderWidth: 1,
     borderColor: '#d1d5db',
     borderRadius: 8,
     backgroundColor: '#ffffff',
     marginTop: 4,
     position: 'relative',
     zIndex: 1000,
   },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCategoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  selectedCategoryText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  dropdownArrow: {
    marginLeft: 8,
  },
  dropdownArrowRotated: {
    transform: [{ rotate: '180deg' }],
  },
     dropdownOptions: {
     borderTopWidth: 1,
     borderTopColor: '#e5e7eb',
     backgroundColor: '#ffffff',
     borderRadius: 0,
     zIndex: 1000,
     elevation: 5,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
   },
     dropdownOption: {
     flexDirection: 'row',
     alignItems: 'center',
     padding: 12,
     borderBottomWidth: 1,
     borderBottomColor: '#f3f4f6',
     minHeight: 44,
   },
  dropdownOptionSelected: {
    backgroundColor: '#f1f5f9',
  },
  dropdownOptionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  highlightBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ffd700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    zIndex: 1,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  pickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  pickerButtonConfirm: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  pickerButtonTextConfirm: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    textAlign: 'center',
  },
  webPickerContainer: {
    padding: 20,
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    width: '100%',
    textAlign: 'center',
  },
  webTimeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    width: '100%',
    textAlign: 'center',
  },
  webInputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  timePickerScroll: {
    maxHeight: 150,
    width: '100%',
  },
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
    marginHorizontal: 10,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginVertical: 2,
    marginHorizontal: 4,
  },
  timeOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeOptionTextSelected: {
    color: '#ffffff',
  },
  // Calendar styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  calendarNavText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  calendarDayHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
  },
  calendarDaySelected: {
    backgroundColor: '#667eea',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  calendarDayTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  calendarDayToday: {
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  calendarDayTextToday: {
    color: '#1e40af',
    fontWeight: '600',
  },
  calendarDayDisabled: {
    opacity: 0.5,
  },
  calendarDayTextDisabled: {
    color: '#9ca3af',
  },
  // Time picker styles
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  timePickerScroll: {
    maxHeight: 150,
    width: '100%',
  },
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
    marginHorizontal: 10,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginVertical: 2,
    marginHorizontal: 4,
  },
  timeOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeOptionTextSelected: {
    color: '#ffffff',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  documentButton: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  imageButton: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  attachmentButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
    marginLeft: 10,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  attachmentsList: {
    marginBottom: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    marginBottom: 5,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentName: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 5,
  },
  removeButton: {
    padding: 5,
  },
  attachmentsSection: {
    marginBottom: 10,
  },
  attachmentCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  attachmentCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachmentCardDocument: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentCardImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    overflow: 'hidden',
  },
  attachmentCardContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  attachmentCardName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  attachmentCardSize: {
    fontSize: 12,
    color: '#ffffff',
    fontStyle: 'italic',
  },
  attachmentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
}); 