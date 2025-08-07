import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { FileText, TrendingUp, Award, BarChart3, ChevronDown } from 'lucide-react-native';
import { tw } from '../utils/tailwind';

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
    <SafeAreaView style={tw("flex-1 bg-gray-50")}>
      <ScrollView style={tw("flex-1")} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw("bg-white p-4 border-b border-gray-200")}>
          <View style={tw("flex-row items-center")}>
            <FileText size={24} color="#1e40af" />
            <Text style={tw("text-xl font-bold text-gray-900 ml-2")}>Results</Text>
          </View>
        </View>

        {/* Overall Performance */}
        <View style={tw("p-4")}>
          <View style={tw("bg-white rounded-xl p-6 shadow-sm")}>
            <View style={tw("flex-row items-center justify-between mb-4")}>
              <Text style={tw("text-lg font-bold text-gray-900")}>Overall Performance</Text>
              <Award size={20} color="#f59e0b" />
            </View>
            <View style={tw("flex-row justify-between")}>
              <View style={tw("items-center")}>
                <Text style={tw("text-3xl font-bold text-blue-600")}>{resultsData.currentCGPA}</Text>
                <Text style={tw("text-sm text-gray-500")}>CGPA</Text>
              </View>
              <View style={tw("items-center")}>
                <Text style={tw("text-3xl font-bold text-green-600")}>{resultsData.totalSubjects}</Text>
                <Text style={tw("text-sm text-gray-500")}>Subjects</Text>
              </View>
              <View style={tw("items-center")}>
                <Text style={tw("text-3xl font-bold text-purple-600")}>{resultsData.rank}</Text>
                <Text style={tw("text-sm text-gray-500")}>Rank</Text>
              </View>
              <View style={tw("items-center")}>
                <Text style={tw("text-3xl font-bold text-orange-600")}>{resultsData.totalStudents}</Text>
                <Text style={tw("text-sm text-gray-500")}>Total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Term Selection */}
        <View style={tw("px-4 mb-4")}>
          <View style={tw("bg-white rounded-xl p-4 shadow-sm")}>
            <Text style={tw("text-lg font-bold text-gray-900 mb-3")}>Select Term</Text>
            <View style={tw("flex-row space-x-2")}>
              {Object.keys(resultsData.terms).map((term) => (
                <TouchableOpacity
                  key={term}
                  onPress={() => setSelectedTerm(term)}
                  style={tw(`flex-1 py-3 px-4 rounded-lg ${selectedTerm === term ? 'bg-blue-500' : 'bg-gray-100'}`)}
                >
                  <Text style={tw(`text-center font-medium ${selectedTerm === term ? 'text-white' : 'text-gray-700'}`)}>
                    {term.charAt(0).toUpperCase() + term.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Term Results */}
        <View style={tw("px-4 mb-4")}>
          <View style={tw("bg-white rounded-xl p-6 shadow-sm")}>
            <View style={tw("flex-row items-center justify-between mb-4")}>
              <Text style={tw("text-lg font-bold text-gray-900")}>{currentTermData.name}</Text>
              <View style={tw("flex-row items-center")}>
                <BarChart3 size={20} color="#3b82f6" />
                <Text style={tw("text-sm text-gray-500 ml-1")}>Performance</Text>
              </View>
            </View>
            
            {/* Term Summary */}
            <View style={tw("bg-blue-50 rounded-lg p-4 mb-6")}>
              <View style={tw("flex-row justify-between items-center mb-2")}>
                <Text style={tw("text-sm font-medium text-gray-600")}>Total Marks</Text>
                <Text style={tw("text-sm font-medium text-gray-600")}>{currentTermData.obtainedMarks}/{currentTermData.totalMarks}</Text>
              </View>
              <View style={tw("flex-row justify-between items-center mb-2")}>
                <Text style={tw("text-sm font-medium text-gray-600")}>Percentage</Text>
                <Text style={tw("text-sm font-bold")} style={{ color: getPercentageColor(currentTermData.percentage) }}>
                  {currentTermData.percentage}%
                </Text>
              </View>
              <View style={tw("flex-row justify-between items-center")}>
                <Text style={tw("text-sm font-medium text-gray-600")}>Grade</Text>
                <Text style={tw("text-sm font-bold")} style={{ color: getGradeColor(currentTermData.grade) }}>
                  {currentTermData.grade}
                </Text>
              </View>
            </View>

            {/* Subject-wise Results */}
            <Text style={tw("text-lg font-bold text-gray-900 mb-4")}>Subject-wise Results</Text>
            {currentTermData.subjects.map((subject, index) => (
              <View key={index} style={tw("border-b border-gray-100 py-3 last:border-b-0")}>
                <View style={tw("flex-row justify-between items-center mb-2")}>
                  <Text style={tw("text-base font-medium text-gray-900")}>{subject.name}</Text>
                  <Text style={tw("text-sm font-bold")} style={{ color: getGradeColor(subject.grade) }}>
                    {subject.grade}
                  </Text>
                </View>
                <View style={tw("flex-row justify-between items-center")}>
                  <Text style={tw("text-sm text-gray-500")}>{subject.teacher}</Text>
                  <Text style={tw("text-sm text-gray-600")}>
                    {subject.obtainedMarks}/{subject.maxMarks} ({calculatePercentage(subject.obtainedMarks, subject.maxMarks)}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Chart Placeholder */}
        <View style={tw("px-4 mb-6")}>
          <View style={tw("bg-white rounded-xl p-6 shadow-sm")}>
            <View style={tw("flex-row items-center justify-between mb-4")}>
              <Text style={tw("text-lg font-bold text-gray-900")}>Performance Trend</Text>
              <TrendingUp size={20} color="#10b981" />
            </View>
            <View style={tw("h-32 bg-gray-100 rounded-lg items-center justify-center")}>
              <Text style={tw("text-gray-500")}>Chart visualization coming soon</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}