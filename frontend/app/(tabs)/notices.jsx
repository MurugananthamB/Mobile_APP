import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  SafeAreaView,
  Alert,
  Image,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Calendar,
  Paperclip,
  File,
  ImageIcon,
  Trash2,
  Download,
  Bell,
  X,
  AlertCircle,
  Award,
  BookOpen,
  Clock,
  User,
  ChevronDown
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ApiService from '../../services/api';
import { isManagement, canAddNotice } from '../../utils/roleUtils';

export default function NoticesScreen() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    class: '',
    section: '',
    attachments: []
  });

  // Class and Section options
  const classOptions = [
    { value: '', label: 'All Classes' },
    { value: 'Nursery', label: 'Nursery' },
    { value: 'LKG', label: 'LKG' },
    { value: 'UKG', label: 'UKG' },
    { value: 'Grade 1', label: 'Grade 1' },
    { value: 'Grade 2', label: 'Grade 2' },
    { value: 'Grade 3', label: 'Grade 3' },
    { value: 'Grade 4', label: 'Grade 4' },
    { value: 'Grade 5', label: 'Grade 5' },
    { value: 'Grade 6', label: 'Grade 6' },
    { value: 'Grade 7', label: 'Grade 7' },
    { value: 'Grade 8', label: 'Grade 8' },
    { value: 'Grade 9', label: 'Grade 9' },
    { value: 'Grade 10', label: 'Grade 10' },
    { value: 'Grade 11', label: 'Grade 11' },
    { value: 'Grade 12', label: 'Grade 12' },
  ];

  const sectionOptions = [
    { value: '', label: 'All Sections' },
    { value: 'Section A', label: 'Section A' },
    { value: 'Section B', label: 'Section B' },
    { value: 'Section C', label: 'Section C' },
    { value: 'Section D', label: 'Section D' },
    { value: 'Section E', label: 'Section E' },
    { value: 'Section F', label: 'Section F' },
    { value: 'Section G', label: 'Section G' },
    { value: 'Section H', label: 'Section H' },
  ];

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNotices();
      if (response.success) {
        setNotices(response.data);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      Alert.alert('Error', 'Failed to fetch circulars');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  };

  const resetForm = () => {
    setNewNotice({
      title: '',
      content: '',
      targetAudience: 'all',
      class: '',
      section: '',
      attachments: []
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

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
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

  // Filter notices based on search query and selected date
  const filteredNotices = notices.filter(notice => {
    const noticeDate = new Date(notice.publishDate);
    // Always filter by selected date
    if (!isSameDay(noticeDate, selectedDate)) {
      return false;
    }
    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notice.title.toLowerCase().includes(query) ||
        notice.content.toLowerCase().includes(query) ||
        notice.publishedBy.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Attachment handling
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
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

        setNewNotice(prev => ({
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

        setNewNotice(prev => ({
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
    setNewNotice(prev => ({
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
            Alert.alert(
              'Download Complete', 
              `File "${attachment.name}" has been downloaded to your device.`,
              [{ text: 'OK' }]
            );
          }
        } else {
          Alert.alert('Download Failed', 'Unable to download the file. Please try again.');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Error', 'Failed to download the file. Please try again.');
    }
  };

  const handleAddNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const noticeData = {
        title: newNotice.title,
        content: newNotice.content,
        targetAudience: newNotice.targetAudience,
        class: newNotice.class,
        section: newNotice.section,
        attachments: newNotice.attachments
      };

      const response = await ApiService.createNotice(noticeData);
      if (response.success) {
        Alert.alert('Success', 'Circular created successfully');
        setShowModal(false);
        resetForm();
        fetchNotices();
      } else {
        Alert.alert('Error', response.message || 'Failed to create circular');
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      Alert.alert('Error', 'Failed to create circular');
    }
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const renderNoticeCard = (notice) => (
    <View key={notice._id} style={styles.noticeCard}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.noticeCardGradient}
      >
        <View style={styles.noticeHeader}>
          <View style={styles.noticeIconContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.noticeIconGradient}
            >
              <Bell size={20} color="#ffffff" />
            </LinearGradient>
          </View>
          <View style={styles.noticeInfo}>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <View style={styles.noticeMeta}>
              <View style={styles.noticeAuthorContainer}>
                <User size={12} color="#6b7280" />
                <Text style={styles.noticeAuthor}>{notice.publishedBy}</Text>
              </View>
              <View style={styles.noticeTimeContainer}>
                <Clock size={12} color="#6b7280" />
                <Text style={styles.noticeTime}>{getTimeAgo(notice.publishDate)}</Text>
              </View>
            </View>
          </View>

        </View>
        
        <Text style={styles.noticeSummary} numberOfLines={3}>{notice.content}</Text>
        
        {(notice.targetAudience || notice.class || notice.section) && (
          <View style={styles.noticeDetails}>
            {notice.targetAudience && notice.targetAudience !== 'all' && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Target:</Text>
                <Text style={styles.detailValue}>{notice.targetAudience}</Text>
              </View>
            )}
            {(notice.targetAudience === 'students' && (notice.class || notice.section)) && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>For:</Text>
                <Text style={styles.detailValue}>
                  {notice.class && notice.section ? `${notice.class} - ${notice.section}` : notice.class || notice.section}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {notice.attachments && notice.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={styles.attachmentsTitle}>Attachments</Text>
            <View style={styles.attachmentsContainer}>
              {notice.attachments.map((attachment, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.attachmentCard}
                  onPress={() => downloadAttachment(attachment)}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.attachmentCardGradient}
                  >
                    {attachment.type === 'image' ? (
                      <Image source={{ uri: attachment.uri }} style={styles.attachmentCardImage} />
                    ) : (
                      <View style={styles.attachmentCardDocument}>
                        <File size={20} color="#ffffff" />
                      </View>
                    )}
                    <View style={styles.attachmentCardContent}>
                      <Text style={styles.attachmentCardName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <View style={styles.downloadIndicator}>
                        <Download size={12} color="#ffffff" />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.noticeFooter}>
          <View style={styles.noticeFooterLeft}>
            <View style={styles.dateInfo}>
              <Calendar size={14} color='#6b7280' />
              <Text style={styles.noticeDate}>{formatDate(notice.publishDate)}</Text>
            </View>
          </View>

        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading circulars...</Text>
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Circular</Text>
            <Text style={styles.headerSubtitle}>Stay updated with announcements</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => setShowSearch(!showSearch)}
            >
              <Search size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <Calendar size={20} color="#ffffff" />
            </TouchableOpacity>
            {isManagement && canAddNotice && (
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setShowModal(true)}
              >
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search circular..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      )}

      {/* Date Selector */}
      <TouchableOpacity 
        style={styles.dateSelector}
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.dateSelectorGradient}
        >
          <Calendar size={16} color="#667eea" />
          <Text style={styles.dateSelectorText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Calendar Overlay */}
      {showCalendar && (
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarContainer}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.calendarGradient}
            >
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => handleMonthChange('prev')} style={styles.calendarNavButton}>
                  <Text style={styles.calendarNavText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>{formatMonthYear(currentMonth)}</Text>
                <TouchableOpacity onPress={() => handleMonthChange('next')} style={styles.calendarNavButton}>
                  <Text style={styles.calendarNavText}>›</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.calendarDaysHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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
                  const hasNotices = notices.some(notice => 
                    isSameDay(new Date(notice.publishDate), date)
                  );
                  const isSelected = isSameDay(date, selectedDate);
                  
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                      onPress={() => handleDateSelect(day)}
                    >
                      <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>
                        {day}
                      </Text>
                      {hasNotices && <View style={styles.calendarDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Notices List */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {`${selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} Circular`}
            </Text>
            <Text style={styles.sectionSubtitle}>
              Important announcements and updates
            </Text>
          </View>
          
          {filteredNotices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={['#f3f4f6', '#e5e7eb']}
                style={styles.emptyGradient}
              >
                <Bell size={48} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No circular found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Try adjusting your search terms' : 'No circular for this date'}
                </Text>
              </LinearGradient>
            </View>
          ) : (
            filteredNotices.map(renderNoticeCard)
          )}
        </View>
      </ScrollView>

      {/* Add Notice Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCloseButton}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>Create New Circular</Text>
              <Text style={styles.modalSubtitle}>Share important announcements</Text>
            </View>
            <TouchableOpacity onPress={handleAddNotice} style={styles.modalSaveButton}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContentWrapper}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={newNotice.title}
                onChangeText={(text) => setNewNotice(prev => ({ ...prev, title: text }))}
                placeholder="Enter circular title"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Content *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newNotice.content}
                onChangeText={(text) => setNewNotice(prev => ({ ...prev, content: text }))}
                placeholder="Enter circular content"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />
            </View>



            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Audience</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[styles.pickerOption, newNotice.targetAudience === 'all' && styles.pickerOptionSelected]}
                  onPress={() => setNewNotice(prev => ({ 
                    ...prev, 
                    targetAudience: 'all',
                    class: '',
                    section: ''
                  }))}
                >
                  <Text style={[styles.pickerOptionText, newNotice.targetAudience === 'all' && styles.pickerOptionTextSelected]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, newNotice.targetAudience === 'students' && styles.pickerOptionSelected]}
                  onPress={() => setNewNotice(prev => ({ ...prev, targetAudience: 'students' }))}
                >
                  <Text style={[styles.pickerOptionText, newNotice.targetAudience === 'students' && styles.pickerOptionTextSelected]}>
                    Students
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerOption, newNotice.targetAudience === 'staff' && styles.pickerOptionSelected]}
                  onPress={() => setNewNotice(prev => ({ 
                    ...prev, 
                    targetAudience: 'staff',
                    class: '',
                    section: ''
                  }))}
                >
                  <Text style={[styles.pickerOptionText, newNotice.targetAudience === 'staff' && styles.pickerOptionTextSelected]}>
                    Staff
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {(newNotice.targetAudience === 'students') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Class & Section (Optional)</Text>
                <View style={styles.classSectionContainer}>
                  <View style={styles.classSectionField}>
                    <Text style={styles.classSectionLabel}>Class</Text>
                    <TouchableOpacity
                      style={[styles.selectInput, !newNotice.class && styles.selectInputPlaceholder]}
                      onPress={() => setShowClassPicker(true)}
                    >
                      <Text style={[styles.selectInputText, !newNotice.class && styles.selectInputPlaceholderText]}>
                        {newNotice.class ? `Class ${newNotice.class}` : 'Select Class'}
                      </Text>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.classSectionField}>
                    <Text style={styles.classSectionLabel}>Section</Text>
                    <TouchableOpacity
                      style={[styles.selectInput, !newNotice.section && styles.selectInputPlaceholder]}
                      onPress={() => setShowSectionPicker(true)}
                    >
                      <Text style={[styles.selectInputText, !newNotice.section && styles.selectInputPlaceholderText]}>
                        {newNotice.section ? `Section ${newNotice.section}` : 'Select Section'}
                      </Text>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

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
              
              {newNotice.attachments.length > 0 && (
                <View style={styles.attachmentsList}>
                  {newNotice.attachments.map((attachment, index) => (
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
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Class Picker Modal */}
      <Modal
        visible={showClassPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setShowClassPicker(false)} style={styles.modalCloseButton}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Class</Text>
            <TouchableOpacity onPress={() => {
              setNewNotice(prev => ({ ...prev, class: newNotice.class }));
              setShowClassPicker(false);
            }} style={styles.modalSaveButton}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.pickerContainer}>
              {classOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.pickerOption, newNotice.class === option.value && styles.pickerOptionSelected]}
                  onPress={() => setNewNotice(prev => ({ ...prev, class: option.value }))}
                >
                  <Text style={[styles.pickerOptionText, newNotice.class === option.value && styles.pickerOptionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Section Picker Modal */}
      <Modal
        visible={showSectionPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setShowSectionPicker(false)} style={styles.modalCloseButton}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Section</Text>
            <TouchableOpacity onPress={() => {
              setNewNotice(prev => ({ ...prev, section: newNotice.section }));
              setShowSectionPicker(false);
            }} style={styles.modalSaveButton}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.pickerContainer}>
              {sectionOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.pickerOption, newNotice.section === option.value && styles.pickerOptionSelected]}
                  onPress={() => setNewNotice(prev => ({ ...prev, section: option.value }))}
                >
                  <Text style={[styles.pickerOptionText, newNotice.section === option.value && styles.pickerOptionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
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
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  dateSelector: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dateSelectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  calendarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarGradient: {
    borderRadius: 16,
    padding: 15,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#667eea',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
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
    position: 'relative',
  },
  calendarDaySelected: {
    backgroundColor: '#667eea',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  calendarDayTextSelected: {
    color: '#ffffff',
  },
  calendarDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    paddingVertical: 40,
  },
  emptyGradient: {
    alignItems: 'center',
    paddingVertical: 60,
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  noticeCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  noticeCardGradient: {
    borderRadius: 20,
    padding: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  noticeIconContainer: {
    marginRight: 15,
  },
  noticeIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  noticeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  noticeAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noticeAuthor: {
    fontSize: 12,
    color: '#6b7280',
  },
  noticeTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noticeTime: {
    fontSize: 12,
    color: '#6b7280',
  },

  noticeSummary: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 15,
    lineHeight: 20,
  },
  noticeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  attachmentsSection: {
    marginBottom: 15,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  attachmentsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  attachmentCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    width: '100%',
  },
  attachmentCardGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachmentCardImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  attachmentCardDocument: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentCardName: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'left',
    marginBottom: 4,
    fontWeight: '500',
  },
  downloadIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  noticeFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  modalSaveButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalContentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1f2937',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectInputText: {
    fontSize: 16,
    color: '#374151',
  },
  selectInputPlaceholder: {
    borderColor: '#d1d5db',
  },
  selectInputPlaceholderText: {
    color: '#9ca3af',
  },
  classSectionContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  classSectionField: {
    flex: 1,
    minHeight: 70,
  },
  classSectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  pickerOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  attachmentButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attachmentButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  attachmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  attachmentsList: {
    gap: 10,
  },
  attachmentItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  attachmentItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  attachmentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  attachmentDocument: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeAttachmentButton: {
    padding: 4,
  },
});