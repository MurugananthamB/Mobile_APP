import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, CheckCircle, Clock, AlertCircle, X, Filter, Search, Eye, EyeOff, Calendar, ArrowRight } from 'lucide-react-native';
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
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'success':
        return '#ecfdf5';
      case 'warning':
        return '#fffbeb';
      case 'error':
        return '#fef2f2';
      default:
        return '#eff6ff';
    }
  };

  const handleNotificationPress = (notification) => {
    // Extract date from notification message or title
    const dateMatch = notification.message.match(/(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
    
    if (dateMatch) {
      let dateStr = dateMatch[0];
      
      // Convert date format if needed
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Navigate to attendance page with the specific date
      router.push({
        pathname: '/(tabs)/attendance',
        params: { selectedDate: dateStr }
      });
    } else {
      // If no date found, show notification details
      Alert.alert(
        notification.title,
        notification.message,
        [{ text: 'OK' }]
      );
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 16 }}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !notifications.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 16, marginBottom: 8 }}>Error Loading Notifications</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>{error}</Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={() => loadNotifications()}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{ padding: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Notifications</Text>
              <Text style={{ color: 'white', opacity: 0.9, marginTop: 4 }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                {showUnreadOnly ? <EyeOff size={20} color="#ffffff" /> : <Eye size={20} color="#ffffff" />}
              </TouchableOpacity>
              {unreadCount > 0 && (
                <TouchableOpacity 
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={markAllAsRead}
                >
                  <CheckCircle size={20} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={{ padding: 16 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Search size={18} color="#6b7280" style={{ marginRight: 12 }} />
            <TextInput
              style={{ flex: 1, fontSize: 16, color: '#1f2937' }}
              placeholder="Search notifications..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Notifications List */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          {filteredNotifications.length === 0 ? (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 32,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <Bell size={48} color="#9ca3af" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 16, marginBottom: 8 }}>
                {searchQuery ? 'No matching notifications' : 'No notifications'}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'You\'re all caught up! Check back later for new updates.'
                }
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.id}
                style={{
                  backgroundColor: getNotificationBgColor(notification.type),
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: getNotificationColor(notification.type) + '20',
                  borderLeftWidth: !notification.isRead ? 4 : 1,
                  borderLeftColor: !notification.isRead ? getNotificationColor(notification.type) : 'transparent',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
                    <View style={{ marginTop: 2, marginRight: 12 }}>
                      {getNotificationIcon(notification.type)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
                        {notification.title}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 12, lineHeight: 20 }}>
                        {notification.message}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Clock size={14} color="#6b7280" />
                          <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </Text>
                          {!notification.isRead && (
                            <View style={{
                              width: 8,
                              height: 8,
                              backgroundColor: getNotificationColor(notification.type),
                              borderRadius: 4,
                              marginLeft: 8,
                            }} />
                          )}
                        </View>
                        <ArrowRight size={16} color={getNotificationColor(notification.type)} />
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {!notification.isRead && (
                      <TouchableOpacity 
                        style={{ padding: 4 }}
                        onPress={() => markAsRead(notification.id)}
                      >
                        <CheckCircle size={16} color="#10b981" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={{ padding: 4 }}
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
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 