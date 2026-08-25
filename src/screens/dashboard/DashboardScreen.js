import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickBookingModal, setQuickBookingModal] = useState(false);

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
      <View style={styles.headerContainer}>
        <Header showAvatar />
        <TouchableOpacity 
          style={styles.offlineButton}
          onPress={() => navigation.navigate('CreateOfflineBooking')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.offlineButtonText}>Offline</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={loadData}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!user?.has_upi && (
          <TouchableOpacity
            style={styles.upiBanner}
            onPress={() => navigation.navigate('Profile', { screen: 'UpiSetup' })}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={22} color="#9A3412" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upiBannerTitle}>Add UPI to take bookings</Text>
              <Text style={styles.upiBannerBody}>Players pay you by scanning your QR</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9A3412" />
          </TouchableOpacity>
        )}
        {stats && stats.can_accept_online_bookings === false && (
          <TouchableOpacity
            style={styles.upiBanner}
            onPress={() => navigation.navigate('Money', { screen: 'PayLtp' })}
            activeOpacity={0.85}
          >
            <Ionicons name="card-outline" size={22} color="#9A3412" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upiBannerTitle}>Pay Let’s Turf Play</Text>
              <Text style={styles.upiBannerBody}>Online bookings are paused until the fee is confirmed</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9A3412" />
          </TouchableOpacity>
        )}
        <View style={styles.statsContainer}>
          {loading && !stats ? (
            <>
              <View style={[styles.todaySummary, styles.skeleton]}>
                <View style={[styles.skeletonLine, { width: '40%', height: 24 }]} />
              </View>
            </>
          ) : (
            <>
          <View style={styles.todaySummary}>
            <View style={styles.summaryHeader}>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
              <Text style={styles.summaryTitle}>Today</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#E06C1F' }]}>{stats?.awaiting_confirmation || 0}</Text>
                <Text style={styles.summaryLabel}>Need confirm</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{stats?.today_bookings || 0}</Text>
                <Text style={styles.summaryLabel}>Today</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <TouchableOpacity style={[styles.quickStatCard, { backgroundColor: '#EFF6FF' }]} onPress={() => navigation.navigate('Turfs')} activeOpacity={0.7}>
              <Ionicons name="football" size={32} color="#3B82F6" />
              <Text style={styles.quickStatNumber}>{stats?.total_turfs || 0}</Text>
              <Text style={styles.quickStatLabel}>My Turfs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickStatCard, { backgroundColor: '#F0FDF4' }]} onPress={() => navigation.navigate('Bookings')} activeOpacity={0.7}>
              <Ionicons name="calendar" size={32} color="#10B981" />
              <Text style={styles.quickStatNumber}>{(stats?.online_bookings || 0) + (stats?.offline_bookings || 0)}</Text>
              <Text style={styles.quickStatLabel}>Total Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickStatCard, { backgroundColor: '#FEF3C7' }]} onPress={() => navigation.navigate('Bookings')} activeOpacity={0.7}>
              <Ionicons name="hourglass" size={32} color="#F59E0B" />
              <Text style={styles.quickStatNumber}>{stats?.awaiting_confirmation || stats?.pending_bookings || 0}</Text>
              <Text style={styles.quickStatLabel}>Need confirm</Text>
            </TouchableOpacity>
          </View>

          {/* Money Overview */}
          <View style={styles.moneySection}>
            <Text style={styles.sectionTitle}>Money</Text>
            <View style={styles.moneyCards}>
              <TouchableOpacity style={styles.moneyCard} onPress={() => navigation.navigate('Money')} activeOpacity={0.7}>
                <View style={styles.moneyCardHeader}>
                  <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                  <Text style={styles.moneyCardLabel}>Received</Text>
                </View>
                <Text style={styles.moneyCardAmount}>₹{stats?.paid_amount || '0'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.moneyCard} onPress={() => navigation.navigate('Bookings')} activeOpacity={0.7}>
                <View style={styles.moneyCardHeader}>
                  <Ionicons name="time-outline" size={28} color="#F59E0B" />
                  <Text style={styles.moneyCardLabel}>To Collect</Text>
                </View>
                <Text style={styles.moneyCardAmount}>₹{stats?.pending_amount || '0'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Booking Types */}
          <View style={styles.bookingTypesSection}>
            <Text style={styles.sectionTitle}>Booking Types</Text>
            <View style={styles.bookingTypeCards}>
              <View style={styles.bookingTypeCard}>
                <View style={styles.bookingTypeHeader}>
                  <Ionicons name="phone-portrait" size={24} color="#3B82F6" />
                  <Text style={styles.bookingTypeTitle}>App Bookings</Text>
                </View>
                <View style={styles.bookingTypeStats}>
                  <View style={styles.bookingTypeStat}>
                    <Text style={styles.bookingTypeValue}>{stats?.online_bookings || 0}</Text>
                    <Text style={styles.bookingTypeLabel}>Count</Text>
                  </View>
                  <View style={styles.bookingTypeDivider} />
                  <View style={styles.bookingTypeStat}>
                    <Text style={[styles.bookingTypeValue, { color: '#10B981' }]}>₹{stats?.online_revenue || '0'}</Text>
                    <Text style={styles.bookingTypeLabel}>Earned</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bookingTypeCard}>
                <View style={styles.bookingTypeHeader}>
                  <Ionicons name="person" size={24} color="#F59E0B" />
                  <Text style={styles.bookingTypeTitle}>Walk-in Bookings</Text>
                </View>
                <View style={styles.bookingTypeStats}>
                  <View style={styles.bookingTypeStat}>
                    <Text style={styles.bookingTypeValue}>{stats?.offline_bookings || 0}</Text>
                    <Text style={styles.bookingTypeLabel}>Count</Text>
                  </View>
                  <View style={styles.bookingTypeDivider} />
                  <View style={styles.bookingTypeStat}>
                    <Text style={[styles.bookingTypeValue, { color: '#10B981' }]}>₹{stats?.offline_revenue || '0'}</Text>
                    <Text style={styles.bookingTypeLabel}>Earned</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bookings')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {bookings.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Bookings Yet</Text>
              <Text style={styles.emptySubtitle}>Bookings will appear here</Text>
            </View>
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
  headerContainer: {
    position: 'relative',
  },
  offlineButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  offlineButtonText: {
    ...FONTS.caption,
    color: '#FFF',
    fontWeight: '600',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  upiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
    backgroundColor: '#FFEDD5',
    borderRadius: 12,
    padding: SIZES.md,
  },
  upiBannerTitle: {
    ...FONTS.body,
    fontWeight: '700',
    color: '#9A3412',
  },
  upiBannerBody: {
    ...FONTS.caption,
    color: '#9A3412',
    marginTop: 2,
  },
  statsContainer: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.md,
  },
  todaySummary: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: SIZES.xl,
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  summaryTitle: {
    ...FONTS.h2,
    color: '#0F172A',
    fontWeight: '700',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    ...FONTS.h1,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLabel: {
    ...FONTS.body,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E2E8F0',
    marginHorizontal: SIZES.lg,
  },
  quickStats: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: SIZES.lg,
    alignItems: 'center',
    ...SHADOWS.small,
    elevation: 2,
  },
  quickStatNumber: {
    ...FONTS.h1,
    color: '#0F172A',
    fontWeight: '800',
    marginTop: SIZES.sm,
    marginBottom: 4,
  },
  quickStatLabel: {
    ...FONTS.caption,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  moneySection: {
    marginBottom: SIZES.lg,
  },
  bookingTypesSection: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: SIZES.md,
  },
  moneyCards: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  moneyCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
    ...SHADOWS.medium,
    elevation: 3,
  },
  moneyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  moneyCardLabel: {
    ...FONTS.body,
    color: '#64748B',
    fontWeight: '600',
  },
  moneyCardAmount: {
    ...FONTS.h2,
    color: '#0F172A',
    fontWeight: '800',
  },
  bookingTypeCards: {
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
  bookingTypeTitle: {
    ...FONTS.body,
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
    color: COLORS.primary[600],
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
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
