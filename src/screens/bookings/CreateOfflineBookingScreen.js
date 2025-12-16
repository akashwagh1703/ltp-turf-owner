import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { turfService } from '../../services/turfService';
import { bookingService } from '../../services/bookingService';
import { slotService } from '../../services/slotService';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function CreateOfflineBookingScreen({ navigation }) {
  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [formData, setFormData] = useState({
    player_name: '',
    player_phone: '',
    booking_date: new Date().toISOString().split('T')[0],
    slot_time: '',
    amount: '',
    payment_method: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    loadTurfs();
  }, []);

  useEffect(() => {
    if (selectedTurf && formData.booking_date) {
      loadSlots();
    }
  }, [selectedTurf, formData.booking_date]);

  const loadTurfs = async () => {
    try {
      const response = await turfService.getTurfs();
      const turfsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const activeTurfs = turfsData.filter(turf => turf.status !== 'suspended');
      setTurfs(activeTurfs);
    } catch (error) {
      console.error('❌ Load turfs error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load turfs for booking.');
      setTurfs([]);
    }
  };

  const loadSlots = async () => {
    setLoadingSlots(true);
    setSelectedSlots([]);
    try {
      console.log('🔍 Fetching slots for:', {
        turf_id: selectedTurf.id,
        date: formData.booking_date,
        turf_name: selectedTurf.name,
      });
      
      const response = await slotService.getSlots({
        turf_id: selectedTurf.id,
        date: formData.booking_date,
      });
      
      console.log('📊 Raw Slots Response:', JSON.stringify(response.data, null, 2));
      let slotsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      console.log('📊 Parsed Slots Count:', slotsData.length);
      
      // If no slots exist, generate them
      if (slotsData.length === 0) {
        console.log('🔄 No slots found. Generating slots...');
        try {
          const genResponse = await slotService.generateSlots({
            turf_id: selectedTurf.id,
            date: formData.booking_date,
          });
          console.log('✅ Slots generated:', genResponse.data);
          
          // Reload slots after generation
          const newResponse = await slotService.getSlots({
            turf_id: selectedTurf.id,
            date: formData.booking_date,
          });
          console.log('📊 New Slots Response:', JSON.stringify(newResponse.data, null, 2));
          slotsData = Array.isArray(newResponse.data) ? newResponse.data : (newResponse.data.data || []);
          console.log('📊 New Slots Count:', slotsData.length);
        } catch (genError) {
          console.error('❌ Slot generation error:', genError.response?.data || genError.message);
        }
      }
      
      // Sort slots by start time
      if (slotsData.length > 0) {
        slotsData.sort((a, b) => {
          const timeA = a.start_time || a.slot_time || '';
          const timeB = b.start_time || b.slot_time || '';
          return timeA.localeCompare(timeB);
        });
        
        // Filter out past slots for current date
        const today = new Date().toISOString().split('T')[0];
        if (formData.booking_date === today) {
          const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
          slotsData = slotsData.filter(slot => {
            const slotTime = slot.start_time || slot.slot_time || '';
            return slotTime > currentTime;
          });
          console.log('⏰ Filtered past slots. Remaining:', slotsData.length);
        }
        
        console.log('✅ Final slots to display:', slotsData.length);
      }
      
      setSlots(slotsData);
    } catch (error) {
      console.error('❌ Load slots error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load slots: ' + (error.response?.data?.message || error.message));
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot) => {
    if (slot.is_booked) return;

    console.log('🎯 Slot selected:', {
      id: slot.id,
      start_time: slot.start_time,
      price: slot.price,
      turf_uniform_price: selectedTurf?.uniform_price
    });

    const slotIndex = slots.findIndex(s => s.id === slot.id);
    const isSelected = selectedSlots.some(s => s.id === slot.id);

    if (isSelected) {
      // Deselect slot
      const newSelectedSlots = selectedSlots.filter(s => s.id !== slot.id);
      setSelectedSlots(newSelectedSlots);
      console.log('💰 Total after deselect:', calculateTotalAmount());
    } else {
      // Check if slot is consecutive
      if (selectedSlots.length === 0) {
        setSelectedSlots([slot]);
        console.log('💰 First slot selected, price:', slot.price || selectedTurf?.uniform_price);
      } else {
        const selectedIndices = selectedSlots.map(s => slots.findIndex(sl => sl.id === s.id));
        const minIndex = Math.min(...selectedIndices);
        const maxIndex = Math.max(...selectedIndices);
        
        // Check if new slot is adjacent
        if (slotIndex === minIndex - 1 || slotIndex === maxIndex + 1) {
          // Check if all slots in between are available
          const newMin = Math.min(minIndex, slotIndex);
          const newMax = Math.max(maxIndex, slotIndex);
          const allAvailable = slots.slice(newMin, newMax + 1).every(s => !s.is_booked);
          
          if (allAvailable) {
            const newSelectedSlots = [...selectedSlots, slot];
            setSelectedSlots(newSelectedSlots);
            console.log('💰 Total after select:', calculateTotalAmount());
          } else {
            Alert.alert('Error', 'Cannot select non-consecutive slots or skip booked slots');
          }
        } else {
          Alert.alert('Error', 'Please select consecutive time slots only');
        }
      }
    }
  };

  const calculateTotalAmount = () => {
    if (selectedSlots.length === 0) return 0;
    // Sum up individual slot prices if available, otherwise use uniform price
    const totalPrice = selectedSlots.reduce((sum, slot) => {
      const slotPrice = parseFloat(slot.price || selectedTurf?.uniform_price || 0);
      return sum + slotPrice;
    }, 0);
    return totalPrice.toFixed(2);
  };

  const handleSubmit = async () => {
    if (!selectedTurf) {
      Alert.alert('Error', 'Please select a turf');
      return;
    }
    if (!formData.player_name || !formData.player_phone) {
      Alert.alert('Error', 'Please enter player details');
      return;
    }
    if (selectedSlots.length === 0) {
      Alert.alert('Error', 'Please select at least one time slot');
      return;
    }

    setLoading(true);
    try {
      const slotIds = selectedSlots.map(s => s.id);
      const startTime = selectedSlots[0].start_time;
      const endTime = selectedSlots[selectedSlots.length - 1].end_time;
      const totalAmount = calculateTotalAmount();

      const bookingData = {
        turf_id: selectedTurf.id,
        player_name: formData.player_name,
        player_phone: formData.player_phone,
        booking_date: formData.booking_date,
        slot_ids: slotIds,
        start_time: startTime,
        end_time: endTime,
        amount: totalAmount,
        payment_method: formData.payment_method,
      };
      
      console.log('📤 Booking Data:', JSON.stringify(bookingData, null, 2));
      const response = await bookingService.createOfflineBooking(bookingData);
      console.log('✅ Booking created:', response.data);
      Alert.alert('Success', 'Offline booking created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      // Log for debugging only (not shown to user)
      if (__DEV__) {
        console.log('❌ Booking error:', error.response?.status, error.response?.data);
      }
      
      // Reload slots to refresh availability
      await loadSlots();
      
      // Determine user-friendly error message
      let errorTitle = 'Booking Failed';
      let errorMessage = 'Unable to create booking. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          if (data.message?.includes('not available') || data.message?.includes('already')) {
            errorMessage = 'Selected time slots are no longer available. Please choose different slots.';
          } else if (data.errors) {
            errorMessage = 'Please check all booking details and try again.';
          } else {
            errorMessage = 'Selected slots are unavailable. Please select again.';
          }
        } else if (status === 422) {
          errorMessage = 'Invalid booking information. Please check all fields.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again in a moment.';
        } else if (status === 401 || status === 403) {
          errorMessage = 'Session expired. Please login again.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Turf</Text>
          {turfs.map((turf) => (
            <TouchableOpacity
              key={turf.id}
              style={[
                styles.turfOption,
                selectedTurf?.id === turf.id && styles.turfOptionSelected
              ]}
              onPress={() => setSelectedTurf(turf)}
            >
              <View style={styles.turfInfo}>
                <Text style={styles.turfName}>{turf.name}</Text>
                <Text style={styles.turfLocation}>{turf.city} • ₹{turf.uniform_price}/hr</Text>
              </View>
              {selectedTurf?.id === turf.id && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Details</Text>
          <Input
            placeholder="Player Name"
            value={formData.player_name}
            onChangeText={(text) => setFormData({ ...formData, player_name: text })}
          />
          <Input
            placeholder="Phone Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={formData.player_phone}
            onChangeText={(text) => setFormData({ ...formData, player_phone: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time Slots</Text>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.booking_date}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) {
                  setSelectedDate(date);
                  const formattedDate = date.toISOString().split('T')[0];
                  setFormData({ ...formData, booking_date: formattedDate });
                }
              }}
              minimumDate={new Date()}
            />
            )}
            <Text style={styles.label}>Available Slots</Text>
            {loadingSlots ? (
              <Text style={styles.loadingText}>Loading slots...</Text>
            ) : slots.length === 0 ? (
              <Text style={styles.emptySlots}>No slots available. Select turf and date first.</Text>
            ) : (
              <View style={styles.slotsContainer}>
                {slots.map((slot) => {
                  const isSelected = selectedSlots.some(s => s.id === slot.id);
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.slotOption,
                        isSelected && styles.slotOptionSelected,
                        slot.is_booked && styles.slotOptionBooked,
                      ]}
                      onPress={() => handleSlotSelect(slot)}
                      disabled={slot.is_booked}
                      activeOpacity={0.7}
                    >
                      <View style={styles.slotTimeContainer}>
                        <Ionicons 
                          name={slot.is_booked ? "lock-closed" : (isSelected ? "checkmark-circle" : "time-outline")} 
                          size={16} 
                          color={slot.is_booked ? "#991B1B" : (isSelected ? COLORS.primary : COLORS.textSecondary)} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[
                          styles.slotText,
                          isSelected && styles.slotTextSelected,
                          slot.is_booked && styles.slotTextBooked,
                        ]}>
                          {slot.start_time_display || slot.start_time}
                        </Text>
                      </View>
                      {slot.is_booked ? (
                        <View style={styles.bookedInfo}>
                          <Text style={styles.bookedBadge}>Booked</Text>
                          {slot.booking && (
                            <Text style={styles.bookedBy}>{slot.booking.player_name}</Text>
                          )}
                        </View>
                      ) : isSelected && (
                        <View style={styles.priceTag}>
                          <Text style={styles.priceText}>₹{selectedTurf?.uniform_price || 0}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentGrid}>
            {['cash', 'upi', 'pay_on_turf'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentCard,
                  formData.payment_method === method && styles.paymentCardSelected
                ]}
                onPress={() => setFormData({ ...formData, payment_method: method })}
              >
                <Ionicons 
                  name={method === 'cash' ? 'cash-outline' : method === 'upi' ? 'phone-portrait-outline' : 'card-outline'} 
                  size={28} 
                  color={formData.payment_method === method ? COLORS.primary : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.paymentCardText,
                  formData.payment_method === method && styles.paymentCardTextSelected
                ]}>
                  {method === 'pay_on_turf' ? 'Pay on Turf' : method.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedSlots.length > 0 && (
          <View style={styles.summarySection}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>
                  {selectedSlots[0].start_time_display || selectedSlots[0].start_time} - {selectedSlots[selectedSlots.length - 1].end_time_display || selectedSlots[selectedSlots.length - 1].end_time}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{selectedSlots.length} hour(s)</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                <Text style={styles.summaryAmount}>₹{calculateTotalAmount()}</Text>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.buttonSection}>
          <Button
            title="Create Booking"
            onPress={handleSubmit}
            loading={loading}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SIZES.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  label: {
    ...FONTS.caption,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    fontWeight: '600',
  },
  turfOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: '#FFF',
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  turfOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  turfInfo: {
    flex: 1,
  },
  turfName: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  turfLocation: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  paymentCard: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: '#FFF',
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  paymentCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  paymentCardText: {
    ...FONTS.caption,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  paymentCardTextSelected: {
    color: COLORS.primary,
  },
  summarySection: {
    padding: SIZES.lg,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    marginBottom: SIZES.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  summaryLabel: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...FONTS.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  summaryTotal: {
    marginTop: SIZES.xs,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryTotalLabel: {
    ...FONTS.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  summaryAmount: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontWeight: '700',
  },
  buttonSection: {
    padding: SIZES.lg,
  },

  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
    marginBottom: SIZES.md,
  },
  dateText: {
    ...FONTS.body,
    color: COLORS.text,
  },
  datePlaceholder: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SIZES.lg,
  },
  emptySlots: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SIZES.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.xs,
    marginBottom: SIZES.md,
  },
  slotOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: '#FFF',
    minWidth: '48%',
    maxWidth: '48%',
  },
  slotOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E0F2FE',
  },
  slotOptionBooked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  slotText: {
    ...FONTS.caption,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  slotTextSelected: {
    color: COLORS.primary,
  },
  slotTextBooked: {
    color: '#991B1B',
  },
  bookedInfo: {
    alignItems: 'flex-end',
  },
  bookedBadge: {
    ...FONTS.small,
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  bookedBy: {
    ...FONTS.small,
    color: '#DC2626',
    fontSize: 9,
    marginTop: 1,
  },
  slotTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceText: {
    ...FONTS.caption,
    color: '#FFF',
    fontWeight: '700',
    fontSize: 10,
  },
  helperText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },

  amountDisplay: {
    padding: SIZES.md,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amountText: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontWeight: '700',
  },
  amountDetail: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
