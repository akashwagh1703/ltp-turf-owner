import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentBookings(),
      ]);
      
      const statsData = statsRes.data.data || statsRes.data;
      const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.data || []);
      
      setStats(statsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('❌ Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showAvatar showNotification />
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Turfs')} activeOpacity={0.85}>
              <View style={[styles.statIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="football" size={26} color="#0284C7" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stats?.total_turfs || 0}</Text>
                <Text style={styles.statLabel}>Total Turfs</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} activeOpacity={0.85}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="today" size={26} color="#D97706" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stats?.today_bookings || 0}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Payouts')} activeOpacity={0.85}>
              <View style={[styles.statIconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="wallet" size={26} color="#059669" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>₹{parseFloat(stats?.total_revenue || 0).toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} activeOpacity={0.85}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="hourglass" size={26} color="#DC2626" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stats?.pending_bookings || 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bookingTypeCards}>
            <View style={styles.bookingTypeCard}>
              <View style={styles.bookingTypeHeader}>
                <View style={[styles.bookingTypeIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="globe-outline" size={20} color="#1D4ED8" />
                </View>
                <Text style={styles.bookingTypeTitle}>Online Bookings</Text>
              </View>
              <View style={styles.bookingTypeStats}>
                <View style={styles.bookingTypeStat}>
                  <Text style={styles.bookingTypeValue}>{stats?.online_bookings || 0}</Text>
                  <Text style={styles.bookingTypeLabel}>Count</Text>
                </View>
                <View style={styles.bookingTypeDivider} />
                <View style={styles.bookingTypeStat}>
                  <Text style={[styles.bookingTypeValue, { color: '#059669' }]}>₹{stats?.online_revenue || '0'}</Text>
                  <Text style={styles.bookingTypeLabel}>Revenue</Text>
                </View>
              </View>
            </View>

            <View style={styles.bookingTypeCard}>
              <View style={styles.bookingTypeHeader}>
                <View style={[styles.bookingTypeIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="cash-outline" size={20} color="#B45309" />
                </View>
                <Text style={styles.bookingTypeTitle}>Offline Bookings</Text>
              </View>
              <View style={styles.bookingTypeStats}>
                <View style={styles.bookingTypeStat}>
                  <Text style={styles.bookingTypeValue}>{stats?.offline_bookings || 0}</Text>
                  <Text style={styles.bookingTypeLabel}>Count</Text>
                </View>
                <View style={styles.bookingTypeDivider} />
                <View style={styles.bookingTypeStat}>
                  <Text style={[styles.bookingTypeValue, { color: '#059669' }]}>₹{stats?.offline_revenue || '0'}</Text>
                  <Text style={styles.bookingTypeLabel}>Revenue</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.paymentCards}>
            <View style={[styles.paymentCard, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#047857" />
              <View style={styles.paymentContent}>
                <Text style={styles.paymentValue}>₹{stats?.paid_amount || '0'}</Text>
                <Text style={styles.paymentLabel}>Paid</Text>
              </View>
            </View>
            <View style={[styles.paymentCard, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={24} color="#B45309" />
              <View style={styles.paymentContent}>
                <Text style={styles.paymentValue}>₹{stats?.pending_amount || '0'}</Text>
                <Text style={styles.paymentLabel}>Pending</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bookings')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {bookings.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No recent bookings</Text>
            </Card>
          ) : (
            bookings.slice(0, 5).map((booking) => (
              <TouchableOpacity key={booking.id} onPress={() => navigation.navigate('Bookings')} activeOpacity={0.9}>
                <View style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingTitleRow}>
                      <View style={styles.bookingIconCircle}>
                        <Ionicons name="football-outline" size={20} color="#0284C7" />
                      </View>
                      <View style={styles.bookingTitleContent}>
                        <Text style={styles.bookingTurf}>{booking.turf?.name || 'N/A'}</Text>
                        <Text style={styles.bookingPlayer}>{booking.player_name}</Text>
                      </View>
                    </View>
                    <View style={styles.bookingAmountContainer}>
                      <Text style={styles.bookingAmount}>₹{booking.final_amount || booking.amount}</Text>
                    </View>
                  </View>
                  <View style={styles.bookingFooter}>
                    <View style={styles.bookingTimeRow}>
                      <Ionicons name="time-outline" size={14} color="#64748B" />
                      <Text style={styles.bookingTime}>
                        {booking.start_time && new Date('2000-01-01 ' + booking.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {booking.end_time && new Date('2000-01-01 ' + booking.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </Text>
                    </View>
                    <View style={styles.bookingBadges}>
                      <View style={[styles.badge, styles[`badge_${booking.booking_type}`]]}>
                        <Text style={[styles.badgeText, styles[`badgeText_${booking.booking_type}`]]}>{booking.booking_type}</Text>
                      </View>
                      <View style={[styles.statusBadge, styles[`status_${booking.booking_status}`]]}>
                        <Text style={[styles.statusText, styles[`statusText_${booking.booking_status}`]]}>{booking.booking_status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  statsContainer: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    ...SHADOWS.medium,
    elevation: 3,
  },
  statIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    ...FONTS.h2,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...FONTS.tiny,
    color: '#64748B',
    fontWeight: '500',
  },
  bookingTypeCards: {
    marginTop: SIZES.lg,
    gap: SIZES.md,
  },
  bookingTypeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
    ...SHADOWS.medium,
    elevation: 3,
  },
  bookingTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  bookingTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingTypeTitle: {
    ...FONTS.bodyMedium,
    color: '#0F172A',
    fontWeight: '600',
  },
  bookingTypeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingTypeStat: {
    flex: 1,
  },
  bookingTypeDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: SIZES.md,
  },
  bookingTypeValue: {
    ...FONTS.h2,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 4,
  },
  bookingTypeLabel: {
    ...FONTS.caption,
    color: '#64748B',
  },
  paymentCards: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.lg,
  },
  paymentCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.lg,
    borderRadius: 16,
    ...SHADOWS.medium,
    elevation: 2,
  },
  paymentContent: {
    flex: 1,
  },
  paymentValue: {
    ...FONTS.h3,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 2,
  },
  paymentLabel: {
    ...FONTS.caption,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    padding: SIZES.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  seeAll: {
    ...FONTS.captionMedium,
    color: COLORS.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  bookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    flex: 1,
  },
  bookingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingTitleContent: {
    flex: 1,
  },
  bookingTurf: {
    ...FONTS.bodyMedium,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingPlayer: {
    ...FONTS.caption,
    color: '#64748B',
  },
  bookingAmountContainer: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookingAmount: {
    ...FONTS.bodyMedium,
    fontWeight: '700',
    color: '#16A34A',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bookingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingTime: {
    ...FONTS.tiny,
    color: '#64748B',
  },
  bookingBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    ...FONTS.tiny,
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 9,
  },
  badge_online: {
    backgroundColor: '#DBEAFE',
  },
  badgeText_online: {
    color: '#1D4ED8',
  },
  badge_offline: {
    backgroundColor: '#FEF3C7',
  },
  badgeText_offline: {
    color: '#B45309',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    ...FONTS.tiny,
    textTransform: 'capitalize',
    fontWeight: '600',
    fontSize: 9,
  },
  status_confirmed: {
    backgroundColor: '#E0E7FF',
  },
  statusText_confirmed: {
    color: '#4338CA',
  },
  status_completed: {
    backgroundColor: '#D1FAE5',
  },
  statusText_completed: {
    color: '#047857',
  },
  status_cancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusText_cancelled: {
    color: '#DC2626',
  },
  status_no_show: {
    backgroundColor: '#FEF3C7',
  },
  statusText_no_show: {
    color: '#B45309',
  },
});
