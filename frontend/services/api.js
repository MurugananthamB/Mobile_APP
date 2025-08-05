// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL for your backend
// For React Native, use your computer's IP address instead of localhost
const BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development backend URL
  : 'https://mobile-app-5diq.onrender.com/api'; // Production backend URL

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  // Generic method to make API calls
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('🌐 Full URL being called:', url);
      console.log('🔧 Base URL:', this.baseURL);
      console.log('📍 Endpoint:', endpoint);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // ✅ Required for cookie/session-based auth
  ...options
      };

      // Add token to headers if available
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔑 Auth token available:', !!token);
      console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'None');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token added to headers');
        console.log('📋 Authorization header:', config.headers.Authorization ? 'Present' : 'Missing');
      } else {
        console.log('⚠️ No auth token found');
      }

      console.log('Making API request to:', url);
      console.log('📝 Request config:', {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body ? 'Present' : 'None'
      });
      
      console.log('🚀 Starting fetch request...');
      const response = await fetch(url, config);
      console.log('📡 Raw response received:', response);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response status text:', response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        console.log('❌ API request failed:', response.status, data);
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ API request successful');
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your internet connection and ensure the backend server is running.');
      }
      
      throw error;
    }
  }

  // =============== AUTHENTICATION METHODS ===============
  async login(userid, password) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userid, password }),
    });

    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData) {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response;
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  }

  async getStoredToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async getStoredUserData() {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  async isAuthenticated() {
    const token = await this.getStoredToken();
    return !!token;
  }

  async getProfile() {
    return await this.makeRequest('/protected/profile');
  }

  async updateProfile(profileData) {
    return await this.makeRequest('/protected/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Upload profile image (convert to base64 and send to server)
  async uploadProfileImage(imageUri) {
    try {
      console.log('📤 Starting image upload...');
      console.log('📤 Image URI:', imageUri);
      console.log('📤 Image URI type:', typeof imageUri);
      console.log('📤 Platform:', Platform.OS);
      
      // Validate image URI
      if (!imageUri) {
        throw new Error('No image URI provided');
      }

      // Convert image to base64
      let base64Data;
      
      if (Platform.OS === 'web') {
        console.log('📤 Web platform detected, converting blob to base64');
        
        try {
          // For web, fetch the blob and convert to base64
          const response = await fetch(imageUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.status}`);
          }
          
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          base64Data = btoa(String.fromCharCode(...uint8Array));
          base64Data = `data:${blob.type};base64,${base64Data}`;
          
          console.log('📤 Web image converted to base64 (length):', base64Data.length);
        } catch (webError) {
          console.error('❌ Web image processing error:', webError);
          throw new Error(`Failed to process web image: ${webError.message}`);
        }
      } else {
        // Mobile platform - convert image to base64
        console.log('📤 Mobile platform detected, converting image to base64');
        
        try {
          // For React Native with Expo, use expo-file-system
          const FileSystem = require('expo-file-system');
          
          // Get the file path from the URI
          let filePath = imageUri;
          if (typeof imageUri === 'object' && imageUri.uri) {
            filePath = imageUri.uri;
          }
          
          // Read file as base64
          base64Data = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.Base64,
          });
          base64Data = `data:image/jpeg;base64,${base64Data}`;
          
          console.log('📤 Mobile image converted to base64 (length):', base64Data.length);
        } catch (mobileError) {
          console.error('❌ Mobile image processing error:', mobileError);
          throw new Error(`Failed to process mobile image: ${mobileError.message}`);
        }
      }

      console.log('📤 Base64 data prepared');
      
      const token = await this.getStoredToken();
      console.log('🔑 Token available for upload:', !!token);
      
      const uploadUrl = `${this.baseURL}/protected/profile/image`;
      console.log('📤 Upload URL:', uploadUrl);

      const requestConfig = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: base64Data }),
      };

      console.log('📤 Request config:', {
        method: requestConfig.method,
        headers: requestConfig.headers,
        hasBody: !!requestConfig.body
      });

      const response = await fetch(uploadUrl, requestConfig);
      console.log('📤 Response status:', response.status);
      console.log('📤 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Image upload error:', error);
      throw error;
    }
  }

  // Delete profile image
  async deleteProfileImage() {
    try {
      console.log('🗑️ Starting profile image deletion...');
      
      const response = await this.makeRequest('/protected/profile/image', {
        method: 'DELETE',
      });
      
      console.log('🗑️ Delete response:', response);
      return response;
    } catch (error) {
      console.error('🗑️ Profile image deletion error:', error);
      throw error;
    }
  }

  // =============== FEES METHODS ===============
  async getFees() {
    return await this.makeRequest('/fees');
  }

  async getFeesById(id) {
    return await this.makeRequest(`/fees/${id}`);
  }

  async payFees(paymentData) {
    return await this.makeRequest('/fees/pay', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // =============== ATTENDANCE METHODS ===============
  async getAttendance(month, year) {
    const query = month && year ? `?month=${month}&year=${year}` : '';
    return await this.makeRequest(`/attendance${query}`);
  }

  async markAttendance(attendanceData) {
    return await this.makeRequest('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async scanMarkAttendance(userId) {
    return await this.makeRequest('/attendance/scan-mark', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getAttendanceStats() {
    return await this.makeRequest('/attendance/stats');
  }

  // =============== DAY MANAGEMENT METHODS ===============
  async getMarkedDays(month, year) {
    const query = month && year ? `?month=${month}&year=${year}` : '';
    return await this.makeRequest(`/attendance/marked-days${query}`);
  }

  async getDayManagement(month, year) {
    const query = month && year ? `?month=${month}&year=${year}` : '';
    return await this.makeRequest(`/attendance/day-management${query}`);
  }

  async addDayManagement(dayData) {
    return await this.makeRequest('/attendance/day-management', {
      method: 'POST',
      body: JSON.stringify(dayData),
    });
  }

  async removeDayManagement(date) {
    return await this.makeRequest(`/attendance/day-management/${date}`, {
      method: 'DELETE',
    });
  }

  async updateDayManagement(date, dayData) {
    return await this.makeRequest(`/attendance/day-management/${date}`, {
      method: 'PUT',
      body: JSON.stringify(dayData),
    });
  }

  // =============== HOMEWORK METHODS ===============
  async getHomework() {
    return await this.makeRequest('/homework');
  }

  async getHomeworkById(id) {
    return await this.makeRequest(`/homework/${id}`);
  }

  async getStaffMembers(subject = null) {
    const endpoint = subject ? `/homework/staff?subject=${encodeURIComponent(subject)}` : '/homework/staff';
    return await this.makeRequest(endpoint);
  }

  async submitHomework(homeworkId, submissionData) {
    return await this.makeRequest(`/homework/${homeworkId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }



  async createHomework(homeworkData) {
    return await this.makeRequest('/homework', {
      method: 'POST',
      body: JSON.stringify(homeworkData),
    });
  }

  // =============== EVENTS METHODS ===============
  async getEvents() {
    console.log('🎯 ApiService.getEvents called');
    try {
      const result = await this.makeRequest('/events');
      console.log('✅ ApiService.getEvents successful:', result);
      return result;
    } catch (error) {
      console.error('❌ ApiService.getEvents failed:', error);
      throw error;
    }
  }

  async getEventById(id) {
    return await this.makeRequest(`/events/${id}`);
  }

  async registerForEvent(eventId) {
    return await this.makeRequest(`/events/${eventId}/register`, {
      method: 'POST',
    });
  }

  async createEvent(eventData) {
    console.log('🎯 ApiService.createEvent called with:', eventData);
    console.log('🔗 Endpoint: /events');
    console.log('📤 Request body:', JSON.stringify(eventData, null, 2));
    
    try {
      const result = await this.makeRequest('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
      console.log('✅ ApiService.createEvent successful:', result);
      return result;
    } catch (error) {
      console.error('❌ ApiService.createEvent failed:', error);
      throw error;
    }
  }

  async clearAllEvents() {
    return await this.makeRequest('/events/clear', {
      method: 'DELETE',
    });
  }

  // =============== NOTICES METHODS ===============
  async getNotices() {
    return await this.makeRequest('/notices');
  }

  async getNoticeById(id) {
    return await this.makeRequest(`/notices/${id}`);
  }

  async markNoticeAsRead(noticeId) {
    return await this.makeRequest(`/notices/${noticeId}/read`, {
      method: 'PUT',
    });
  }

  async createNotice(noticeData) {
    return await this.makeRequest('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
  }

  // =============== SCHEDULE METHODS ===============
  async getSchedules() {
    return await this.makeRequest('/schedules');
  }

  async getScheduleById(id) {
    return await this.makeRequest(`/schedules/${id}`);
  }

  async createSchedule(scheduleData) {
    return await this.makeRequest('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  async updateSchedule(id, scheduleData) {
    return await this.makeRequest(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  }

  async deleteSchedule(id) {
    return await this.makeRequest(`/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // =============== TIMETABLE METHODS ===============
  async getTimetable() {
    return await this.makeRequest('/timetable');
  }

  async getTimetableByDay(day) {
    return await this.makeRequest(`/timetable/${day}`);
  }

  // =============== RESULTS METHODS ===============
  async getResults() {
    return await this.makeRequest('/results');
  }

  async getResultById(id) {
    return await this.makeRequest(`/results/${id}`);
  }

  // =============== HOSTEL METHODS ===============
  async getHostelInfo() {
    return await this.makeRequest('/hostel/info');
  }

  async getHostelComplaints() {
    return await this.makeRequest('/hostel/complaints');
  }

  async submitHostelComplaint(complaintData) {
    return await this.makeRequest('/hostel/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  }

  async getHostelMenu() {
    return await this.makeRequest('/hostel/menu');
  }

  // =============== UTILITY METHODS ===============

  // Upload file (for homework submissions, etc.)
  async uploadFile(file, type = 'homework') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = await this.getStoredToken();
    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return await response.json();
  }

  // =============== NOTIFICATION METHODS ===============
  async getNotifications(limit = 20, skip = 0, unreadOnly = false) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (skip) params.append('skip', skip);
    if (unreadOnly) params.append('unreadOnly', 'true');
    
    return await this.makeRequest(`/notifications?${params.toString()}`);
  }

  async getUnreadNotificationCount() {
    return await this.makeRequest('/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId) {
    return await this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return await this.makeRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async getNotificationStats(type = null) {
    const params = type ? `?type=${type}` : '';
    return await this.makeRequest(`/notifications/stats${params}`);
  }
}

export default new ApiService(); 