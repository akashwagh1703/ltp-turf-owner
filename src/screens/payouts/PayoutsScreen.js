import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import { payoutService } from '../../services/payoutService';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function PayoutsScreen() {
  const [payouts, setPayouts] = useState([]);
  const [unpaidSummary, setUnpaidSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayouts();
    loadUnpaidBookings();
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

  const loadUnpaidBookings = async () => {
    try {
      const response = await payoutService.getUnpaidBookings();
      console.log('💰 Unpaid bookings full response:', JSON.stringify(response.data, null, 2));
      console.log('💰 Summary:', response.data?.summary);
      if (response.data?.summary) {
        console.log('💰 Total bookings:', response.data.summary.total_bookings);
        setUnpaidSummary(response.data.summary);
      } else {
        console.log('⚠️ No summary in response');
      }
    } catch (error) {
      console.error('❌ Load unpaid bookings error:', error.response?.data || error.message);
    }
  };

  const renderPayout = ({ item }) => (
    <Card style={styles.payoutCard}>
      <View style={styles.payoutHeader}>
        <Text style={styles.payoutId}>{item.payout_number || `Payout #${item.id}`}</Text>
        <Text style={[styles.status, styles[item.status]]}>{item.status}</Text>
      </View>
      <Text style={styles.period}>{item.period_start} to {item.period_end}</Text>
      <View style={styles.amounts}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Bookings:</Text>
          <Text style={styles.amountValue}>{item.total_bookings}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Total Revenue:</Text>
          <Text style={styles.amountValue}>₹{item.total_revenue}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Commission ({item.commission_percentage}%):</Text>
          <Text style={styles.amountValue}>-₹{item.commission_amount}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Payout Amount:</Text>
          <Text style={styles.netAmount}>₹{item.payout_amount}</Text>
        </View>
      </View>
      {item.paid_date && (
        <Text style={styles.paidDate}>Paid on {new Date(item.paid_date).toLocaleDateString()}</Text>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payouts</Text>
      </View>
      {unpaidSummary && unpaidSummary.total_bookings > 0 && (
        <Card style={styles.unpaidCard}>
          <Text style={styles.unpaidTitle}>⏳ Pending Payout</Text>
          <Text style={styles.unpaidSubtitle}>
            {unpaidSummary.total_bookings} completed online booking{unpaidSummary.total_bookings > 1 ? 's' : ''} awaiting payout generation by admin
          </Text>
          <View style={styles.amounts}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Total Revenue:</Text>
              <Text style={styles.amountValue}>₹{unpaidSummary.total_amount}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Commission:</Text>
              <Text style={styles.amountValue}>-₹{unpaidSummary.commission_amount}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Expected Payout:</Text>
              <Text style={styles.netAmount}>₹{unpaidSummary.payout_amount}</Text>
            </View>
          </View>
        </Card>
      )}
      <FlatList
        data={payouts}
        renderItem={renderPayout}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.list, payouts.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyTitle}>No Payouts Yet</Text>
              <Text style={styles.emptyText}>Payouts will appear here once admin generates them</Text>
            </View>
          )
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { loadPayouts(); loadUnpaidBookings(); }} />}
      />
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
  emptyList: {
    flexGrow: 1,
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
  processed: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  paid: {
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    minHeight: 300,
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
  unpaidCard: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  unpaidTitle: {
    ...FONTS.body,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: SIZES.xs,
  },
  unpaidSubtitle: {
    ...FONTS.caption,
    color: '#78350F',
    marginBottom: SIZES.md,
  },
});
