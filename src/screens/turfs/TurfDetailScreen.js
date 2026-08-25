import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { turfService } from '../../services/turfService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const STATUS_LABEL = {
  draft: 'Draft',
  pending: 'Waiting for LTP',
  approved: 'Live',
  suspended: 'Suspended',
};

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
      console.log('🖼️ Turf Images:', JSON.stringify(turfData.images, null, 2));
      setTurf(turfData);
    } catch (error) {
      console.error('❌ Load turf error:', error);
      Alert.alert('Error', 'Failed to load turf details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('TurfWizard', { id: turf.id });
  };

  if (loading || !turf) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{turf.name}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{turf.name}</Text>
            <Text style={[styles.status, styles[turf.status]]}>{STATUS_LABEL[turf.status] || turf.status}</Text>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {turf.images.map((image, index) => {
                const imageUrl = image.image_url || image.url;
                if (!imageUrl) {
                  return null;
                }

                return (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                      onError={(e) => console.log(`❌ Image ${index} load error:`, imageUrl, e.nativeEvent.error)}
                      onLoad={() => console.log(`✅ Image ${index} loaded:`, imageUrl)}
                    />
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </Card>
        )}

        <Button 
          title="Edit turf" 
          onPress={handleEdit}
          style={styles.updateButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color={COLORS.primary[600]} />
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
    ...FONTS.h3,
    color: '#FFF',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
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
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  approved: {
    backgroundColor: COLORS.success[100],
    color: COLORS.success[700],
  },
  pending: {
    backgroundColor: COLORS.warning[100],
    color: COLORS.warning[700],
  },
  draft: {
    backgroundColor: COLORS.gray[200],
    color: COLORS.gray[700],
  },
  suspended: {
    backgroundColor: COLORS.error[100],
    color: COLORS.error[700],
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
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  amenityText: {
    ...FONTS.caption,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  updateButton: {
    margin: SIZES.lg,
  },
  imagesScroll: {
    marginHorizontal: -SIZES.md,
  },
  imageContainer: {
    marginRight: SIZES.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.gray[100],
    position: 'relative',
    ...SHADOWS.small,
  },
  image: {
    width: width * 0.7,
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
});
