import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { turfService } from '../../services/turfService';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function TurfDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTurf();
  }, []);

  const loadTurf = async () => {
    setLoading(true);
    try {
      const response = await turfService.getTurf(id);
      const turfData = response.data.data || response.data;
      console.log('📊 Turf Detail:', turfData);
      setTurf(turfData);
    } catch (error) {
      console.error('❌ Load turf error:', error);
      Alert.alert('Error', 'Failed to load turf details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdate = () => {
    Alert.alert(
      'Request Update',
      'Contact admin to update turf details',
      [{ text: 'OK' }]
    );
  };

  if (loading || !turf) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Turf Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{turf.name}</Text>
            <Text style={[styles.status, styles[turf.status]]}>{turf.status}</Text>
          </View>
          <Text style={styles.description}>{turf.description}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <InfoRow icon="location" label="Address" value={turf.address_line1} />
          {turf.address_line2 && <InfoRow icon="location-outline" label="" value={turf.address_line2} />}
          <InfoRow icon="business" label="City" value={`${turf.city}, ${turf.state}`} />
          <InfoRow icon="pin" label="Pincode" value={turf.pincode} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Turf Details</Text>
          <InfoRow icon="football" label="Sport Type" value={turf.sport_type} />
          <InfoRow icon="resize" label="Size" value={turf.size} />
          <InfoRow icon="people" label="Capacity" value={`${turf.capacity} players`} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Timing & Pricing</Text>
          <InfoRow icon="time" label="Opening Time" value={turf.opening_time} />
          <InfoRow icon="time-outline" label="Closing Time" value={turf.closing_time} />
          <InfoRow icon="hourglass" label="Slot Duration" value={`${turf.slot_duration} minutes`} />
          <InfoRow 
            icon="cash" 
            label="Price" 
            value={turf.pricing_type === 'uniform' ? `₹${turf.uniform_price}/hr` : 'Dynamic Pricing'} 
          />
        </Card>

        {turf.amenities && turf.amenities.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {turf.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>
                    {amenity.amenity_name || amenity}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {turf.images && turf.images.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Images ({turf.images.length})</Text>
            <Text style={styles.infoText}>Images are managed by admin</Text>
          </Card>
        )}

        <Button 
          title="Request Update" 
          onPress={handleRequestUpdate}
          style={styles.updateButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color={COLORS.primary} />
    <View style={styles.infoContent}>
      {label ? <Text style={styles.infoLabel}>{label}</Text> : null}
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

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
  card: {
    margin: SIZES.lg,
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    flex: 1,
  },
  status: {
    ...FONTS.small,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
    textTransform: 'capitalize',
  },
  approved: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  pending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  suspended: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  description: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: SIZES.sm,
  },
  infoLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.body,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  infoText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  amenityChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.md,
  },
  amenityText: {
    ...FONTS.caption,
    color: COLORS.primary,
  },
  updateButton: {
    margin: SIZES.lg,
  },
});
