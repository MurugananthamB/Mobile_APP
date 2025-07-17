import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Phone, MapPin, User, Calendar, BookOpen, Award, CreditCard as Edit3 } from 'lucide-react-native';

export default function ProfileScreen() {
  const studentInfo = {
    name: 'John Doe',
    rollNo: '15',
    class: '10-A',
    section: 'A',
    admissionNo: 'ST2023001',
    dateOfBirth: '15/05/2008',
    bloodGroup: 'B+',
    email: 'john.doe@school.edu',
    phone: '+91 9876543210',
    address: '123 Main Street, City, State - 400001',
    parentName: 'Robert Doe',
    parentPhone: '+91 9876543211',
    emergencyContact: '+91 9876543212',
  };

  const academicInfo = [
    { label: 'Current CGPA', value: '8.5' },
    { label: 'Attendance', value: '92%' },
    { label: 'Total Subjects', value: '8' },
    { label: 'Academic Year', value: '2023-24' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.profileImage}
            />
            <Text style={styles.studentName}>{studentInfo.name}</Text>
            <Text style={styles.studentDetails}>
              Class {studentInfo.class} • Roll No: {studentInfo.rollNo}
            </Text>
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={16} color="#ffffff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Admission No</Text>
                  <Text style={styles.infoValue}>{studentInfo.admissionNo}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Date of Birth</Text>
                  <Text style={styles.infoValue}>{studentInfo.dateOfBirth}</Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <BookOpen size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Blood Group</Text>
                  <Text style={styles.infoValue}>{studentInfo.bloodGroup}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Award size={20} color="#1e40af" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Section</Text>
                  <Text style={styles.infoValue}>{studentInfo.section}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Academic Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Performance</Text>
          <View style={styles.academicGrid}>
            {academicInfo.map((item, index) => (
              <View key={index} style={styles.academicCard}>
                <Text style={styles.academicValue}>{item.value}</Text>
                <Text style={styles.academicLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Mail size={20} color="#1e40af" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{studentInfo.email}</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Phone size={20} color="#1e40af" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{studentInfo.phone}</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <MapPin size={20} color="#1e40af" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{studentInfo.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Parent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parent Information</Text>
          <View style={styles.parentCard}>
            <View style={styles.parentItem}>
              <User size={20} color="#1e40af" />
              <View style={styles.parentText}>
                <Text style={styles.parentLabel}>Parent Name</Text>
                <Text style={styles.parentValue}>{studentInfo.parentName}</Text>
              </View>
            </View>
            <View style={styles.parentItem}>
              <Phone size={20} color="#1e40af" />
              <View style={styles.parentText}>
                <Text style={styles.parentLabel}>Parent Phone</Text>
                <Text style={styles.parentValue}>{studentInfo.parentPhone}</Text>
              </View>
            </View>
            <View style={styles.parentItem}>
              <Phone size={20} color="#dc2626" />
              <View style={styles.parentText}>
                <Text style={styles.parentLabel}>Emergency Contact</Text>
                <Text style={styles.parentValue}>{studentInfo.emergencyContact}</Text>
              </View>
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
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    marginBottom: 15,
  },
  studentName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  studentDetails: {
    color: '#e2e8f0',
    fontSize: 14,
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  academicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  academicCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  academicValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 5,
  },
  academicLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    marginLeft: 15,
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  parentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  parentText: {
    marginLeft: 15,
    flex: 1,
  },
  parentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  parentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
});