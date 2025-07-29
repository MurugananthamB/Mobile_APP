import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Bell, Calendar, X, AlertCircle, Award, BookOpen } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
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
    marginRight: 10,
  },
  noticeInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  noticeAuthor: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  noticePriority: {
    marginLeft: 10,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  noticeSummary: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
},
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    marginTop: 5,
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    flexShrink: 1,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 10,
    flexShrink: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalInfo: {
    marginBottom: 15,
  },
  modalAuthor: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 5,
  },
  modalDate: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  modalBody: {
    flexGrow: 0,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
});

export default function NoticesScreen() {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const noticesData = [
    
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
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notices</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
                  <Calendar size={14} color='#6b7280' />
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
          animationType='slide'
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
                      <X size={24} color='#6b7280' />
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