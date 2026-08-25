import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { subscriptionService } from '../../services/subscriptionService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../../constants/theme';

const ACTION = '#E06C1F';

export default function MoneyScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.get();
      setData(res.data?.data || res.data);
    } catch (error) {
      console.error('Load money error', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const earnings = data?.earnings || { today: 0, week: 0, month: 0 };
  const planName = data?.plan?.name || 'No plan';
  const status = data?.status || '';
  const waiting = !!data?.pending_payment;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <Text style={styles.headerTitle}>Money</Text>
        <Text style={styles.headerSubtitle}>What you collected · Pay Let’s Turf Play</Text>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>Collected</Text>
        <View style={styles.row}>
          <View style={[styles.earnCard, SHADOWS.small]}>
            <Text style={styles.earnLabel}>Today</Text>
            <Text style={styles.earnValue}>₹{Number(earnings.today || 0).toFixed(0)}</Text>
          </View>
          <View style={[styles.earnCard, SHADOWS.small]}>
            <Text style={styles.earnLabel}>This week</Text>
            <Text style={styles.earnValue}>₹{Number(earnings.week || 0).toFixed(0)}</Text>
          </View>
          <View style={[styles.earnCard, SHADOWS.small]}>
            <Text style={styles.earnLabel}>This month</Text>
            <Text style={styles.earnValue}>₹{Number(earnings.month || 0).toFixed(0)}</Text>
          </View>
        </View>
        <Text style={styles.hint}>Players pay you directly. LTP does not hold this money.</Text>

        <Text style={[styles.sectionTitle, { marginTop: SIZES.xl }]}>Your LTP plan</Text>
        <View style={[styles.planCard, SHADOWS.medium]}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{planName}</Text>
            <Text style={[styles.planStatus, status === 'expired' && styles.planExpired]}>
              {status === 'trial' ? 'Trial' : status.replace('_', ' ')}
            </Text>
          </View>
          {data?.end_date ? (
            <Text style={styles.planMeta}>
              {data.is_trial ? 'Trial until' : 'Due'} {data.end_date}
              {data.days_remaining != null && data.days_remaining >= 0
                ? ` · ${data.days_remaining} days left`
                : ''}
            </Text>
          ) : (
            <Text style={styles.planMeta}>No plan on file</Text>
          )}
          {waiting && (
            <Text style={styles.waiting}>Waiting for LTP to confirm your payment…</Text>
          )}
          {!data?.can_accept_online_bookings && (
            <Text style={styles.lock}>Online bookings are paused until the fee is confirmed.</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => navigation.navigate('PayLtp')}
          activeOpacity={0.85}
        >
          <Ionicons name="qr-code-outline" size={22} color="#FFF" />
          <Text style={styles.payBtnText}>Pay Let’s Turf Play</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F4EF' },
  header: {
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  headerTitle: { ...FONTS.h1, color: '#FFF', fontWeight: '700' },
  headerSubtitle: { ...FONTS.caption, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  content: { padding: SIZES.lg, paddingBottom: SIZES.xxl },
  sectionTitle: { ...FONTS.h4, color: COLORS.gray[900], marginBottom: SIZES.md, fontWeight: '700' },
  row: { flexDirection: 'row', gap: SIZES.sm },
  earnCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: SIZES.md,
  },
  earnLabel: { ...FONTS.caption, color: COLORS.gray[500] },
  earnValue: { ...FONTS.h3, fontWeight: '700', color: '#1F7A4C', marginTop: 4 },
  hint: { ...FONTS.caption, color: COLORS.gray[500], marginTop: SIZES.sm, lineHeight: 18 },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { ...FONTS.h3, fontWeight: '700', color: COLORS.gray[900] },
  planStatus: {
    ...FONTS.small,
    fontWeight: '700',
    color: '#047857',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'capitalize',
  },
  planExpired: { color: '#C2410C', backgroundColor: '#FFEDD5' },
  planMeta: { ...FONTS.body, color: COLORS.gray[600], marginTop: SIZES.sm },
  waiting: { ...FONTS.caption, color: '#9A3412', marginTop: SIZES.sm, fontWeight: '600' },
  lock: { ...FONTS.caption, color: '#B91C1C', marginTop: SIZES.sm, fontWeight: '600' },
  payBtn: {
    marginTop: SIZES.xl,
    backgroundColor: ACTION,
    borderRadius: 12,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  payBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
