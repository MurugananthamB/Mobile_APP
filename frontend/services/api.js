// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

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