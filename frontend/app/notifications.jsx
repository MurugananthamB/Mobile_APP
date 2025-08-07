import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, ArrowLeft, Check, ChevronRight } from 'lucide-react-native';
import ApiService from '../services/api';
import { tw } from '../utils/tailwind';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await ApiService.getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await ApiService.markNotificationAsRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        fetchUnreadCount(); // Refresh unread count
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await ApiService.markAllNotificationsAsRead();
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
        Alert.alert('Success', 'All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Handle navigation based on notification type
    if (notification.type === 'attendance') {
      router.push('/attendance');
    } else if (notification.type === 'homework') {
      router.push('/homework');
    } else if (notification.type === 'results') {
      router.push('/results');
    } else if (notification.type === 'events') {
      router.push('/events');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance':
        return '📊';
      case 'homework':
        return '📚';
      case 'results':
        return '📈';
      case 'events':
        return '🎉';
      case 'general':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-300';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300';
      case 'low':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={tw("flex-1 bg-gray-50")}>
        <View style={tw("flex-1 justify-center items-center")}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={tw("mt-2 text-gray-500")}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw("flex-1 bg-gray-50")}>
      {/* Header */}
      <View style={tw("flex-row items-center justify-between p-4 bg-white border-b border-gray-200")}>
        <TouchableOpacity onPress={() => router.back()} style={tw("p-2")}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={tw("text-xl font-bold text-gray-900")}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} style={tw("p-2")}>
          <Check size={24} color="#1e40af" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={tw("flex-row bg-white border-b border-gray-200")}>
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: 'Read' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setFilter(tab.key)}
            style={tw(`flex-1 py-3 px-4 ${filter === tab.key ? 'border-b-2 border-blue-500' : ''}`)}
          >
            <Text style={tw(`text-center font-medium ${filter === tab.key ? 'text-blue-600' : 'text-gray-500'}`)}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <ScrollView
        style={tw("flex-1")}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={tw("flex-1 justify-center items-center py-20")}>
            <Bell size={48} color="#9ca3af" />
            <Text style={tw("text-lg font-medium text-gray-500 mt-4")}>No notifications</Text>
            <Text style={tw("text-sm text-gray-400 mt-2")}>You're all caught up!</Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification._id}
              onPress={() => handleNotificationPress(notification)}
              style={tw(`p-4 border-b border-gray-100 ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`)}
            >
              <View style={tw("flex-row items-start")}>
                <View style={tw(`w-12 h-12 rounded-full items-center justify-center mr-3 ${getPriorityColor(notification.priority)}`)}>
                  <Text style={tw("text-xl")}>{getNotificationIcon(notification.type)}</Text>
                </View>
                
                <View style={tw("flex-1")}>
                  <View style={tw("flex-row items-center justify-between mb-1")}>
                    <Text style={tw(`font-semibold text-base ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`)}>
                      {notification.title}
                    </Text>
                    {!notification.isRead && (
                      <View style={tw("w-2 h-2 bg-blue-500 rounded-full")} />
                    )}
                  </View>
                  
                  <Text style={tw("text-sm text-gray-600 mb-2")} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  
                  <View style={tw("flex-row items-center justify-between")}>
                    <Text style={tw("text-xs text-gray-400")}>
                      {formatDate(notification.createdAt)}
                    </Text>
                    <ChevronRight size={16} color="#9ca3af" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 