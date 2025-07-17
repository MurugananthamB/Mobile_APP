import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Bell, Calendar, X, CircleAlert as AlertCircle, Info, Award, BookOpen } from 'lucide-react-native';

export default function NoticesScreen() {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const noticesData = [
    {
      id: 1,
      title: 'Annual Sports Day 2024',
      date: '2024-01-28',
      time: '10:00 AM',
      category: 'event',
      priority: 'high',
      summary: 'Join us for the annual sports day celebration with various competitions and activities.',
      content: 'Dear Students and Parents,\n\nWe are excited to announce our Annual Sports Day 2024 scheduled for February 15th, 2024. This event will showcase the athletic talents of our students and promote healthy competition.\n\nEvent Details:\n• Date: February 15th, 2024\n• Time: 9:00 AM - 4:00 PM\n• Venue: School Sports Ground\n• Dress Code: Sports uniform\n\nEvents Include:\n• Track and Field Events\n• Team Sports (Football, Basketball, Cricket)\n• Fun Games and Activities\n• Prize Distribution Ceremony\n\nParents are cordially invited to attend and cheer for their children. Please confirm your participation by February 10th, 2024.\n\nBest regards,\nPhysical Education Department',
      author: 'Sports Department',
      icon: Award,
    },
    {
      id: 2,
      title: 'Parent-Teacher Meeting',
      date: '2024-01-26',
      time: '2:00 PM',
      category: 'meeting',
      priority: 'medium',
      summary: 'Monthly parent-teacher meeting to discuss student progress and academic performance.',
      content: 'Dear Parents,\n\nYou are invited to attend the monthly Parent-Teacher Meeting scheduled for February 5th, 2024.\n\nMeeting Details:\n• Date: February 5th, 2024\n• Time: 2:00 PM - 5:00 PM\n• Venue: Respective Classrooms\n\nAgenda:\n• Review of student academic progress\n• Discussion of individual student performance\n• Feedback on homework and assignments\n• Addressing any concerns or queries\n\nPlease bring your child\'s progress report and any questions you may have. Individual time slots will be allocated to ensure quality discussion.\n\nKindly confirm your attendance by February 2nd, 2024.\n\nThank you,\nAcademic Department',
      author: 'Academic Department',
      icon: BookOpen,
    },
    {
      id: 3,
      title: 'School Closure - National Holiday',
      date: '2024-01-25',
      time: '8:00 AM',
      category: 'announcement',
      priority: 'high',
      summary: 'School will remain closed on Republic Day (January 26th, 2024) in observance of the national holiday.',
      content: 'Dear Students and Parents,\n\nPlease be informed that the school will remain closed on January 26th, 2024, in observance of Republic Day - a national holiday.\n\nImportant Information:\n• School will be closed on January 26th, 2024\n• Regular classes will resume on January 27th, 2024\n• All school activities and events scheduled for this day are postponed\n• School transport will not be available\n\nWe encourage all students and families to participate in Republic Day celebrations and reflect on the significance of this important national day.\n\nRegular academic activities will resume as per the normal schedule from January 27th, 2024.\n\nJai Hind!\n\nSchool Administration',
      author: 'Administration',
      icon: AlertCircle,
    },
    {
      id: 4,
      title: 'New Library Books Available',
      date: '2024-01-24',
      time: '11:00 AM',
      category: 'information',
      priority: 'low',
      summary: 'Latest collection of books has been added to the school library. Students can now borrow them.',
      content: 'Dear Students,\n\nWe are pleased to inform you that a new collection of books has been added to our school library.\n\nNew Additions Include:\n• Fiction novels from popular authors\n• Science and technology reference books\n• History and geography textbooks\n• Mathematics problem-solving guides\n• English literature classics\n\nLibrary Guidelines:\n• Books can be borrowed for up to 2 weeks\n• Maximum 3 books per student at a time\n• Late return fee: ₹5 per day per book\n• Handle books with care to avoid damage\n\nLibrary Hours:\n• Monday to Friday: 8:00 AM - 4:00 PM\n• Saturday: 9:00 AM - 1:00 PM\n• Sunday: Closed\n\nWe encourage all students to make good use of these resources to enhance their learning experience.\n\nHappy Reading!\n\nLibrary Staff',
      author: 'Library Department',
      icon: BookOpen,
    },
    {
      id: 5,
      title: 'Science Exhibition 2024',
      date: '2024-01-23',
      time: '9:00 AM',
      category: 'event',
      priority: 'medium',
      summary: 'Students are invited to participate in the annual science exhibition showcasing innovative projects.',
      content: 'Dear Students,\n\nWe are excited to announce the Annual Science Exhibition 2024, where students can showcase their innovative scientific projects and experiments.\n\nExhibition Details:\n• Date: March 1st, 2024\n• Time: 9:00 AM - 3:00 PM\n• Venue: School Auditorium and Science Labs\n• Theme: "Innovation for Tomorrow"\n\nParticipation Guidelines:\n• Open to all students from grades 6-12\n• Individual or group projects (max 3 members)\n• Project submission deadline: February 20th, 2024\n• Presentation time: 10 minutes per project\n\nPrize Categories:\n• Best Innovation Award\n• Most Creative Project\n• Best Presentation\n• People\'s Choice Award\n\nRegistration:\nInterested students should register with their science teachers by February 15th, 2024.\n\nLet\'s celebrate the spirit of scientific inquiry and innovation!\n\nScience Department',
      author: 'Science Department',
      icon: Award,
    },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'event': return '#10b981';
      case 'meeting': return '#3b82f6';
      case 'announcement': return '#ef4444';
      case 'information': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const openNoticeModal = (notice) => {
    setSelectedNotice(notice);
    setModalVisible(true);
  };

  const closeNoticeModal = () => {
    setModalVisible(false);
    setSelectedNotice(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Bell size={24} color="#1e40af" />
            <Text style={styles.headerTitle}>Notices</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Notices List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notices</Text>
          {noticesData.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              style={styles.noticeCard}
              onPress={() => openNoticeModal(notice)}
            >
              <View style={styles.noticeHeader}>
                <View style={styles.noticeIcon}>
                  <notice.icon size={20} color={getCategoryColor(notice.category)} />
                </View>
                <View style={styles.noticeInfo}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.noticeAuthor}>by {notice.author}</Text>
                </View>
                <View style={styles.noticePriority}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(notice.priority) }]} />
                </View>
              </View>
              
              <Text style={styles.noticeSummary}>{notice.summary}</Text>
              
              <View style={styles.noticeFooter}>
                <View style={styles.dateInfo}>
                  <Calendar size={14} color="#6b7280" />
                  <Text style={styles.noticeDate}>{formatDate(notice.date)}</Text>
                  <Text style={styles.noticeTime}>{notice.time}</Text>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(notice.category) }]}>
                  <Text style={styles.categoryText}>{notice.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notice Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeNoticeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedNotice && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <selectedNotice.icon size={24} color={getCategoryColor(selectedNotice.category)} />
                      <Text style={styles.modalTitle}>{selectedNotice.title}</Text>
                    </View>
                    <TouchableOpacity onPress={closeNoticeModal} style={styles.closeButton}>
                      <X size={24} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalAuthor}>by {selectedNotice.author}</Text>
                    <Text style={styles.modalDate}>{formatDate(selectedNotice.date)} at {selectedNotice.time}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedNotice.category) }]}>
                      <Text style={styles.categoryText}>{selectedNotice.category}</Text>
                    </View>
                  </View>
                  
                  <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                    <Text style={styles.modalText}>{selectedNotice.content}</Text>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
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
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noticeInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  noticeAuthor: {
    fontSize: 12,
    color: '#6b7280',
  },
  noticePriority: {
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noticeSummary: {
    fontSize: 14,
    color: '#374751',
    lineHeight: 20,
    marginBottom: 12,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeDate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 5,
  },
  noticeTime: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 5,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  modalInfo: {
    marginBottom: 20,
  },
  modalAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  modalDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  modalBody: {
    flex: 1,
  },
  modalText: {
    fontSize: 14,
    color: '#374751',
    lineHeight: 22,
  },
});