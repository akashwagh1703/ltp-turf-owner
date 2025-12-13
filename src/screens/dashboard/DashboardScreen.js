import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/common/Card';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

export default function DashboardScreen({ navigation }) {
  const { owner } = useAuth();
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#0EA5E9', '#0284C7', '#0369A1']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{(owner?.name || 'O')[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.greeting}>Welcome back 👋</Text>
                  <Text style={styles.ownerName}>{owner?.name || 'Owner'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
                <View style={styles.notificationBadge} />
                <Ionicons name="notifications" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

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

            <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Bookings')} activeOpacity={0.85}>
              <View style={[styles.statIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="calendar" size={26} color="#2563EB" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stats?.total_bookings || 0}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
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
              <View style={[styles.statIconCircle, { backgroundColor: '#E9D5FF' }]}>
                <Ionicons name="wallet" size={26} color="#7C3AED" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>₹{stats?.total_revenue || '0'}</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    marginBottom: -40,
  },
  header: {
    paddingTop: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    ...FONTS.h2,
    color: '#FFF',
    fontWeight: '700',
  },
  greeting: {
    ...FONTS.caption,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  ownerName: {
    ...FONTS.h3,
    color: '#FFF',
    fontWeight: '700',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  statsContainer: {
    paddingHorizontal: SIZES.lg,
    marginTop: 50,
    marginBottom: SIZES.md,
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
});
