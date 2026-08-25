import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { turfService } from '../../services/turfService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../../constants/theme';

const ACTION = '#E06C1F';

const STATUS_LABEL = {
  draft: 'Draft',
  pending: 'Waiting for LTP',
  approved: 'Live',
  suspended: 'Suspended',
};

export default function TurfsScreen({ navigation }) {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTurfs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await turfService.getTurfs();
      const turfsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setTurfs(turfsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load turfs. Please check your connection.');
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTurfs();
    }, [loadTurfs])
  );

  const openTurf = (item) => {
    if (item.status === 'approved' || item.status === 'suspended') {
      navigation.navigate('TurfDetail', { id: item.id });
    } else {
      navigation.navigate('TurfWizard', { id: item.id });
    }
  };

  const renderTurf = ({ item }) => (
    <TouchableOpacity onPress={() => openTurf(item)} activeOpacity={0.7}>
      <View style={[styles.turfCard, SHADOWS.medium]}>
        <View style={styles.turfHeader}>
          <Text style={styles.turfName}>{item.name === 'Untitled turf' ? 'Untitled draft' : item.name}</Text>
          <Text style={[styles.status, styles[item.status] || styles.draft]}>
            {STATUS_LABEL[item.status] || item.status}
          </Text>
        </View>
        <Text style={styles.turfLocation}>{item.city || 'City not set'}</Text>
        <View style={styles.turfFooter}>
          <Text style={styles.turfSport}>{item.sport_type}</Text>
          <Text style={styles.turfPrice}>{item.uniform_price ? `₹${item.uniform_price}` : 'No price'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Turfs</Text>
            <Text style={styles.headerSubtitle}>{turfs.length} {turfs.length === 1 ? 'turf' : 'turfs'}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('TurfWizard')} activeOpacity={0.85}>
            <Ionicons name="add" size={22} color="#FFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {turfs.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="business-outline" size={64} color={COLORS.gray[400]} />
          </View>
          <Text style={styles.emptyText}>No turfs yet</Text>
          <Text style={styles.emptySubtext}>Add your turf, then submit it to LTP.</Text>
          <TouchableOpacity style={styles.emptyCta} onPress={() => navigation.navigate('TurfWizard')}>
            <Text style={styles.emptyCtaText}>Add turf</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={turfs}
          renderItem={renderTurf}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTurfs} />}
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
  headerSubtitle: {
    ...FONTS.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statsContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ACTION,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: '#FFF', fontWeight: '700' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  emptyText: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  emptySubtext: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyCta: {
    marginTop: SIZES.lg,
    backgroundColor: ACTION,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyCtaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  list: {
    padding: SIZES.lg,
  },
  turfCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  turfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  turfName: {
    ...FONTS.h3,
    color: COLORS.text,
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
  turfLocation: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  turfSport: {
    ...FONTS.caption,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  turfFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  turfPrice: {
    ...FONTS.h4,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
});
