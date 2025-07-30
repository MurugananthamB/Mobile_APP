// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL for your backend
// For React Native, use your computer's IP address instead of localhost
const BASE_URL = __DEV__ 
  ? 'http://192.168.101.45:5000/api'  // Your computer's IP address
  : 'https://your-production-api.com/api'; // Production

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  // Generic method to make API calls
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
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
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('📡 Response status:', response.status);
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

  // Upload profile image
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

      const formData = new FormData();
      
      // Platform-specific file handling
      if (Platform.OS === 'web') {
        console.log('📤 Web platform detected, handling file upload');
        
        try {
          // For web, we need to fetch the file from the blob URL
          console.log('📤 Fetching blob from URI:', imageUri);
          const response = await fetch(imageUri);
          console.log('📤 Fetch response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.status}`);
          }
          
          const blob = await response.blob();
          console.log('📤 Blob created:', {
            size: blob.size,
            type: blob.type
          });
          
          const imageFile = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
          console.log('📤 Web file created:', {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type
          });
          
          formData.append('profileImage', imageFile);
          console.log('📤 FormData appended with web file');
        } catch (webError) {
          console.error('❌ Web file processing error:', webError);
          throw new Error(`Failed to process web file: ${webError.message}`);
        }
      } else {
        // Mobile platform
        const imageFile = {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile-image.jpg',
        };
        
        console.log('📤 Mobile image file object:', imageFile);
        formData.append('profileImage', imageFile);
      }

      console.log('📤 FormData created');
      console.log('📤 FormData entries count:', formData._parts ? formData._parts.length : 'Unknown');
      
      // Debug FormData contents
      if (formData._parts) {
        console.log('📤 FormData parts:', formData._parts);
      }

      const token = await this.getStoredToken();
      console.log('🔑 Token available for upload:', !!token);
      console.log('🔑 Token length:', token ? token.length : 0);
      
      const uploadUrl = `${this.baseURL}/protected/profile/image`;
      console.log('📤 Upload URL:', uploadUrl);

      const requestConfig = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Remove Content-Type header for FormData
        },
        body: formData,
      };

      console.log('📤 Request config:', {
        method: requestConfig.method,
        headers: requestConfig.headers,
        hasBody: !!requestConfig.body
      });

      const response = await fetch(uploadUrl, requestConfig);

      console.log('📤 Upload response status:', response.status);
      console.log('📤 Upload response status text:', response.statusText);
      console.log('📤 Upload response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.log('❌ Could not parse error response as JSON');
          const textResponse = await response.text();
          console.log('❌ Text response:', textResponse);
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('❌ Upload failed:', errorData);
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('❌ Upload error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
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

  async getAttendanceStats() {
    return await this.makeRequest('/attendance/stats');
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
  async testConnection() {
    try {
      const response = await fetch(this.baseURL.replace('/api', ''));
      return response.ok;
    } catch (error) {
      return false;
    }
  }

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
}

export default new ApiService(); 