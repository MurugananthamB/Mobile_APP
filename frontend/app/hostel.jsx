import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bed, Users, Clock, MapPin, Phone, Mail, Wifi, Utensils, Shield, Plus } from 'lucide-react-native';

export default function HostelScreen() {
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
              <Text style={styles.headerTitle}>Hostel</Text>
              <Text style={styles.headerSubtitle}>GBPS Student Hostel</Text>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Phone size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Information</Text>
          <View style={styles.roomCard}>
            <View style={styles.roomHeader}>
              <View style={styles.roomNumberContainer}>
                <Bed size={20} color="#1e40af" />
                <Text style={styles.roomNumber}>A-15</Text>
              </View>
              <View style={styles.roomStatus}>
                <Text style={styles.roomStatusText}>Occupied</Text>
              </View>
            </View>
            
            <View style={styles.roomDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Floor:</Text>
                <Text style={styles.detailValue}>1st Floor</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Block:</Text>
                <Text style={styles.detailValue}>Block A</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Capacity:</Text>
                <Text style={styles.detailValue}>2/2</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Facilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.facilitiesGrid}>
            <View style={styles.facilityCard}>
              <View style={styles.facilityIcon}>
                <Wifi size={24} color="#10b981" />
              </View>
              <Text style={styles.facilityName}>Wi-Fi</Text>
              <Text style={styles.facilityDescription}>High-speed internet</Text>
            </View>
            <View style={styles.facilityCard}>
              <View style={styles.facilityIcon}>
                <Utensils size={24} color="#10b981" />
              </View>
              <Text style={styles.facilityName}>Mess</Text>
              <Text style={styles.facilityDescription}>3 meals daily</Text>
            </View>
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
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  roomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  roomNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginLeft: 8,
  },
  roomStatus: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  roomDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facilityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityIcon: {
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  facilityDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
}); 