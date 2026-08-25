import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import { bookingService } from '../../services/bookingService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../../constants/theme';

export default function BookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    booking_type: 'all',
    payment_status: 'all',
    date: 'today'
  });

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [filters])
  );

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.booking_type !== 'all') params.booking_type = filters.booking_type;
      if (filters.payment_status !== 'all') params.payment_status = filters.payment_status;
      if (filters.date === 'today' && filters.status !== 'needs_confirmation') {
        params.date = new Date().toISOString().split('T')[0];
      } else if (filters.date === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        params.date = d.toISOString().split('T')[0];
      } else if (filters.date === 'today') {
        params.date = new Date().toISOString().split('T')[0];
      }
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

  const handleCancelBooking = (booking) => {
    Alert.prompt(
      'Cancel Booking',
      `Booking: #${booking.booking_number}\nPlayer: ${booking.player_name}\nDate: ${booking.booking_date}\n\nPlease provide a reason for cancellation:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: (reason) => confirmCancel(booking.id, reason)
        }
      ],
      'plain-text'
    );
  };

  const confirmCancel = async (id, reason) => {
    if (!reason || reason.trim() === '') {
      Alert.alert('Error', 'Please provide a cancellation reason');
      return;
    }
    
    setLoading(true);
    try {
      await bookingService.cancelBooking(id, reason);
      Alert.alert('Success', 'Booking cancelled successfully');
      loadBookings();
    } catch (error) {
      console.error('❌ Cancel error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = (booking) => {
    Alert.alert(
      'Complete Booking',
      `Mark booking #${booking.booking_number} as completed?\n\nPlayer: ${booking.player_name}\nDate: ${booking.booking_date}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => confirmComplete(booking.id) }
      ]
    );
  };

  const confirmComplete = async (id) => {
    setLoading(true);
    try {
      await bookingService.completeBooking(id);
      Alert.alert('Success', 'Booking marked as completed');
      loadBookings();
    } catch (error) {
      console.error('❌ Complete error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const handleNoShowBooking = (booking) => {
    Alert.alert(
      'Mark as No Show',
      `Mark booking #${booking.booking_number} as no-show?\n\nPlayer: ${booking.player_name}\nDate: ${booking.booking_date}\n\nThis indicates the player did not show up.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'No Show', onPress: () => confirmNoShow(booking.id), style: 'destructive' }
      ]
    );
  };

  const confirmNoShow = async (id) => {
    setLoading(true);
    try {
      await bookingService.markNoShow(id);
      Alert.alert('Success', 'Booking marked as no-show');
      loadBookings();
    } catch (error) {
      console.error('❌ No-show error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark as no-show');
    } finally {
      setLoading(false);
    }
  };

  const showBookingDetails = (booking) => {
    const actions = [{ text: 'Close', style: 'cancel' }];
    
    // Build payment details string
    let paymentDetails = '';
    if (booking.paid_amount !== undefined && booking.pending_amount !== undefined) {
      paymentDetails = `\n\nPayment Details:\nPaid: ₹${booking.paid_amount}\nPending: ₹${booking.pending_amount}`;
      if (booking.advance_percentage) {
        paymentDetails += `\nAdvance: ${booking.advance_percentage}%`;
      }
      paymentDetails += `\nType: ${booking.payment_type || 'full'}`;
    }
    
    if (needsConfirm(booking)) {
      actions.push({ text: 'Received', onPress: () => handleReceived(booking) });
      actions.push({ text: 'Not received', onPress: () => handleNotReceived(booking) });
      actions.push({ text: 'Cancel', style: 'destructive', onPress: () => handleCancelBooking(booking) });
    } else if (booking.status === 'confirmed') {
      if (booking.payment_status === 'pending' && booking.pending_amount > 0) {
        actions.push({ text: 'Confirm Payment', onPress: () => handleConfirmPayment(booking) });
      }
      if (booking.payment_status === 'success' && isBookingEnded(booking)) {
        actions.push({ text: 'Complete', onPress: () => handleCompleteBooking(booking) });
        actions.push({ text: 'No Show', onPress: () => handleNoShowBooking(booking) });
      }
      actions.push({ text: 'Cancel', style: 'destructive', onPress: () => handleCancelBooking(booking) });
    }
    
    Alert.alert(
      `Booking #${booking.booking_number}`,
      `Player: ${booking.player_name}\nPhone: ${booking.player_phone}\nTurf: ${booking.turf?.name}\nDate: ${booking.booking_date}\nTime: ${booking.start_time} - ${booking.end_time}\nDuration: ${booking.slot_duration} min\nAmount: ₹${booking.final_amount || booking.amount}${paymentDetails}\nType: ${booking.booking_type}\nStatus: ${statusLabel(booking.status)}\nPayment: ${booking.payment_status}`,
      actions
    );
  };

  const handleConfirmPayment = (booking) => {
    const pendingAmount = booking.pending_amount || booking.final_amount || booking.amount;
    const paidAmount = booking.paid_amount || 0;
    
    Alert.alert(
      'Confirm Payment',
      `Booking: #${booking.booking_number}\n\nPayment Summary:\nTotal Amount: ₹${booking.final_amount || booking.amount}\nAlready Paid: ₹${paidAmount}\nPending Amount: ₹${pendingAmount}\n\nConfirm that ₹${pendingAmount} has been received?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => confirmPayment(booking.id, pendingAmount) }
      ]
    );
  };

  const confirmPayment = async (id, amount) => {
    setLoading(true);
    try {
      const response = await bookingService.confirmPayment(id, amount);
      const paymentDetails = response.data?.payment_details;

      let message = response.data?.message || 'Payment confirmed successfully';
      if (paymentDetails && !response.data?.message) {
        message = `Payment Confirmed!\n\nPreviously Paid: ₹${paymentDetails.previous_paid_amount}\nJust Received: ₹${paymentDetails.additional_amount_paid}\nTotal Paid: ₹${paymentDetails.total_paid_amount}\nRemaining: ₹${paymentDetails.remaining_amount}`;
      }

      Alert.alert('Success', message);
      loadBookings();
    } catch (error) {
      console.error('❌ Confirm payment error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const needsConfirm = (booking) =>
    booking.status === 'awaiting_confirmation' || booking.status === 'pay_on_arrival';

  const statusLabel = (status) => {
    switch (status) {
      case 'awaiting_confirmation':
        return 'Needs confirm';
      case 'pay_on_arrival':
        return 'Pay at turf';
      case 'no_show':
        return 'No Show';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const handleReceived = (booking) => {
    const amount = booking.final_amount || booking.amount;
    Alert.alert(
      'Did the money arrive?',
      `Did ₹${amount} arrive from ${booking.player_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Received', onPress: () => confirmPayment(booking.id) },
      ]
    );
  };

  const handleNotReceived = (booking) => {
    Alert.alert(
      'Not received',
      `Tell ${booking.player_name} that ₹${booking.final_amount || booking.amount} has not arrived yet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Not received',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await bookingService.rejectPayment(booking.id);
              Alert.alert('Told the player', 'They can pay again and tap I have paid.');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject payment');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const isBookingEnded = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.booking_date);
    const [hours, minutes] = booking.end_time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes), 0);
    return now > bookingDate;
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity 
      onPress={() => showBookingDetails(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.bookingCard, SHADOWS.medium]}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>#{item.booking_number || item.id}</Text>
        <Text style={[styles.status, styles[item.status] || styles.confirmed]}>
          {statusLabel(item.status)}
        </Text>
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
        <View>
          <Text style={styles.amount}>₹{item.final_amount || item.amount}</Text>
          {item.paid_amount !== undefined && item.pending_amount !== undefined && item.pending_amount > 0 && (
            <Text style={styles.paymentBreakdown}>
              Paid: ₹{item.paid_amount} | Pending: ₹{item.pending_amount}
            </Text>
          )}
        </View>
        <View style={styles.badges}>
          <Text style={styles.bookingType}>{item.booking_type}</Text>
          <Text style={[styles.paymentStatus, styles[`payment_${item.payment_status}`]]}>
            {item.payment_status}
          </Text>
        </View>
      </View>
      {needsConfirm(item) && (
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtons}>
            <Button
              title="Received"
              variant="action"
              onPress={() => handleReceived(item)}
              style={styles.actionButton}
            />
            <Button
              title="Not received"
              variant="secondary"
              onPress={() => handleNotReceived(item)}
              style={styles.actionButton}
            />
          </View>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => handleCancelBooking(item)}
            style={styles.cancelButton}
          />
        </View>
      )}
      {item.status === 'confirmed' && (
        <View style={styles.actionButtonsContainer}>
          {item.payment_status === 'pending' && (
            <Button
              title="⚠️ Confirm Payment"
              onPress={() => handleConfirmPayment(item)}
              style={[styles.cancelButton, { marginBottom: SIZES.sm }]}
            />
          )}
          {item.payment_status === 'success' && isBookingEnded(item) && (
            <View style={styles.actionButtons}>
              <Button
                title="Complete"
                onPress={() => handleCompleteBooking(item)}
                style={styles.actionButton}
              />
              <Button
                title="No Show"
                variant="secondary"
                onPress={() => handleNoShowBooking(item)}
                style={styles.actionButton}
              />
            </View>
          )}
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => handleCancelBooking(item)}
            style={styles.cancelButton}
          />
        </View>
      )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Bookings</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateOfflineBooking')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Offline</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          {['all', 'needs_confirmation', 'confirmed', 'completed', 'cancelled', 'no_show'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.statusChip, filters.status === status && styles.statusChipActive]}
              onPress={() => {
                if (status === 'needs_confirmation') {
                  setFilters({ ...filters, status, date: 'all' });
                } else {
                  setFilters({ ...filters, status });
                }
              }}
            >
              <Text style={[styles.statusChipText, filters.status === status && styles.statusChipTextActive]}>
                {status === 'all'
                  ? 'All'
                  : status === 'no_show'
                    ? 'No Show'
                    : status === 'needs_confirmation'
                      ? 'Needs confirm'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={20} color={COLORS.primary[600]} />
          {(filters.booking_type !== 'all' || filters.payment_status !== 'all' || filters.date !== 'today') && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date</Text>
              <View style={styles.filterOptions}>
                {['today', 'tomorrow', 'week', 'all'].map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[styles.filterOption, filters.date === date && styles.filterOptionActive]}
                    onPress={() => setFilters({...filters, date})}
                  >
                    <Text style={[styles.filterOptionText, filters.date === date && styles.filterOptionTextActive]}>
                      {date.charAt(0).toUpperCase() + date.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Booking Type</Text>
              <View style={styles.filterOptions}>
                {['all', 'online', 'offline'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterOption, filters.booking_type === type && styles.filterOptionActive]}
                    onPress={() => setFilters({...filters, booking_type: type})}
                  >
                    <Text style={[styles.filterOptionText, filters.booking_type === type && styles.filterOptionTextActive]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Payment Status</Text>
              <View style={styles.filterOptions}>
                {['all', 'success', 'pending'].map((payment) => (
                  <TouchableOpacity
                    key={payment}
                    style={[styles.filterOption, filters.payment_status === payment && styles.filterOptionActive]}
                    onPress={() => setFilters({...filters, payment_status: payment})}
                  >
                    <Text style={[styles.filterOptionText, filters.payment_status === payment && styles.filterOptionTextActive]}>
                      {payment.charAt(0).toUpperCase() + payment.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Reset"
                variant="secondary"
                onPress={() => setFilters({ ...filters, booking_type: 'all', payment_status: 'all', date: 'today' })}
                style={styles.modalBtn}
              />
              <Button
                title="Apply"
                onPress={() => setShowFilters(false)}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {bookings.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Bookings Found</Text>
          <Text style={styles.emptyText}>No bookings found</Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: 20,
    gap: SIZES.xs,
  },
  addButtonText: {
    ...FONTS.body,
    color: '#FFF',
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: '#FFF',
    gap: SIZES.sm,
  },
  statusFilters: {
    flex: 1,
  },
  statusChip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    marginRight: SIZES.sm,
  },
  statusChipActive: {
    backgroundColor: COLORS.primary[500],
  },
  statusChipText: {
    ...FONTS.caption,
    color: COLORS.gray[600],
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: '#FFF',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SIZES.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  filterSection: {
    marginBottom: SIZES.lg,
  },
  filterSectionTitle: {
    ...FONTS.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SIZES.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  filterOption: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary[500],
  },
  filterOptionText: {
    ...FONTS.caption,
    color: '#64748B',
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#FFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.lg,
  },
  modalBtn: {
    flex: 1,
  },
  list: {
    padding: SIZES.lg,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
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
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  confirmed: {
    backgroundColor: COLORS.primary[100],
    color: COLORS.primary[700],
  },
  completed: {
    backgroundColor: COLORS.success[100],
    color: COLORS.success[700],
  },
  cancelled: {
    backgroundColor: COLORS.error[100],
    color: COLORS.error[700],
  },
  no_show: {
    backgroundColor: COLORS.warning[100],
    color: COLORS.warning[700],
  },
  awaiting_confirmation: {
    backgroundColor: '#FFEDD5',
    color: '#C2410C',
  },
  pay_on_arrival: {
    backgroundColor: COLORS.warning[100],
    color: COLORS.warning[700],
  },
  expired: {
    backgroundColor: COLORS.gray[100],
    color: COLORS.gray[700],
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
    ...FONTS.h3,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  paymentBreakdown: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: SIZES.xs,
  },
  bookingType: {
    ...FONTS.small,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    color: COLORS.gray[700],
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  paymentStatus: {
    ...FONTS.small,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: 8,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  payment_success: {
    backgroundColor: COLORS.success[100],
    color: COLORS.success[700],
  },
  payment_pending: {
    backgroundColor: COLORS.warning[100],
    color: COLORS.warning[700],
  },
  payment_failed: {
    backgroundColor: COLORS.error[100],
    color: COLORS.error[700],
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
  actionButtonsContainer: {
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
  },
  cancelButton: {
    paddingVertical: SIZES.sm,
  },
});
