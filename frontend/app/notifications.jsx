import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, CheckCircle, Clock, AlertCircle, X, Filter, Search, Eye, EyeOff } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import ApiService from '../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await ApiService.getNotifications();
      
      if (response.success) {
        setNotifications(response.data);
      } else {
        setError(response.message || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadNotifications(true);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await ApiService.markNotificationAsRead(notificationId);
      
      if (response.success) {
        // Update the notification in the local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      } else {
        Alert.alert('Error', 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await ApiService.markAllNotificationsAsRead();
      
      if (response.success) {
        // Update all notifications in the local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        Alert.alert('Success', 'All notifications marked as read');
      } else {
        Alert.alert('Error', 'Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await ApiService.deleteNotification(notificationId);
      
      if (response.success) {
        // Remove the notification from the local state
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
      } else {
        Alert.alert('Error', 'Failed to delete notification');
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#10b981" />;
      case 'warning':
        return <AlertCircle size={20} color="#f59e0b" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      default:
        return <Bell size={20} color="#3b82f6" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !showUnreadOnly || !notification.isRead;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e40af" />
          <Text className="text-gray-500 mt-4">Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !notifications.length) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={48} color="#ef4444" />
          <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">Error Loading Notifications</Text>
          <Text className="text-gray-500 text-center mb-6">{error}</Text>
          <TouchableOpacity 
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => loadNotifications()}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={{ padding: 24 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Notifications</Text>
              <Text className="text-white opacity-90">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </Text>
            </View>
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center"
                onPress={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                {showUnreadOnly ? <EyeOff size={20} color="#ffffff" /> : <Eye size={20} color="#ffffff" />}
              </TouchableOpacity>
              {unreadCount > 0 && (
                <TouchableOpacity 
                  className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center"
                  onPress={markAllAsRead}
                >
                  <CheckCircle size={20} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-white rounded-xl px-3 border border-gray-200">
            <Search size={18} color="#6b7280" style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 py-3 text-base text-gray-900"
              placeholder="Search notifications..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Notifications List */}
        <View className="px-4 pb-4">
          {filteredNotifications.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Bell size={48} color="#9ca3af" />
              <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">
                {searchQuery ? 'No matching notifications' : 'No notifications'}
              </Text>
              <Text className="text-gray-500 text-center">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'You\'re all caught up! Check back later for new updates.'
                }
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notification) => (
              <View 
                key={notification.id} 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: getNotificationColor(notification.type).includes('green') ? '#10b981' :
                               getNotificationColor(notification.type).includes('blue') ? '#3b82f6' :
                               getNotificationColor(notification.type).includes('yellow') ? '#f59e0b' :
                               getNotificationColor(notification.type).includes('red') ? '#ef4444' : '#e5e7eb',
                  borderLeftWidth: !notification.isRead ? 4 : 1,
                  borderLeftColor: !notification.isRead ? '#3b82f6' : 'transparent'
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start flex-1">
                    <View className="mt-1 mr-3">
                      {getNotificationIcon(notification.type)}
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </Text>
                      <Text className="text-gray-600 mb-2">
                        {notification.message}
                      </Text>
                      <View className="flex-row items-center">
                        <Clock size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-500 ml-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </Text>
                        {!notification.isRead && (
                          <View className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </View>
                    </View>
                  </View>
                  <View className="flex-row space-x-2">
                    {!notification.isRead && (
                      <TouchableOpacity 
                        className="p-2"
                        onPress={() => markAsRead(notification.id)}
                      >
                        <CheckCircle size={16} color="#10b981" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      className="p-2"
                      onPress={() => {
                        Alert.alert(
                          'Delete Notification',
                          'Are you sure you want to delete this notification?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Delete', 
                              style: 'destructive',
                              onPress: () => deleteNotification(notification.id)
                            }
                          ]
                        );
                      }}
                    >
                      <X size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 