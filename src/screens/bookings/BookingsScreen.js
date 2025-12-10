import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
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
      setBookings(response.data);
    } catch (error) {
      console.error('Load bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = ({ item }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>#{item.id}</Text>
        <Text style={[styles.status, styles[item.booking_status]]}>{item.booking_status}</Text>
      </View>
      <Text style={styles.turfName}>{item.turf?.name}</Text>
      <Text style={styles.playerName}>{item.player?.name} • {item.player?.phone}</Text>
      <Text style={styles.bookingDate}>{item.booking_date} • {item.slot_time}</Text>
      <View style={styles.bookingFooter}>
        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text style={styles.paymentMethod}>{item.payment_method}</Text>
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

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBookings} />}
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
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  paymentMethod: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
});
