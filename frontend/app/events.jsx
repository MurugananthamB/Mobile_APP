import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Users, Star, Plus } from 'lucide-react-native';
import ApiService from '../services/api';

export default function EventsScreen() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await ApiService.getStoredUserData();
      setUserData(storedUserData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Check if user can add events (management or staff only)
  const canAddEvent = () => {
    if (!userData || !userData.role) return false;
    const userRole = userData.role.toLowerCase();
    return userRole === 'management' || userRole === 'staff';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Events</Text>
              <Text style={styles.headerSubtitle}>4 upcoming events</Text>
            </View>
            {canAddEvent() && (
              <TouchableOpacity style={styles.addButton}>
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>Sports</Text>
              </View>
              <Text style={styles.eventDate}>15 days</Text>
            </View>
            
            <Text style={styles.eventTitle}>Annual Sports Day</Text>
            <Text style={styles.eventDescription}>
              Join us for a day filled with exciting sports competitions, team events, and athletic performances.
            </Text>
            
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Clock size={14} color="#6b7280" />
                  <Text style={styles.detailText}>9:00 AM - 4:00 PM</Text>
                </View>
                <View style={styles.detailItem}>
                  <MapPin size={14} color="#6b7280" />
                  <Text style={styles.detailText}>School Ground</Text>
                </View>
              </View>
              
              <View style={styles.attendanceContainer}>
                <Users size={14} color="#6b7280" />
                <Text style={styles.attendanceText}>
                  250/300 attending
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register Now</Text>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventContent: {
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#ef444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
  },
  eventDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 15,
  },
  eventDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  attendanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 