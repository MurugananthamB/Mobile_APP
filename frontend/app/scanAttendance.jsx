import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, CheckCircle } from 'lucide-react-native';
import ApiService from '../services/api';

const ScanAttendanceScreen = () => {
  const [scannedId, setScannedId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastScannedId, setLastScannedId] = useState('');
  const router = useRouter();

  // Auto-focus the input when component mounts
  useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      // The input will be auto-focused via the autoFocus prop
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkAttendance = async () => {
    if (!scannedId.trim()) {
      Alert.alert('Error', 'Please enter a scanned ID.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.scanMarkAttendance(scannedId.trim());
      
      if (response.success) {
        setLastScannedId(scannedId.trim());
        Alert.alert('Success', response.message || 'Attendance marked successfully!');
        setScannedId(''); // Clear input after successful scan
      } else {
        Alert.alert('Error', response.message || 'Failed to mark attendance.');
      }
    } catch (error) {
      console.error('Error marking attendance by scan:', error);
      Alert.alert('Error', 'An error occurred while marking attendance.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#1e40af', '#1e3a8a']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Attendance</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scanCard}>
          <View style={styles.iconContainer}>
            <Camera size={48} color="#1e40af" />
          </View>
          
          <Text style={styles.title}>Scan Barcode to Mark Attendance</Text>
          <Text style={styles.subtitle}>Enter the scanned ID or barcode below</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter scanned ID"
              value={scannedId}
              onChangeText={setScannedId}
              onSubmitEditing={handleMarkAttendance}
              keyboardType="default"
              autoCapitalize="none"
              autoFocus={true}
              autoCorrect={false}
              returnKeyType="done"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleMarkAttendance}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <CheckCircle size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Mark Attendance</Text>
              </>
            )}
          </TouchableOpacity>

          {lastScannedId && (
            <View style={styles.lastScannedContainer}>
              <Text style={styles.lastScannedLabel}>Last Scanned ID:</Text>
              <Text style={styles.lastScannedId}>{lastScannedId}</Text>
            </View>
          )}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            • Point your scanner at the barcode{'\n'}
            • The ID will automatically appear in the input field{'\n'}
            • Press Enter or tap "Mark Attendance" to submit{'\n'}
            • You can also manually type the ID if needed
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  lastScannedContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1e40af',
  },
  lastScannedLabel: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  lastScannedId: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: 'bold',
    marginTop: 4,
  },
  instructions: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default ScanAttendanceScreen;