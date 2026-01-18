import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import { turfService } from '../../services/turfService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../../constants/theme';

export default function TurfsScreen({ navigation }) {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTurfs();
  }, []);

  const loadTurfs = async () => {
    setLoading(true);
    try {
      const response = await turfService.getTurfs();
      console.log('📊 Turfs Response:', response.data);
      const turfsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      console.log('📊 Turfs Data:', turfsData);
      setTurfs(turfsData);
    } catch (error) {
      console.error('❌ Load turfs error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load turfs. Please check your connection.');
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTurf = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('TurfDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.turfCard, SHADOWS.medium]}>
        <View style={styles.turfHeader}>
          <Text style={styles.turfName}>{item.name}</Text>
          <Text style={[styles.status, styles[item.status]]}>{item.status}</Text>
        </View>
        <Text style={styles.turfLocation}>{item.city}</Text>
        <View style={styles.turfFooter}>
          <Text style={styles.turfSport}>{item.sport_type}</Text>
          <Text style={styles.turfPrice}>₹{item.uniform_price || 'Dynamic'}</Text>
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
            <Text style={styles.headerSubtitle}>{turfs.length} {turfs.length === 1 ? 'Turf' : 'Turfs'}</Text>
          </View>
          <View style={styles.statsContainer}>
            <Ionicons name="business" size={32} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>
      {turfs.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="business-outline" size={64} color={COLORS.gray[400]} />
          </View>
          <Text style={styles.emptyText}>No Turfs Found</Text>
          <Text style={styles.emptySubtext}>Contact admin to add turfs to your account</Text>
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
