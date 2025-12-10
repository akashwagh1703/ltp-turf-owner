import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
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
      setTurfs(response.data);
    } catch (error) {
      console.error('Load turfs error:', error);
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
        <Text style={styles.turfLocation}>{item.city}, {item.state}</Text>
        <Text style={styles.turfSport}>{item.sport_type}</Text>
        <View style={styles.turfFooter}>
          <Text style={styles.turfPrice}>₹{item.uniform_price || 'Dynamic'}/hr</Text>
          <Text style={styles.turfSize}>{item.size}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Turfs</Text>
      </View>
      <FlatList
        data={turfs}
        renderItem={renderTurf}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTurfs} />}
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
    padding: SIZES.lg,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
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
    marginBottom: SIZES.xs,
  },
  turfSport: {
    ...FONTS.caption,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  turfFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  turfPrice: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  turfSize: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
});
