import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { FileText, TrendingUp, Award, BarChart3, ChevronDown } from 'lucide-react-native';

export default function ResultsScreen() {
  const [selectedTerm, setSelectedTerm] = useState('midterm');

  const resultsData = {
    currentCGPA: 8.5,
    totalSubjects: 8,
    rank: 5,
    totalStudents: 45,
    terms: {
      midterm: {
        name: 'Mid-Term Examination',
        totalMarks: 800,
        obtainedMarks: 680,
        percentage: 85,
        grade: 'A',
        subjects: [
          { name: 'Mathematics', maxMarks: 100, obtainedMarks: 88, grade: 'A+', teacher: 'Mr. Smith' },
          { name: 'English', maxMarks: 100, obtainedMarks: 82, grade: 'A', teacher: 'Ms. Johnson' },
          { name: 'Physics', maxMarks: 100, obtainedMarks: 90, grade: 'A+', teacher: 'Dr. Brown' },
          { name: 'Chemistry', maxMarks: 100, obtainedMarks: 85, grade: 'A', teacher: 'Ms. Davis' },
          { name: 'Biology', maxMarks: 100, obtainedMarks: 78, grade: 'B+', teacher: 'Dr. Anderson' },
          { name: 'History', maxMarks: 100, obtainedMarks: 75, grade: 'B+', teacher: 'Mr. Wilson' },
          { name: 'Geography', maxMarks: 100, obtainedMarks: 80, grade: 'A', teacher: 'Ms. Clark' },
          { name: 'Computer Science', maxMarks: 100, obtainedMarks: 92, grade: 'A+', teacher: 'Mr. Taylor' },
        ]
      },
      annual: {
        name: 'Annual Examination',
        totalMarks: 800,
        obtainedMarks: 720,
        percentage: 90,
        grade: 'A+',
        subjects: [
          { name: 'Mathematics', maxMarks: 100, obtainedMarks: 95, grade: 'A+', teacher: 'Mr. Smith' },
          { name: 'English', maxMarks: 100, obtainedMarks: 88, grade: 'A+', teacher: 'Ms. Johnson' },
          { name: 'Physics', maxMarks: 100, obtainedMarks: 92, grade: 'A+', teacher: 'Dr. Brown' },
          { name: 'Chemistry', maxMarks: 100, obtainedMarks: 89, grade: 'A+', teacher: 'Ms. Davis' },
          { name: 'Biology', maxMarks: 100, obtainedMarks: 85, grade: 'A', teacher: 'Dr. Anderson' },
          { name: 'History', maxMarks: 100, obtainedMarks: 82, grade: 'A', teacher: 'Mr. Wilson' },
          { name: 'Geography', maxMarks: 100, obtainedMarks: 87, grade: 'A+', teacher: 'Ms. Clark' },
          { name: 'Computer Science', maxMarks: 100, obtainedMarks: 97, grade: 'A+', teacher: 'Mr. Taylor' },
        ]
      }
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return '#10b981';
      case 'A': return '#3b82f6';
      case 'B+': return '#f59e0b';
      case 'B': return '#f97316';
      case 'C': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#3b82f6';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  };

  const calculatePercentage = (obtained, max) => {
    return ((obtained / max) * 100).toFixed(1);
  };

  const currentTermData = resultsData.terms[selectedTerm];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <FileText size={24} color="#1e40af" />
            <Text style={styles.headerTitle}>Results</Text>
          </View>
        </View>

        {/* Overall Performance */}
        <View style={styles.overallContainer}>
          <View style={styles.overallCard}>
            <View style={styles.overallHeader}>
              <Text style={styles.overallTitle}>Overall Performance</Text>
              <Award size={20} color="#f59e0b" />
            </View>
            <View style={styles.overallStats}>
              <View style={styles.overallStat}>
                <Text style={styles.overallValue}>{resultsData.currentCGPA}</Text>
                <Text style={styles.overallLabel}>CGPA</Text>
              </View>
              <View style={styles.overallStat}>
                <Text style={styles.overallValue}>{resultsData.rank}</Text>
                <Text style={styles.overallLabel}>Class Rank</Text>
              </View>
              <View style={styles.overallStat}>
                <Text style={styles.overallValue}>{resultsData.totalSubjects}</Text>
                <Text style={styles.overallLabel}>Subjects</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Term Selection */}
        <View style={styles.termSelector}>
          <Text style={styles.termSelectorTitle}>Select Term</Text>
          <View style={styles.termButtons}>
            <TouchableOpacity
              style={[
                styles.termButton,
                selectedTerm === 'midterm' && styles.termButtonActive
              ]}
              onPress={() => setSelectedTerm('midterm')}
            >
              <Text style={[
                styles.termButtonText,
                selectedTerm === 'midterm' && styles.termButtonTextActive
              ]}>
                Mid-Term
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.termButton,
                selectedTerm === 'annual' && styles.termButtonActive
              ]}
              onPress={() => setSelectedTerm('annual')}
            >
              <Text style={[
                styles.termButtonText,
                selectedTerm === 'annual' && styles.termButtonTextActive
              ]}>
                Annual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Term Results Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>{currentTermData.name}</Text>
              <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(currentTermData.grade) }]}>
                <Text style={styles.gradeText}>{currentTermData.grade}</Text>
              </View>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>{currentTermData.obtainedMarks}</Text>
                <Text style={styles.summaryStatLabel}>Obtained</Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>{currentTermData.totalMarks}</Text>
                <Text style={styles.summaryStatLabel}>Total</Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatValue, { color: getPercentageColor(currentTermData.percentage) }]}>
                  {currentTermData.percentage}%
                </Text>
                <Text style={styles.summaryStatLabel}>Percentage</Text>
              </View>
            

            </View>
          </View>
        </View>

        {/* Subject-wise Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject-wise Results</Text>
          <View style={styles.subjectsContainer}>
            {currentTermData.subjects.map((subject, index) => (
              <View key={index} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <View style={[styles.subjectGrade, { backgroundColor: getGradeColor(subject.grade) }]}>
                    <Text style={styles.subjectGradeText}>{subject.grade}</Text>
                  </View>
                </View>
                <View style={styles.subjectDetails}>
                  <View style={styles.subjectMarks}>
                    <Text style={styles.subjectObtained}>{subject.obtainedMarks}</Text>
                    <Text style={styles.subjectMax}>/{subject.maxMarks}</Text>
                  </View>
                  <Text style={styles.subjectPercentage}>
                    {calculatePercentage(subject.obtainedMarks, subject.maxMarks)}%
                  </Text>
                </View>
                <Text style={styles.subjectTeacher}>Teacher: {subject.teacher}</Text>
                
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(subject.obtainedMarks / subject.maxMarks) * 100}%`,
                          backgroundColor: getGradeColor(subject.grade)
                        }
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Analysis</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <BarChart3 size={20} color="#1e40af" />
              <Text style={styles.chartTitle}>Grade Distribution</Text>
            </View>
            <View style={styles.chartContent}>
              {['A+', 'A', 'B+', 'B', 'C'].map((grade) => {
                const count = currentTermData.subjects.filter(s => s.grade === grade).length;
                const percentage = (count / currentTermData.subjects.length) * 100;
                return (
                  <View key={grade} style={styles.chartRow}>
                    <Text style={styles.chartLabel}>{grade}</Text>
                    <View style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            width: `${percentage}%`,
                            backgroundColor: getGradeColor(grade)
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.chartCount}>{count}</Text>
                  </View>
                );
              })}
            

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
  overallContainer: {
    margin: 20,
  },
  overallCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overallStat: {
    alignItems: 'center',
  },
  overallValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 5,
  },
  overallLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  termSelector: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  termSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  termButtons: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  termButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  termButtonActive: {
    backgroundColor: '#1e40af',
  },
  termButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  termButtonTextActive: {
    color: '#ffffff',
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 5,
  },
  summaryStatLabel: {
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
  subjectsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectCard: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  subjectGrade: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectGradeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  subjectDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  subjectMarks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectObtained: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  subjectMax: {
    fontSize: 16,
    color: '#6b7280',
  },
  subjectPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  subjectTeacher: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  chartContent: {
    flex: 1,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    width: 30,
  },
  chartBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 10,
  },
  chartCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    width: 20,
    textAlign: 'center',
  },
});