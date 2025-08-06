import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Users, Star, Plus, X, Search } from 'lucide-react-native';
import ApiService from '../services/api';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Add event modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Search and calendar states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDay: '',
    eventMonth: '',
    eventYear: '',
    validityDay: '',
    validityMonth: '',
    validityYear: '',
    startTime: '',
    endTime: '',
    venue: '',
    organizer: '',
    requirements: '',
    prizes: ''
  });

  useEffect(() => {
    loadUserData();
    loadEvents();
  }, []);



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
        !newEvent.eventDay || !newEvent.eventMonth || !newEvent.eventYear ||
        !newEvent.validityDay || !newEvent.validityMonth || !newEvent.validityYear ||
        !newEvent.startTime || !newEvent.endTime || 
        !newEvent.venue || !newEvent.organizer) {
      console.log('❌ Frontend validation failed - missing fields');
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return false;
    }

    console.log('📅 Frontend date validation...');
    
    // Validate day, month, year ranges
    const eventDay = parseInt(newEvent.eventDay);
    const eventMonth = parseInt(newEvent.eventMonth);
    const eventYear = parseInt(newEvent.eventYear);
    const validityDay = parseInt(newEvent.validityDay);
    const validityMonth = parseInt(newEvent.validityMonth);
    const validityYear = parseInt(newEvent.validityYear);
    
    if (eventDay < 1 || eventDay > 31 || eventMonth < 1 || eventMonth > 12 || eventYear < 2024) {
      Alert.alert('Validation Error', 'Please enter a valid event date');
      return false;
    }
    
    if (validityDay < 1 || validityDay > 31 || validityMonth < 1 || validityMonth > 12 || validityYear < 2024) {
      Alert.alert('Validation Error', 'Please enter a valid validity date');
      return false;
    }
    
    // Create date objects
    const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
    const validityDate = new Date(validityYear, validityMonth - 1, validityDay);
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
      const eventDate = `${newEvent.eventYear}-${newEvent.eventMonth.padStart(2, '0')}-${newEvent.eventDay.padStart(2, '0')}`;
      const validityDate = `${newEvent.validityYear}-${newEvent.validityMonth.padStart(2, '0')}-${newEvent.validityDay.padStart(2, '0')}`;
      
      console.log('📅 Combined dates - Event:', eventDate, 'Validity:', validityDate);
      
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: eventDate,
        validityDate: validityDate,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        venue: newEvent.venue,
        organizer: newEvent.organizer,
        requirements: newEvent.requirements ? newEvent.requirements.split(',').map(item => item.trim()) : [],
        prizes: newEvent.prizes ? newEvent.prizes.split(',').map(item => item.trim()) : []
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
      eventDay: '',
      eventMonth: '',
      eventYear: '',
      validityDay: '',
      validityMonth: '',
      validityYear: '',
      startTime: '',
      endTime: '',
      venue: '',
      organizer: '',
      requirements: '',
      prizes: ''
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
    { value: 'Sports & Athletics', label: 'Sports & Athletics', icon: '🏃‍♂️', color: '#10b981' },
    { value: 'Academic & Education', label: 'Academic & Education', icon: '📚', color: '#3b82f6' },
    { value: 'Cultural & Arts', label: 'Cultural & Arts', icon: '🎭', color: '#8b5cf6' },
    { value: 'Technology & IT', label: 'Technology & IT', icon: '💻', color: '#f59e0b' },
    { value: 'Social & Celebration', label: 'Social & Celebration', icon: '🎉', color: '#ec4899' },
    { value: 'Workshop & Training', label: 'Workshop & Training', icon: '🔧', color: '#06b6d4' },
    { value: 'General Meeting', label: 'General Meeting', icon: '👥', color: '#667eea' },
    { value: 'Review Meeting', label: 'Review Meeting', icon: '📋', color: '#059669' },
    { value: 'Orientation Program', label: 'Orientation Program', icon: '🎓', color: '#7c3aed' },
    { value: 'Other', label: 'Other', icon: '📅', color: '#6b7280' },
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
                      style={styles.eventCard}
                    >
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
                        
                        {/* Requirements */}
                        {event.requirements && event.requirements.length > 0 && (
                          <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>📋</Text>
                            <Text style={styles.detailText}>
                              Requirements: {Array.isArray(event.requirements) ? event.requirements.join(', ') : event.requirements}
                            </Text>
                          </View>
                        )}
                        
                        {/* Prizes */}
                        {event.prizes && event.prizes.length > 0 && (
                          <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>🏆</Text>
                            <Text style={styles.detailText}>
                              Prizes: {Array.isArray(event.prizes) ? event.prizes.join(', ') : event.prizes}
                            </Text>
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
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.thirdWidth]}>
                    <TextInput
                      style={styles.textInput}
                      value={newEvent.eventDay}
                      onChangeText={(text) => setNewEvent({...newEvent, eventDay: text})}
                      placeholder="DD"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.helperText}>Day</Text>
                  </View>
                  <View style={[styles.inputGroup, styles.thirdWidth]}>
                    <TextInput
                      style={styles.textInput}
                      value={newEvent.eventMonth}
                      onChangeText={(text) => setNewEvent({...newEvent, eventMonth: text})}
                      placeholder="MM"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.helperText}>Month</Text>
                  </View>
                  <View style={[styles.inputGroup, styles.thirdWidth]}>
                    <TextInput
                      style={styles.textInput}
                      value={newEvent.eventYear}
                      onChangeText={(text) => setNewEvent({...newEvent, eventYear: text})}
                      placeholder="YYYY"
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <Text style={styles.helperText}>Year</Text>
                  </View>
                </View>
              </View>

              {/* Time */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Start Time *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newEvent.startTime}
                    onChangeText={(text) => setNewEvent({...newEvent, startTime: text})}
                    placeholder="e.g., 9:00 AM"
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>End Time *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newEvent.endTime}
                    onChangeText={(text) => setNewEvent({...newEvent, endTime: text})}
                    placeholder="e.g., 4:00 PM"
                  />
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
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.thirdWidth]}>
                    <TextInput
                      style={styles.textInput}
                      value={newEvent.validityDay}
                      onChangeText={(text) => setNewEvent({...newEvent, validityDay: text})}
                      placeholder="DD"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.helperText}>Day</Text>
                  </View>
                  <View style={[styles.inputGroup, styles.thirdWidth]}>
                    <TextInput
                      style={styles.textInput}
                      value={newEvent.validityMonth}
                      onChangeText={(text) => setNewEvent({...newEvent, validityMonth: text})}
                      placeholder="MM"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.helperText}>Month</Text>
                  </View>
                  <View style={[styles.inputGroup, styles.thirdWidth]}>
                    <TextInput
                      style={styles.textInput}
                      value={newEvent.validityYear}
                      onChangeText={(text) => setNewEvent({...newEvent, validityYear: text})}
                      placeholder="YYYY"
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <Text style={styles.helperText}>Year</Text>
                  </View>
                </View>
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

              {/* Requirements */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Requirements (comma-separated)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newEvent.requirements}
                  onChangeText={(text) => setNewEvent({...newEvent, requirements: text})}
                  placeholder="e.g., Sports uniform, Water bottle"
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Prizes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prizes (comma-separated)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newEvent.prizes}
                  onChangeText={(text) => setNewEvent({...newEvent, prizes: text})}
                  placeholder="e.g., Trophies, Certificates"
                  multiline
                  numberOfLines={2}
                />
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

}); 