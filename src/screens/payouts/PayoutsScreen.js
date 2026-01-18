import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import { payoutService } from '../../services/payoutService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../../constants/theme';

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
    <View style={[styles.payoutCard, SHADOWS.medium]}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Payouts</Text>
            <Text style={styles.headerSubtitle}>Track your earnings</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={32} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>
      {unpaidSummary && unpaidSummary.total_bookings > 0 && (
        <View style={[styles.unpaidCard, SHADOWS.medium]}>
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
        </View>
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
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.xl,
    paddingBottom: SIZES.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h1,
    color: '#FFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    ...FONTS.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SIZES.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  payoutCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
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
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  pending: {
    backgroundColor: COLORS.warning[100],
    color: COLORS.warning[700],
  },
  processed: {
    backgroundColor: COLORS.primary[100],
    color: COLORS.primary[700],
  },
  paid: {
    backgroundColor: COLORS.success[100],
    color: COLORS.success[700],
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
    ...FONTS.h4,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  paidDate: {
    ...FONTS.small,
    color: COLORS.success[600],
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
    backgroundColor: COLORS.warning[50],
    borderRadius: 16,
    padding: SIZES.lg,
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning[500],
  },
  unpaidTitle: {
    ...FONTS.h4,
    fontWeight: '700',
    color: COLORS.warning[800],
    marginBottom: SIZES.xs,
  },
  unpaidSubtitle: {
    ...FONTS.caption,
    color: COLORS.warning[700],
    marginBottom: SIZES.md,
  },
});
