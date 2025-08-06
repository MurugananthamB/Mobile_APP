import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import ApiService from '../services/api';

const ScanAttendanceScreen = () => {
  const [scannedId, setScannedId] = useState('');
  const router = useRouter();

  const handleMarkAttendance = async () => {
    console.log('Attempting to mark attendance...');
    console.log('Scanned ID state:', scannedId);
    if (!scannedId.trim()) {
      Alert.alert('Error', 'Please enter a scanned ID.');
      return;
    }
    try {
      const response = await ApiService.scanMarkAttendance(scannedId.trim());
      console.log('API call completed.');
      if (response.success) {
        console.log('API response indicates success.');
        Alert.alert('Success', response.message || 'Attendance marked successfully!');
        setScannedId(''); // Clear input after successful scan
      } else {
        Alert.alert('Error', response.message || 'Failed to mark attendance.');
        console.log('API response indicates failure:', response);
      }
      console.log('API response:', response);
    } catch (error) {
      console.error('Error marking attendance by scan:', error);
      Alert.alert('Error', 'An error occurred while marking attendance.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Barcode to Mark Attendance</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter scanned ID"
        value={scannedId}
        onChangeText={setScannedId}
        onSubmitEditing={handleMarkAttendance} // Trigger on Enter key press
        keyboardType="default"
        autoCapitalize="none"
        autoFocus={true} // Auto-focus the input for scanner
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleMarkAttendance}
      >
        <Text style={styles.buttonText}>Mark Attendance</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/attendance')}
      >
        <Text style={styles.backButtonText}>Back to Attendance</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
});

export default ScanAttendanceScreen;