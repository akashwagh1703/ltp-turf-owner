import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import { subscriptionService } from '../../services/subscriptionService';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const ACTION = '#E06C1F';
const CREAM = '#F7F4EF';

export default function PayLtpScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await subscriptionService.get();
      const next = res.data?.data || res.data;
      setData(next);
      const monthly = next?.plans?.find((p) => p.type === 'monthly') || next?.plans?.[0];
      setPlanId((current) => current || monthly?.id);
    } catch (error) {
      Alert.alert('Could not load', error.response?.data?.message || 'Try again');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const selected = data?.plans?.find((p) => p.id === planId) || data?.plans?.[0];
  const amount = Number(selected?.price || data?.amount_due || 0);
  const waiting = !!data?.pending_payment;
  const isTrial = data?.is_trial && data?.can_accept_online_bookings;

  const handleMarkPaid = async () => {
    setSaving(true);
    try {
      const res = await subscriptionService.markPaid(planId);
      Alert.alert(
        'Told LTP',
        res.data?.message || 'Waiting for LTP to confirm…',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Could not mark paid', error.response?.data?.message || 'Try again');
    } finally {
      setSaving(false);
    }
  };

  const shareUpi = async () => {
    if (!data?.platform_upi_id) return;
    try {
      await Share.share({ message: data.platform_upi_id, title: 'LTP UPI ID' });
    } catch (e) {
      Alert.alert('UPI ID', data.platform_upi_id);
    }
  };

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={ACTION} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backHit}>
          <Ionicons name="chevron-back" size={24} color={COLORS.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Let’s Turf Play</Text>
        <View style={styles.backHit} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.amount}>₹{amount}</Text>
        <Text style={styles.sub}>
          {isTrial
            ? `Trial active · due ${data.end_date || ''}`
            : `${selected?.name || 'Monthly plan'} · due ${data.end_date || ''}`}
        </Text>

        {isTrial && (
          <View style={styles.noticeOk}>
            <Text style={styles.noticeOkText}>Trial active. You can pay now to continue after it ends, or wait.</Text>
          </View>
        )}

        {waiting && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Waiting for LTP to confirm…</Text>
          </View>
        )}

        {!waiting && data.plans?.length > 0 && (
          <View style={styles.planRow}>
            {data.plans.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.planChip, planId === p.id && styles.planChipOn]}
                onPress={() => setPlanId(p.id)}
              >
                <Text style={[styles.planChipText, planId === p.id && styles.planChipTextOn]}>
                  {p.name} · ₹{Number(p.price).toFixed(0)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.card, SHADOWS.medium]}>
          {data.platform_qr_url ? (
            <Image source={{ uri: data.platform_qr_url }} style={styles.qr} resizeMode="contain" />
          ) : (
            <View style={styles.qrEmpty}>
              <Ionicons name="qr-code-outline" size={56} color={COLORS.gray[400]} />
              <Text style={styles.qrEmptyText}>
                {data.platform_upi_id
                  ? 'Pay this UPI ID in GPay, PhonePe, or Paytm'
                  : 'LTP has not added a QR yet. Contact support.'}
              </Text>
            </View>
          )}
          <Text style={styles.caption}>Scan with GPay, PhonePe, or Paytm</Text>
          {data.platform_upi_id ? (
            <TouchableOpacity onPress={shareUpi} style={styles.upiRow}>
              <Text selectable style={styles.upiId}>{data.platform_upi_id}</Text>
              <Text style={styles.share}>Share</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {amount > 0 && (
        <View style={styles.footer}>
          <Button
            title={saving ? 'Please wait…' : waiting ? 'I have paid' : 'I have paid'}
            onPress={handleMarkPaid}
            loading={saving}
            disabled={saving || (!data.platform_upi_id && !data.platform_qr_url)}
            style={styles.actionBtn}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    backgroundColor: '#FFF',
  },
  backHit: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray[900] },
  content: { padding: SIZES.lg, alignItems: 'center', paddingBottom: SIZES.xxl },
  amount: { fontSize: 40, fontWeight: '800', color: '#1F7A4C', marginTop: SIZES.md },
  sub: { marginTop: SIZES.sm, fontSize: 16, color: COLORS.gray[600], textAlign: 'center' },
  notice: {
    marginTop: SIZES.lg,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: SIZES.md,
    width: '100%',
  },
  noticeText: { fontSize: 15, color: '#92400E', textAlign: 'center', fontWeight: '600' },
  noticeOk: {
    marginTop: SIZES.lg,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: SIZES.md,
    width: '100%',
  },
  noticeOkText: { fontSize: 15, color: '#047857', textAlign: 'center', fontWeight: '600' },
  planRow: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.lg, flexWrap: 'wrap', justifyContent: 'center' },
  planChip: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  planChipOn: { backgroundColor: ACTION, borderColor: ACTION },
  planChipText: { fontWeight: '600', color: COLORS.gray[800] },
  planChipTextOn: { color: '#FFF' },
  card: {
    marginTop: SIZES.xl,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
    width: '100%',
    alignItems: 'center',
  },
  qr: { width: 220, height: 220 },
  qrEmpty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', padding: SIZES.md },
  qrEmptyText: { marginTop: SIZES.md, textAlign: 'center', color: COLORS.gray[500], lineHeight: 20 },
  caption: { marginTop: SIZES.md, fontSize: 14, color: COLORS.gray[500] },
  upiRow: { marginTop: SIZES.md, flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  upiId: { fontSize: 16, fontWeight: '700', color: COLORS.gray[900] },
  share: { fontSize: 14, fontWeight: '600', color: ACTION },
  footer: { padding: SIZES.lg, backgroundColor: '#FFF' },
  actionBtn: { backgroundColor: ACTION },
});
