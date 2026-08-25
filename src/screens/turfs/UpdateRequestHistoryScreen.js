import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import { turfService } from '../../services/turfService';
import { COLORS, SIZES, FONTS, GRADIENTS } from '../../constants/theme';

export default function UpdateRequestHistoryScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await turfService.getUpdateRequests();
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Load requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return COLORS.success[600];
      case 'rejected': return COLORS.error[600];
      default: return COLORS.warning[600];
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'approved': return COLORS.success[100];
      case 'rejected': return COLORS.error[100];
      default: return COLORS.warning[100];
    }
  };

  const renderRequest = ({ item }) => (
    <Card style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.turfName}>{item.turf?.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <Text style={styles.requestDate}>
        Submitted: {new Date(item.created_at).toLocaleDateString()}
      </Text>
      
      {item.changes && (
        <View style={styles.changesContainer}>
          <Text style={styles.changesTitle}>Requested Changes:</Text>
          {Object.entries(JSON.parse(item.changes)).map(([key, value]) => (
            <Text key={key} style={styles.changeItem}>
              • {key.replace('_', ' ')}: {value}
            </Text>
          ))}
        </View>
      )}
      
      {item.admin_notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Admin Notes:</Text>
          <Text style={styles.notesText}>{item.admin_notes}</Text>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Requests</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Ionicons name="document-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No update requests found</Text>
            <Text style={styles.emptySubtext}>
              Submit update requests from turf details screen
            </Text>
          </Card>
        }
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
  listContainer: {
    padding: SIZES.lg,
  },
  requestCard: {
    marginBottom: SIZES.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  turfName: {
    ...FONTS.h4,
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...FONTS.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestDate: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  changesContainer: {
    marginTop: SIZES.sm,
  },
  changesTitle: {
    ...FONTS.small,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  changeItem: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
    textTransform: 'capitalize',
  },
  notesContainer: {
    marginTop: SIZES.sm,
    padding: SIZES.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
  },
  notesTitle: {
    ...FONTS.small,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  notesText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SIZES.xl,
    marginTop: SIZES.xl,
  },
  emptyText: {
    ...FONTS.h4,
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.xs,
  },
});