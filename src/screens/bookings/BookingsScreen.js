import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { bookingService } from '../../services/bookingService';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function BookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingService.getBookings(params);
      console.log('📊 Bookings Response:', response.data);
      const bookingsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setBookings(bookingsData);
    } catch (error) {
      console.error('❌ Load bookings error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load bookings. Please check your connection.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = ({ item }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>#{item.booking_number || item.id}</Text>
        <Text style={[styles.status, styles[item.booking_status]]}>{item.booking_status}</Text>
      </View>
      <Text style={styles.turfName}>{item.turf?.name}</Text>
      <Text style={styles.playerName}>{item.player_name} • {item.player_phone}</Text>
      <Text style={styles.bookingDate}>
        {new Date(item.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>
      <Text style={styles.bookingSlots}>
        {item.start_time && new Date('2000-01-01 ' + item.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {item.end_time && new Date('2000-01-01 ' + item.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} ({item.slot_duration} min)
      </Text>
      <View style={styles.bookingFooter}>
        <Text style={styles.amount}>₹{item.final_amount || item.amount}</Text>
        <View style={styles.badges}>
          <Text style={styles.bookingType}>{item.booking_type}</Text>
          <Text style={[styles.paymentStatus, styles[`payment_${item.payment_status}`]]}>
            {item.payment_status}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Button
          title="+ Offline"
          onPress={() => navigation.navigate('CreateOfflineBooking')}
          style={styles.addButton}
        />
      </View>

      <View style={styles.filters}>
        {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.filterActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {bookings.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Bookings Found</Text>
          <Text style={styles.emptyText}>
            {filter === 'all' 
              ? 'You don\'t have any bookings yet'
              : `No ${filter} bookings found`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBookings} />}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
  },
  addButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  filterButton: {
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SIZES.sm,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...FONTS.caption,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: '#FFF',
  },
  list: {
    padding: SIZES.lg,
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
  bookingId: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  status: {
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
  cancelled: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  turfName: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  playerName: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  bookingDate: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  bookingSlots: {
    ...FONTS.caption,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: SIZES.sm,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  amount: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  badges: {
    flexDirection: 'row',
    gap: SIZES.xs,
  },
  bookingType: {
    ...FONTS.small,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
    backgroundColor: '#F3F4F6',
    color: '#374151',
    textTransform: 'capitalize',
  },
  paymentStatus: {
    ...FONTS.small,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
    textTransform: 'capitalize',
  },
  payment_success: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  payment_pending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  payment_failed: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
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
