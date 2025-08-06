import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import {Calendar, ChevronDown, ChevronUp, CreditCard, CircleAlert as AlertCircle } from 'lucide-react-native';
import { DollarSign } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function FeesScreen() {
  const [expandedTerms, setExpandedTerms] = useState({});
  const router = useRouter();

  const feeData = {
    totalPending: 7500,
    totalPaid: 22500,
    nextDueDate: '2024-02-15',
    terms: [
      {
        id: 1,
        name: 'First Term 2023-24',
        dueDate: '2024-01-15',
        status: 'paid',
        totalAmount: 15000,
        paidAmount: 15000,
        categories: [
          { name: 'Tuition Fee', amount: 10000, paid: 10000 },
          { name: 'Transport Fee', amount: 3000, paid: 3000 },
          { name: 'Activity Fee', amount: 2000, paid: 2000 },
        ]
      },
      {
        id: 2,
        name: 'Second Term 2023-24',
        dueDate: '2024-02-15',
        status: 'partial',
        totalAmount: 15000,
        paidAmount: 7500,
        categories: [
          { name: 'Tuition Fee', amount: 10000, paid: 5000 },
          { name: 'Transport Fee', amount: 3000, paid: 2500 },
          { name: 'Activity Fee', amount: 2000, paid: 0 },
        ]
      },
      {
        id: 3,
        name: 'Third Term 2023-24',
        dueDate: '2024-03-15',
        status: 'pending',
        totalAmount: 15000,
        paidAmount: 0,
        categories: [
          { name: 'Tuition Fee', amount: 10000, paid: 0 },
          { name: 'Transport Fee', amount: 3000, paid: 0 },
          { name: 'Activity Fee', amount: 2000, paid: 0 },
        ]
      },
    ]
  };

  const toggleTermExpansion = (termId) => {
    setExpandedTerms(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#059669';
      case 'partial': return '#ea580c';
      case 'pending': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'partial': return 'Partial';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fees</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryAmount}>₹{feeData.totalPending.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryAmount, { color: '#059669' }]}>₹{feeData.totalPaid.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Paid</Text>
              </View>
            </View>
          </View>

          {/* Next Due Alert */}
          <View style={styles.alertCard}>
            <AlertCircle size={20} color="#ea580c" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Next Due Date</Text>
              <Text style={styles.alertDate}>{feeData.nextDueDate}</Text>
            </View>
          </View>
        </View>

        {/* Fee Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fee Terms</Text>
          {feeData.terms.map((term) => (
            <View key={term.id} style={styles.termCard}>
              <TouchableOpacity 
                style={styles.termHeader}
                onPress={() => toggleTermExpansion(term.id)}
              >
                <View style={styles.termInfo}>
                  <Text style={styles.termName}>{term.name}</Text>
                  <View style={styles.termDetails}>
                    <Text style={styles.termDueDate}>Due: {term.dueDate}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(term.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(term.status)}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.termAmount}>
                  <Text style={styles.termTotal}>₹{term.totalAmount.toLocaleString()}</Text>
                  <View style={styles.termExpand}>
                    {expandedTerms[term.id] ? 
                      <ChevronUp size={20} color="#6b7280" /> : 
                      <ChevronDown size={20} color="#6b7280" />
                    }
                  </View>
                </View>
              </TouchableOpacity>

              {expandedTerms[term.id] && (
                <View style={styles.termBreakdown}>
                  <Text style={styles.breakdownTitle}>Fee Breakdown</Text>
                  {term.categories.map((category, index) => (
                    <View key={index} style={styles.categoryRow}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <View style={styles.categoryAmount}>
                        <Text style={styles.categoryPaid}>₹{category.paid.toLocaleString()}</Text>
                        <Text style={styles.categoryTotal}>/ ₹{category.amount.toLocaleString()}</Text>
                      </View>
                    </View>
                  ))}
                  
                  {term.status !== 'paid' && (
                    <TouchableOpacity style={styles.payButton}>
                      <CreditCard size={20} color="#ffffff" />
                      <Text style={styles.payButtonText}>
                        Pay Now - ₹{(term.totalAmount - term.paidAmount).toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <View style={styles.historyCard}>
            <View style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>First Term Payment</Text>
                <Text style={styles.historyDate}>Jan 10, 2024</Text>
              </View>
              <Text style={styles.historyAmount}>₹15,000</Text>
            </View>
            <View style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>Second Term (Partial)</Text>
                <Text style={styles.historyDate}>Jan 25, 2024</Text>
              </View>
              <Text style={styles.historyAmount}>₹7,500</Text>
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  // Removed the previous header styles, as they are now replaced by customHeader
  // header: {
  //   paddingHorizontal: 20,
  //   paddingVertical: 20,
  //   backgroundColor: '#ffffff',
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#e5e7eb',
  // },
  // headerContent: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  summaryContainer: {
    margin: 16,
  },
  summaryCard: {
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ea580c',
  },
  alertContent: {
    marginLeft: 10,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 2,
  },
  alertDate: {
    fontSize: 12,
    color: '#78350f',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  termCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  termInfo: {
    flex: 1,
  },
  termName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  termDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termDueDate: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  termAmount: {
    alignItems: 'flex-end',
  },
  termTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 5,
  },
  termExpand: {
    padding: 5,
  },
  termBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    color: '#1f2937',
  },
  categoryAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPaid: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  categoryTotal: {
    fontSize: 14,
    color: '#6b7280',
  },
  payButton: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
});