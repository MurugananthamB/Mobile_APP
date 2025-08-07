import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Award, BookOpen, Calendar, Filter, Search, ChevronRight, Star, AlertCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export default function ResultsScreen() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await ApiService.getResults();
      
      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.message || 'Failed to load results');
      }
    } catch (error) {
      console.error('❌ Error loading results:', error);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadResults(true);
  };

  const getGradeColor = (grade) => {
    switch (grade?.toUpperCase()) {
      case 'A':
      case 'A+':
        return 'text-green-600 bg-green-100';
      case 'B':
      case 'B+':
        return 'text-blue-600 bg-blue-100';
      case 'C':
      case 'C+':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-orange-600 bg-orange-100';
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (percentage) => {
    if (percentage >= 90) return <Star size={16} color="#10b981" />;
    if (percentage >= 80) return <TrendingUp size={16} color="#3b82f6" />;
    if (percentage >= 70) return <Award size={16} color="#f59e0b" />;
    return <AlertCircle size={16} color="#ef4444" />;
  };

  const filterOptions = [
    { label: 'All Results', value: 'all' },
    { label: 'Exams', value: 'exam' },
    { label: 'Assignments', value: 'assignment' },
    { label: 'Projects', value: 'project' },
    { label: 'Quizzes', value: 'quiz' },
  ];

  const filteredResults = results.filter(result => {
    const matchesSearch = result.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.examName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || result.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e40af" />
          <Text className="text-gray-500 mt-4">Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !results.length) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={48} color="#ef4444" />
          <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">Error Loading Results</Text>
          <Text className="text-gray-500 text-center mb-6">{error}</Text>
          <TouchableOpacity 
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => loadResults()}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={{ padding: 24 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Academic Results</Text>
              <Text className="text-white opacity-90">Track your academic performance</Text>
            </View>
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full items-center justify-center"
                onPress={() => Alert.alert('Filter', 'Filter functionality coming soon')}
              >
                <Filter size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-white rounded-xl px-3 border border-gray-200">
            <Search size={18} color="#6b7280" style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 py-3 text-base text-gray-900"
              placeholder="Search results..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-4 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedFilter(option.value)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: selectedFilter === option.value ? '#3b82f6' : '#ffffff',
                  borderWidth: selectedFilter === option.value ? 0 : 1,
                  borderColor: selectedFilter === option.value ? 'transparent' : '#e5e7eb'
                }}
              >
                <Text style={{
                  fontWeight: '500',
                  color: selectedFilter === option.value ? '#ffffff' : '#4b5563'
                }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results List */}
        <View className="px-4 pb-4">
          {filteredResults.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <BookOpen size={48} color="#9ca3af" />
              <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">
                {searchQuery ? 'No matching results' : 'No results available'}
              </Text>
              <Text className="text-gray-500 text-center">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Your academic results will appear here once they are published.'
                }
              </Text>
            </View>
          ) : (
            filteredResults.map((result) => (
              <View 
                key={result.id} 
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <BookOpen size={16} color="#3b82f6" />
                      <Text className="text-lg font-semibold text-gray-900 ml-2">
                        {result.subject}
                      </Text>
                    </View>
                    
                    <Text className="text-gray-600 mb-3">{result.examName}</Text>
                    
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <Calendar size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-500 ml-1">
                          {new Date(result.examDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 20,
                        backgroundColor: getGradeColor(result.grade).includes('green') ? '#dcfce7' : 
                                       getGradeColor(result.grade).includes('blue') ? '#dbeafe' :
                                       getGradeColor(result.grade).includes('yellow') ? '#fef3c7' :
                                       getGradeColor(result.grade).includes('orange') ? '#fed7aa' :
                                       getGradeColor(result.grade).includes('red') ? '#fee2e2' : '#f3f4f6'
                      }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: getGradeColor(result.grade).includes('green') ? '#059669' :
                                 getGradeColor(result.grade).includes('blue') ? '#2563eb' :
                                 getGradeColor(result.grade).includes('yellow') ? '#d97706' :
                                 getGradeColor(result.grade).includes('orange') ? '#ea580c' :
                                 getGradeColor(result.grade).includes('red') ? '#dc2626' : '#4b5563'
                        }}>{result.grade}</Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        {getPerformanceIcon(result.percentage)}
                                                 <Text style={{
                           fontSize: 14,
                           fontWeight: '600',
                           marginLeft: 4,
                           color: getPerformanceColor(result.percentage).includes('green') ? '#059669' :
                                  getPerformanceColor(result.percentage).includes('blue') ? '#2563eb' :
                                  getPerformanceColor(result.percentage).includes('yellow') ? '#d97706' :
                                  getPerformanceColor(result.percentage).includes('orange') ? '#ea580c' : '#dc2626'
                         }}>
                           {result.percentage}%
                         </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-sm text-gray-500 mr-2">
                          {result.marksObtained}/{result.totalMarks}
                        </Text>
                        <ChevronRight size={16} color="#9ca3af" />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}