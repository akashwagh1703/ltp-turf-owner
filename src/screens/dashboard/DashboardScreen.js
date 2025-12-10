import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import { dashboardService } from '../../services/dashboardService';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function DashboardScreen() {
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
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.total_turfs || 0}</Text>
            <Text style={styles.statLabel}>Total Turfs</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.total_bookings || 0}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats?.total_revenue || 0}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats?.pending_payout || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {bookings.map((booking) => (
            <Card key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingTurf}>{booking.turf?.name}</Text>
                <Text style={[styles.bookingStatus, styles[booking.booking_status]]}>
                  {booking.booking_status}
                </Text>
              </View>
              <Text style={styles.bookingDate}>{booking.booking_date} • {booking.slot_time}</Text>
              <Text style={styles.bookingAmount}>₹{booking.amount}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.md,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    marginBottom: SIZES.md,
    marginRight: '3%',
  },
  statValue: {
    ...FONTS.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  section: {
    padding: SIZES.lg,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  bookingCard: {
    marginBottom: SIZES.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  bookingTurf: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookingStatus: {
    ...FONTS.small,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
    textTransform: 'capitalize',
  },
  confirmed: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  completed: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  bookingDate: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  bookingAmount: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
