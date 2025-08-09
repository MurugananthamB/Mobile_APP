import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, User, Bell, AlertCircle, CheckCircle, XCircle, MinusCircle, PlusCircle, BookOpen, Home, DollarSign, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/api';

export default function NotificationDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotificationDetails();
  }, []);

  const loadNotificationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!params.notificationId) {
        setError('No notification ID provided');
        return;
      }

      console.log('🔍 Loading notification details for ID:', params.notificationId);
      
      // Get the notification details from the API
      const response = await ApiService.getNotificationById(params.notificationId);
      
      if (response.success) {
        setNotification(response.data);
        console.log('✅ Notification details loaded:', response.data);
      } else {
        setError(response.message || 'Failed to load notification details');
      }
    } catch (error) {
      console.error('❌ Error loading notification details:', error);
      setError('Failed to load notification details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleMarkAsRead = async () => {
    if (!notification || notification.isRead) return;

    try {
      const response = await ApiService.markNotificationAsRead(notification._id);
      if (response.success) {
        setNotification(prev => ({ ...prev, isRead: true }));
        Alert.alert('Success', 'Notification marked as read');
      } else {
        Alert.alert('Error', 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleDeleteNotification = async () => {
    if (!notification) return;

    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteNotification(notification._id);
              if (response.success) {
                Alert.alert('Success', 'Notification deleted successfully');
                router.back();
              } else {
                Alert.alert('Error', 'Failed to delete notification');
              }
            } catch (error) {
              console.error('❌ Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          }
        }
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return Calendar;
      case 'notice':
        return AlertCircle;
      case 'homework':
        return BookOpen;
      case 'schedule':
        return Clock;
      case 'attendance':
        return CheckCircle;
      case 'fees':
        return DollarSign;
      case 'hostel':
        return Home;
      case 'results':
        return TrendingUp;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event':
        return '#3b82f6';
      case 'notice':
        return '#f59e0b';
      case 'homework':
        return '#8b5cf6';
      case 'schedule':
        return '#06b6d4';
      case 'attendance':
        return '#10b981';
      case 'fees':
        return '#f97316';
      case 'hostel':
        return '#84cc16';
      case 'results':
        return '#ec4899';
      default:
        return '#6b7280';
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'event':
        return '#dbeafe';
      case 'notice':
        return '#fef3c7';
      case 'homework':
        return '#ede9fe';
      case 'schedule':
        return '#cffafe';
      case 'attendance':
        return '#d1fae5';
      case 'fees':
        return '#fed7aa';
      case 'hostel':
        return '#dcfce7';
      case 'results':
        return '#fce7f3';
      default:
        return '#f3f4f6';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notification details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNotificationDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Notification not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const IconComponent = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);
  const bgColor = getNotificationBgColor(notification.type);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Details</Text>
          <View style={styles.headerActions}>
            {!notification.isRead && (
              <TouchableOpacity onPress={handleMarkAsRead} style={styles.actionButton}>
                <CheckCircle size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDeleteNotification} style={styles.actionButton}>
              <XCircle size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Notification Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Card */}
        <View style={[styles.notificationCard, { backgroundColor: bgColor }]}>
          <View style={styles.notificationHeader}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
              <IconComponent size={24} color="#ffffff" />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationType}>{notification.type.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: notification.isRead ? '#10b981' : '#f59e0b' }]}>
              <Text style={styles.statusText}>
                {notification.isRead ? 'READ' : 'UNREAD'}
              </Text>
            </View>
          </View>

          <View style={styles.notificationBody}>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
          </View>

          <View style={styles.notificationMeta}>
            <View style={styles.metaItem}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.metaText}>{formatDate(notification.createdAt)}</Text>
            </View>
            {notification.priority && (
              <View style={styles.metaItem}>
                <AlertCircle size={16} color="#6b7280" />
                <Text style={styles.metaText}>Priority: {notification.priority.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: iconColor }]}
            onPress={() => {
              // Navigate to the respective page based on notification type
              switch (notification.type) {
                case 'attendance':
                  // Extract date and navigate to attendance page
                  let dateStr = null;
                  const dateMatch = notification.message.match(/\((\d{4}-\d{2}-\d{2})\)/);
                  if (dateMatch) {
                    dateStr = dateMatch[1];
                  } else {
                    const fallbackMatch = notification.message.match(/(\d{4}-\d{2}-\d{2})/);
                    if (fallbackMatch) {
                      dateStr = fallbackMatch[1];
                    }
                  }
                  
                  if (dateStr) {
                    router.push({
                      pathname: '/(tabs)/attendance',
                      params: { 
                        selectedDate: dateStr,
                        highlightDate: 'true'
                      }
                    });
                  } else {
                    router.push('/(tabs)/attendance');
                  }
                  break;
                case 'event':
                  router.push({
                    pathname: '/events',
                    params: { 
                      eventId: notification.relatedId,
                      highlightEvent: 'true'
                    }
                  });
                  break;
                case 'notice':
                  router.push({
                    pathname: '/notices',
                    params: { 
                      noticeId: notification.relatedId,
                      highlightNotice: 'true'
                    }
                  });
                  break;
                case 'homework':
                  router.push({
                    pathname: '/homework',
                    params: { 
                      homeworkId: notification.relatedId,
                      highlightHomework: 'true'
                    }
                  });
                  break;
                case 'schedule':
                  router.push({
                    pathname: '/schedule',
                    params: { 
                      scheduleId: notification.relatedId,
                      highlightSchedule: 'true'
                    }
                  });
                  break;
                case 'fees':
                  router.push({
                    pathname: '/(tabs)/fees',
                    params: { 
                      feesId: notification.relatedId,
                      highlightFees: 'true'
                    }
                  });
                  break;
                case 'hostel':
                  router.push({
                    pathname: '/hostel',
                    params: { 
                      hostelId: notification.relatedId,
                      highlightHostel: 'true'
                    }
                  });
                  break;
                case 'results':
                  router.push({
                    pathname: '/results',
                    params: { 
                      resultsId: notification.relatedId,
                      highlightResults: 'true'
                    }
                  });
                  break;
                default:
                  Alert.alert('Info', 'No specific action available for this notification type');
              }
            }}
          >
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notificationBody: {
    marginBottom: 15,
  },
  notificationMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  notificationMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
