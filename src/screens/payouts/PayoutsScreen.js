import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import { payoutService } from '../../services/payoutService';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function PayoutsScreen() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const response = await payoutService.getPayouts();
      console.log('📊 Payouts Response:', response.data);
      const payoutsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setPayouts(payoutsData);
    } catch (error) {
      console.error('❌ Load payouts error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load payouts. Please check your connection.');
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const renderPayout = ({ item }) => (
    <Card style={styles.payoutCard}>
      <View style={styles.payoutHeader}>
        <Text style={styles.payoutId}>Payout #{item.id}</Text>
        <Text style={[styles.status, styles[item.status]]}>{item.status}</Text>
      </View>
      <Text style={styles.period}>{item.period_start} to {item.period_end}</Text>
      <View style={styles.amounts}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Total Bookings:</Text>
          <Text style={styles.amountValue}>₹{item.total_bookings_amount}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Platform Fee:</Text>
          <Text style={styles.amountValue}>-₹{item.platform_fee}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Net Amount:</Text>
          <Text style={styles.netAmount}>₹{item.net_amount}</Text>
        </View>
      </View>
      {item.paid_at && (
        <Text style={styles.paidDate}>Paid on {new Date(item.paid_at).toLocaleDateString()}</Text>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payouts</Text>
      </View>
      {payouts.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyTitle}>No Payouts Yet</Text>
          <Text style={styles.emptyText}>Payouts will appear here once bookings are completed</Text>
        </View>
      ) : (
        <FlatList
          data={payouts}
          renderItem={renderPayout}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPayouts} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
  },
  list: {
    padding: SIZES.lg,
  },
  payoutCard: {
    marginBottom: SIZES.md,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  payoutId: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  status: {
    ...FONTS.small,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
    textTransform: 'capitalize',
  },
  pending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  processing: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  completed: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  period: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  amounts: {
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xs,
  },
  amountLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  amountValue: {
    ...FONTS.caption,
    color: COLORS.text,
  },
  netAmount: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  paidDate: {
    ...FONTS.small,
    color: COLORS.success,
    marginTop: SIZES.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SIZES.md,
  },
  emptyTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
