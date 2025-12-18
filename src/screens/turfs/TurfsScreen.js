import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { turfService } from '../../services/turfService';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

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
    <TouchableOpacity onPress={() => navigation.navigate('TurfDetail', { id: item.id })}>
      <Card style={styles.turfCard}>
        <View style={styles.turfHeader}>
          <Text style={styles.turfName}>{item.name}</Text>
          <Text style={[styles.status, styles[item.status]]}>{item.status}</Text>
        </View>
        <Text style={styles.turfLocation}>{item.city}</Text>
        <View style={styles.turfFooter}>
          <Text style={styles.turfSport}>{item.sport_type}</Text>
          <Text style={styles.turfPrice}>₹{item.uniform_price || 'Dynamic'}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="My Turfs" subtitle={`Total: ${turfs.length}`} />
      {turfs.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No turfs found</Text>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
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
    ...FONTS.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
