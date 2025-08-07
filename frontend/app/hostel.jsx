import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bed, Users, Clock, MapPin, Phone, Mail, Wifi, Utensils, Shield, Plus, User, Calendar, CalendarDays, Clock3, BookOpen } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export default function HostelScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async () => {
    try {
      // Get stored user data first - this is immediate
      const storedUserData = await ApiService.getStoredUserData();
      
      if (storedUserData) {
        setUserData(storedUserData);
      }

      // Fetch fresh profile data from API in background (optional)
      try {
        const profileResponse = await ApiService.getProfile();
        const combinedUserData = {
          ...storedUserData,
          ...profileResponse.user,
        };
        setUserData(combinedUserData);
      } catch (apiError) {
        console.log('⚠️ API fetch failed, using stored data:', apiError.message);
        // Continue with stored data if API fails
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      Alert.alert('Error', 'Failed to load hostel information');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (!userData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading hostel information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          className="p-6"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Hostel</Text>
              <Text className="text-white opacity-90">GBPS Student Hostel</Text>
            </View>
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center"
                onPress={() => router.push('/schedule')}
              >
                <BookOpen size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center"
                onPress={() => router.push('/hostel-attendance')}
              >
                <Calendar size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        {userData?.isHostelResident ? (
          <>
            {/* Room Information */}
            <View className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Room Information</Text>
              <View className="bg-white rounded-xl p-6 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Bed size={20} color="#1e40af" />
                    <Text className="text-lg font-semibold text-gray-900 ml-2">
                      {userData?.hostelRoom || 'Not assigned'}
                    </Text>
                  </View>
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-700 text-sm font-medium">Occupied</Text>
                  </View>
                </View>
                
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <Users size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">Room Type: {userData?.hostelRoomType || 'Standard'}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">Floor: {userData?.hostelFloor || 'Ground'}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">Check-in: {userData?.hostelCheckIn || 'Not specified'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Facilities */}
            <View className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Available Facilities</Text>
              <View className="bg-white rounded-xl p-6 shadow-sm">
                <View className="grid grid-cols-2 gap-4">
                  <View className="flex-row items-center p-3 bg-blue-50 rounded-lg">
                    <Wifi size={20} color="#1e40af" />
                    <Text className="text-gray-700 ml-2 font-medium">WiFi</Text>
                  </View>
                  <View className="flex-row items-center p-3 bg-green-50 rounded-lg">
                    <Utensils size={20} color="#059669" />
                    <Text className="text-gray-700 ml-2 font-medium">Mess</Text>
                  </View>
                  <View className="flex-row items-center p-3 bg-purple-50 rounded-lg">
                    <Shield size={20} color="#7c3aed" />
                    <Text className="text-gray-700 ml-2 font-medium">Security</Text>
                  </View>
                  <View className="flex-row items-center p-3 bg-orange-50 rounded-lg">
                    <Clock3 size={20} color="#ea580c" />
                    <Text className="text-gray-700 ml-2 font-medium">24/7 Access</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Contact Information</Text>
              <View className="bg-white rounded-xl p-6 shadow-sm">
                <View className="space-y-4">
                  <View className="flex-row items-center">
                    <Phone size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-3">Hostel Office: +91 98765 43210</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Mail size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-3">hostel@gbps.edu.in</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-3">Block A, Ground Floor</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Rules and Regulations */}
            <View className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Rules & Regulations</Text>
              <View className="bg-white rounded-xl p-6 shadow-sm">
                <View className="space-y-3">
                  <View className="flex-row items-start">
                    <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                    <Text className="text-gray-600 flex-1">Curfew time: 10:00 PM</Text>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                    <Text className="text-gray-600 flex-1">Visitors allowed only during visiting hours</Text>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                    <Text className="text-gray-600 flex-1">Maintain cleanliness in rooms</Text>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                    <Text className="text-gray-600 flex-1">Report any issues to hostel office</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          /* Non-Hostel Resident View */
          <View className="p-4">
            <View className="bg-white rounded-xl p-8 shadow-sm items-center">
              <Bed size={48} color="#9ca3af" />
              <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">Not a Hostel Resident</Text>
              <Text className="text-gray-500 text-center mb-6">
                You are not currently registered as a hostel resident. Contact the hostel office for accommodation details.
              </Text>
              <TouchableOpacity 
                className="bg-blue-500 px-6 py-3 rounded-lg"
                onPress={() => Alert.alert('Contact', 'Please contact the hostel office for registration.')}
              >
                <Text className="text-white font-semibold">Contact Hostel Office</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 