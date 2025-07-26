import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Calendar, Clock, CheckCircle, Circle, FileText, Plus } from 'lucide-react-native';

export default function HomeworkScreen() {
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
              <Text style={styles.headerTitle}>Homework</Text>
              <Text style={styles.headerSubtitle}>3 pending, 2 completed</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Assignments</Text>
          <View style={styles.homeworkCard}>
            <View style={styles.homeworkHeader}>
              <View style={styles.subjectContainer}>
                <BookOpen size={16} color="#1e40af" />
                <Text style={styles.subjectText}>Mathematics</Text>
              </View>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>HIGH</Text>
              </View>
            </View>
            
            <Text style={styles.homeworkTitle}>Algebra Problems - Chapter 5</Text>
            <Text style={styles.homeworkDescription}>
              Complete exercises 1-20 from page 45. Show all work and submit by Friday.
            </Text>
            
            <View style={styles.homeworkDetails}>
              <View style={styles.detailItem}>
                <Calendar size={14} color="#6b7280" />
                <Text style={styles.detailText}>3 days left</Text>
              </View>
              <View style={styles.detailItem}>
                <Clock size={14} color="#6b7280" />
                <Text style={styles.detailText}>3:00 PM</Text>
              </View>
              <View style={styles.detailItem}>
                <FileText size={14} color="#6b7280" />
                <Text style={styles.detailText}>2 attachments</Text>
              </View>
            </View>
            
            <View style={styles.homeworkFooter}>
              <Text style={styles.teacherText}>Teacher: Mr. Smith</Text>
              <TouchableOpacity style={styles.completeButton}>
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </TouchableOpacity>
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
  addButton: {
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
  homeworkCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeworkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 6,
  },
  priorityBadge: {
    backgroundColor: '#ef444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
  },
  homeworkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  homeworkDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 15,
  },
  homeworkDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
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
  homeworkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teacherText: {
    fontSize: 12,
    color: '#6b7280',
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 