import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { turfService } from '../../services/turfService';
import { bookingService } from '../../services/bookingService';
import { slotService } from '../../services/slotService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../../constants/theme';

export default function CreateOfflineBookingScreen({ navigation }) {
  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [formData, setFormData] = useState({
    player_name: '',
    player_phone: '',
    booking_date: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
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
  const [paymentType, setPaymentType] = useState('full');
  const [paidAmount, setPaidAmount] = useState('');

  const formatTime = (time) => {
    if (!time) return '';
    // Handle both HH:MM and HH:MM:SS formats
    const parts = time.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
      const activeTurfs = turfsData.filter((turf) => turf.status === 'approved');
      setTurfs(activeTurfs);
      if (activeTurfs.length === 0) {
        Alert.alert(
          'No live turfs yet',
          'Submit your turf to LTP first. Walk-in bookings open after LTP approves it.'
        );
      }
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
    // Sum up individual slot prices from API, fallback to uniform price
    const totalPrice = selectedSlots.reduce((sum, slot) => {
      const slotPrice = parseFloat(slot.price || selectedTurf?.uniform_price || 0);
      console.log('💰 Slot price calculation:', { slot_id: slot.id, slot_price: slot.price, uniform_price: selectedTurf?.uniform_price, used_price: slotPrice });
      return sum + slotPrice;
    }, 0);
    console.log('💰 Total calculated amount:', totalPrice);
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

    // Validate partial payment
    if (paymentType === 'partial') {
      const advance = parseFloat(paidAmount);
      const total = parseFloat(calculateTotalAmount());
      if (!paidAmount || advance <= 0) {
        Alert.alert('Error', 'Please enter advance amount');
        return;
      }
      if (advance > total) {
        Alert.alert('Error', 'Advance amount cannot be more than total amount');
        return;
      }
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
        payment_type: paymentType,
        paid_amount: paymentType === 'partial' ? parseFloat(paidAmount) : (paymentType === 'full' ? parseFloat(totalAmount) : 0),
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
          errorMessage = data.message || 'Invalid booking information. Please check all fields.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again in a moment.';
        } else if (status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (status === 403) {
          errorMessage = data.message || 'This turf is not live yet. Wait for LTP to approve it.';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Booking</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Turf</Text>
          {turfs.length === 0 ? (
            <Text style={styles.emptyTurfs}>
              Wait for LTP to approve your turf before adding bookings.
            </Text>
          ) : (
            turfs.map((turf) => (
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
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary[500]} />
              )}
            </TouchableOpacity>
          ))
          )}
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
                {(() => {
                  const [year, month, day] = formData.booking_date.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  return date.toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  });
                })()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.gray[600]} />
            </TouchableOpacity>
            {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date && event.type !== 'dismissed') {
                  setSelectedDate(date);
                  // Use local date string to avoid timezone issues
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const formattedDate = `${year}-${month}-${day}`;
                  setFormData({ ...formData, booking_date: formattedDate });
                }
              }}
              minimumDate={new Date()}
            />
            )}
            <Text style={styles.label}>Available Slots</Text>
            <View style={styles.slotsHeader}>
              <Text style={styles.slotsHeaderText}>
                {loadingSlots ? 'Loading slots...' : `${slots.length} slots available`}
              </Text>
              {selectedTurf && !loadingSlots && (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={async () => {
                    try {
                      await slotService.updatePrices({ turf_id: selectedTurf.id, date: formData.booking_date });
                      await loadSlots(); // Reload slots after price update
                      Alert.alert('Success', 'Slot prices updated successfully');
                    } catch (error) {
                      console.error('Price update error:', error);
                      Alert.alert('Error', 'Failed to update prices');
                    }
                  }}
                >
                  <Ionicons name="refresh" size={16} color={COLORS.primary[600]} />
                  <Text style={styles.refreshButtonText}>Refresh Prices</Text>
                </TouchableOpacity>
              )}
            </View>
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
                          color={slot.is_booked ? COLORS.error[700] : (isSelected ? COLORS.primary[500] : COLORS.gray[600])} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[
                          styles.slotText,
                          isSelected && styles.slotTextSelected,
                          slot.is_booked && styles.slotTextBooked,
                        ]}>
                          {formatTime(slot.start_time_display || slot.start_time)}
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
                          <Text style={styles.priceText}>₹{slot.price || selectedTurf?.uniform_price || 0}</Text>
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
                  color={formData.payment_method === method ? COLORS.primary[500] : COLORS.gray[400]} 
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Type</Text>
          <View style={styles.paymentTypeGrid}>
            <TouchableOpacity
              style={[
                styles.paymentTypeCard,
                paymentType === 'full' && styles.paymentTypeCardSelected
              ]}
              onPress={() => {
                setPaymentType('full');
                setPaidAmount(calculateTotalAmount());
              }}
            >
              <Ionicons 
                name="checkmark-done" 
                size={28} 
                color={paymentType === 'full' ? COLORS.primary[500] : COLORS.gray[400]} 
              />
              <Text style={[
                styles.paymentTypeText,
                paymentType === 'full' && styles.paymentTypeTextSelected
              ]}>
                Full Payment
              </Text>
              <Text style={styles.paymentTypeDesc}>Pay complete amount</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentTypeCard,
                paymentType === 'partial' && styles.paymentTypeCardSelected
              ]}
              onPress={() => setPaymentType('partial')}
            >
              <Ionicons 
                name="cash" 
                size={28} 
                color={paymentType === 'partial' ? COLORS.primary[500] : COLORS.gray[400]} 
              />
              <Text style={[
                styles.paymentTypeText,
                paymentType === 'partial' && styles.paymentTypeTextSelected
              ]}>
                Partial Payment
              </Text>
              <Text style={styles.paymentTypeDesc}>Pay advance now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentTypeCard,
                paymentType === 'pay_on_turf' && styles.paymentTypeCardSelected
              ]}
              onPress={() => {
                setPaymentType('pay_on_turf');
                setPaidAmount('0');
              }}
            >
              <Ionicons 
                name="location" 
                size={28} 
                color={paymentType === 'pay_on_turf' ? COLORS.primary[500] : COLORS.gray[400]} 
              />
              <Text style={[
                styles.paymentTypeText,
                paymentType === 'pay_on_turf' && styles.paymentTypeTextSelected
              ]}>
                Pay on Turf
              </Text>
              <Text style={styles.paymentTypeDesc}>Pay at venue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {paymentType === 'partial' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advance Amount</Text>
            <Input
              placeholder="Enter advance amount"
              keyboardType="numeric"
              value={paidAmount}
              onChangeText={(text) => setPaidAmount(text)}
            />
            <View style={styles.advanceOptions}>
              {[30, 50, 100].map((percent) => (
                <TouchableOpacity
                  key={percent}
                  style={styles.advanceOption}
                  onPress={() => {
                    const total = parseFloat(calculateTotalAmount());
                    const advance = (total * percent) / 100;
                    setPaidAmount(advance.toFixed(2));
                  }}
                >
                  <Text style={styles.advanceOptionText}>{percent}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedSlots.length > 0 && (
          <View style={styles.summarySection}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>
                  {formatTime(selectedSlots[0].start_time_display || selectedSlots[0].start_time)} - {formatTime(selectedSlots[selectedSlots.length - 1].end_time_display || selectedSlots[selectedSlots.length - 1].end_time)}
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
              {paymentType === 'partial' && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Advance Paying</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.primary[600], fontWeight: '700' }]}>₹{paidAmount || '0'}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>To Collect at Turf</Text>
                    <Text style={[styles.summaryValue, { color: '#F59E0B', fontWeight: '700' }]}>
                      ₹{(parseFloat(calculateTotalAmount()) - parseFloat(paidAmount || 0)).toFixed(2)}
                    </Text>
                  </View>
                </>
              )}
              {paymentType === 'pay_on_turf' && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>To Collect at Turf</Text>
                  <Text style={[styles.summaryValue, { color: '#F59E0B', fontWeight: '700' }]}>₹{calculateTotalAmount()}</Text>
                </View>
              )}
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
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h2,
    color: '#FFF',
    fontWeight: '700',
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
    color: COLORS.gray[900],
    marginBottom: SIZES.md,
    fontWeight: '600',
  },
  emptyTurfs: {
    ...FONTS.body,
    color: COLORS.gray[600],
    lineHeight: 22,
    backgroundColor: '#FFF7ED',
    padding: SIZES.md,
    borderRadius: 12,
  },
  label: {
    ...FONTS.caption,
    color: COLORS.gray[900],
    marginBottom: SIZES.xs,
    fontWeight: '600',
  },
  turfOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    ...SHADOWS.small,
  },
  turfOptionSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  turfInfo: {
    flex: 1,
  },
  turfName: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  turfLocation: {
    ...FONTS.caption,
    color: COLORS.gray[600],
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    ...SHADOWS.small,
  },
  paymentCardSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  paymentCardText: {
    ...FONTS.caption,
    color: COLORS.gray[700],
    fontWeight: '600',
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  paymentCardTextSelected: {
    color: COLORS.primary[600],
  },
  paymentTypeGrid: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  paymentTypeCard: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    ...SHADOWS.small,
  },
  paymentTypeCardSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  paymentTypeText: {
    ...FONTS.caption,
    color: COLORS.gray[700],
    fontWeight: '600',
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  paymentTypeTextSelected: {
    color: COLORS.primary[600],
  },
  paymentTypeDesc: {
    ...FONTS.caption,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 2,
    fontSize: 11,
  },
  advanceOptions: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.sm,
  },
  advanceOption: {
    flex: 1,
    padding: SIZES.sm,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[500],
  },
  advanceOptionText: {
    ...FONTS.body,
    color: COLORS.primary[600],
    fontWeight: '700',
  },
  summarySection: {
    padding: SIZES.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.gray[50],
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  summaryLabel: {
    ...FONTS.body,
    color: COLORS.gray[600],
  },
  summaryValue: {
    ...FONTS.body,
    color: COLORS.gray[900],
    fontWeight: '600',
  },
  summaryTotal: {
    marginTop: SIZES.xs,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  summaryTotalLabel: {
    ...FONTS.body,
    color: COLORS.gray[900],
    fontWeight: '600',
  },
  summaryAmount: {
    ...FONTS.h2,
    color: COLORS.primary[600],
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
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: SIZES.md,
    minHeight: 48,
  },
  dateText: {
    ...FONTS.body,
    color: COLORS.gray[900],
    fontWeight: '500',
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.gray[600],
    textAlign: 'center',
    padding: SIZES.lg,
  },
  emptySlots: {
    ...FONTS.body,
    color: COLORS.gray[600],
    textAlign: 'center',
    padding: SIZES.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderRadius: 10,
    backgroundColor: '#FFF',
    minWidth: '48%',
    maxWidth: '48%',
    ...SHADOWS.small,
  },
  slotOptionSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  slotOptionBooked: {
    backgroundColor: COLORS.error[50],
    borderColor: COLORS.error[300],
  },
  slotText: {
    ...FONTS.caption,
    color: COLORS.gray[900],
    fontWeight: '600',
    fontSize: 13,
  },
  slotTextSelected: {
    color: COLORS.primary[600],
  },
  slotTextBooked: {
    color: COLORS.error[700],
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
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
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
    color: COLORS.primary[600],
    fontWeight: '700',
  },
  amountDetail: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  slotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  slotsHeaderText: {
    ...FONTS.caption,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  refreshButtonText: {
    ...FONTS.caption,
    color: COLORS.primary[600],
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 11,
  },
});
