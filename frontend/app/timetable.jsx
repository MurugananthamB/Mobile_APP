import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, MapPin, User } from 'lucide-react-native';

export default function TimetableScreen() {
  const [currentWeek, setCurrentWeek] = useState(0);

  const timetableData = {
    timeSlots: [
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM',
      '4:00 PM',
    ],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    schedule: {
      Monday: [
        { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Room 101', color: '#3b82f6' },
        { subject: 'English', teacher: 'Ms. Johnson', room: 'Room 102', color: '#10b981' },
        { subject: 'Physics', teacher: 'Dr. Brown', room: 'Lab 201', color: '#f59e0b' },
        { subject: 'Lunch Break', teacher: '', room: '', color: '#6b7280' },
        { subject: 'Chemistry', teacher: 'Ms. Davis', room: 'Lab 202', color: '#ef4444' },
        { subject: 'History', teacher: 'Mr. Wilson', room: 'Room 103', color: '#8b5cf6' },
        { subject: 'Computer Science', teacher: 'Mr. Taylor', room: 'Computer Lab', color: '#06b6d4' },
        { subject: 'Physical Education', teacher: 'Coach Miller', room: 'Playground', color: '#84cc16' },
      ],
      Tuesday: [
        { subject: 'English', teacher: 'Ms. Johnson', room: 'Room 102', color: '#10b981' },
        { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Room 101', color: '#3b82f6' },
        { subject: 'Biology', teacher: 'Dr. Anderson', room: 'Lab 203', color: '#f97316' },
        { subject: 'Lunch Break', teacher: '', room: '', color: '#6b7280' },
        { subject: 'Geography', teacher: 'Ms. Clark', room: 'Room 104', color: '#ec4899' },
        { subject: 'Physics', teacher: 'Dr. Brown', room: 'Lab 201', color: '#f59e0b' },
        { subject: 'Art', teacher: 'Mr. Garcia', room: 'Art Room', color: '#a855f7' },
        { subject: 'Music', teacher: 'Ms. Lee', room: 'Music Room', color: '#14b8a6' },
      ],
      Wednesday: [
        { subject: 'Chemistry', teacher: 'Ms. Davis', room: 'Lab 202', color: '#ef4444' },
        { subject: 'History', teacher: 'Mr. Wilson', room: 'Room 103', color: '#8b5cf6' },
        { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Room 101', color: '#3b82f6' },
        { subject: 'Lunch Break', teacher: '', room: '', color: '#6b7280' },
        { subject: 'English', teacher: 'Ms. Johnson', room: 'Room 102', color: '#10b981' },
        { subject: 'Computer Science', teacher: 'Mr. Taylor', room: 'Computer Lab', color: '#06b6d4' },
        { subject: 'Physical Education', teacher: 'Coach Miller', room: 'Playground', color: '#84cc16' },
        { subject: 'Study Hall', teacher: 'Various', room: 'Library', color: '#6b7280' },
      ],
      Thursday: [
        { subject: 'Biology', teacher: 'Dr. Anderson', room: 'Lab 203', color: '#f97316' },
        { subject: 'Geography', teacher: 'Ms. Clark', room: 'Room 104', color: '#ec4899' },
        { subject: 'Physics', teacher: 'Dr. Brown', room: 'Lab 201', color: '#f59e0b' },
        { subject: 'Lunch Break', teacher: '', room: '', color: '#6b7280' },
        { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Room 101', color: '#3b82f6' },
        { subject: 'English', teacher: 'Ms. Johnson', room: 'Room 102', color: '#10b981' },
        { subject: 'Chemistry', teacher: 'Ms. Davis', room: 'Lab 202', color: '#ef4444' },
        { subject: 'History', teacher: 'Mr. Wilson', room: 'Room 103', color: '#8b5cf6' },
      ],
      Friday: [
        { subject: 'Computer Science', teacher: 'Mr. Taylor', room: 'Computer Lab', color: '#06b6d4' },
        { subject: 'Art', teacher: 'Mr. Garcia', room: 'Art Room', color: '#a855f7' },
        { subject: 'Music', teacher: 'Ms. Lee', room: 'Music Room', color: '#14b8a6' },
        { subject: 'Lunch Break', teacher: '', room: '', color: '#6b7280' },
        { subject: 'Physical Education', teacher: 'Coach Miller', room: 'Playground', color: '#84cc16' },
        { subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Room 101', color: '#3b82f6' },
        { subject: 'English', teacher: 'Ms. Johnson', room: 'Room 102', color: '#10b981' },
        { subject: 'Free Period', teacher: '', room: '', color: '#6b7280' },
      ],
      Saturday: [
        { subject: 'Activity Period', teacher: 'Various', room: 'Various', color: '#84cc16' },
        { subject: 'Library Period', teacher: 'Librarian', room: 'Library', color: '#6b7280' },
        { subject: 'Sports Practice', teacher: 'Coach Miller', room: 'Playground', color: '#84cc16' },
        { subject: 'Lunch Break', teacher: '', room: '', color: '#6b7280' },
        { subject: 'Club Activities', teacher: 'Various', room: 'Various', color: '#a855f7' },
        { subject: 'Study Hall', teacher: 'Various', room: 'Library', color: '#6b7280' },
        { subject: 'Half Day', teacher: '', room: '', color: '#6b7280' },
        { subject: 'Half Day', teacher: '', room: '', color: '#6b7280' },
      ],
    }
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentWeekStart = new Date(today.getTime() - (today.getDay() - 1) * 24 * 60 * 60 * 1000);
    const weekStart = new Date(currentWeekStart.getTime() + currentWeek * 7 * 24 * 60 * 60 * 1000);
    
    const weekDates = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      weekDates.push(date);
    }
    return weekDates;
  };

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => prev + direction);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDates = getCurrentWeekDates();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navButton}>
            <ChevronLeft size={24} color="#1e40af" />
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={styles.weekTitle}>Week View</Text>
            <Text style={styles.weekDates}>
              {formatDate(weekDates[0])} - {formatDate(weekDates[5])}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navButton}>
            <ChevronRight size={24} color="#1e40af" />
          </TouchableOpacity>
        </View>

        {/* Timetable */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timetableContainer}>
          <View style={styles.timetable}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeHeaderText}>Time</Text>
              </View>
              {timetableData.days.map((day, index) => (
                <View key={day} style={[styles.dayColumn, isToday(weekDates[index]) && styles.todayColumn]}>
                  <Text style={[styles.dayHeaderText, isToday(weekDates[index]) && styles.todayText]}>
                    {day}
                  </Text>
                  <Text style={[styles.dateText, isToday(weekDates[index]) && styles.todayText]}>
                    {formatDate(weekDates[index])}
                  </Text>
                </View>
              ))}
            </View>

            {/* Time Slots */}
            {timetableData.timeSlots.map((time, timeIndex) => (
              <View key={timeIndex} style={styles.timeRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeSlotText}>{time}</Text>
                </View>
                {timetableData.days.map((day, dayIndex) => {
                  const subject = timetableData.schedule[day][timeIndex];
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayColumn,
                        styles.subjectCell,
                        { backgroundColor: subject.color + '20' },
                        isToday(weekDates[dayIndex]) && styles.todayColumn
                      ]}
                    >
                      {subject.subject ? (
                        <View style={styles.subjectContent}>
                          <Text style={[styles.subjectName, { color: subject.color }]} numberOfLines={1}>
                            {subject.subject}
                          </Text>
                          {subject.teacher && (
                            <View style={styles.subjectDetails}>
                              <User size={12} color="#6b7280" />
                              <Text style={styles.teacherName} numberOfLines={1}>
                                {subject.teacher}
                              </Text>
                            </View>
                          )}
                          {subject.room && (
                            <View style={styles.subjectDetails}>
                              <MapPin size={12} color="#6b7280" />
                              <Text style={styles.roomName} numberOfLines={1}>
                                {subject.room}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Today's Subjects</Text>
          <View style={styles.legendItems}>
            {timetableData.schedule.Monday.slice(0, 6).map((subject, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: subject.color }]} />
                <Text style={styles.legendText}>{subject.subject}</Text>
              </View>
            ))}
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
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  navButton: {
    padding: 10,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  weekDates: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  timetableContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  timetable: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  timeColumn: {
    width: 80,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  dayColumn: {
    width: 120,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  todayColumn: {
    backgroundColor: '#dbeafe',
  },
  timeHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 10,
    color: '#6b7280',
  },
  todayText: {
    color: '#1e40af',
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  timeSlotText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  subjectCell: {
    minHeight: 70,
    padding: 8,
  },
  subjectContent: {
    flex: 1,
  },
  subjectName: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  subjectDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 9,
    color: '#6b7280',
    marginLeft: 2,
  },
  roomName: {
    fontSize: 9,
    color: '#6b7280',
    marginLeft: 2,
  },
  legend: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
});