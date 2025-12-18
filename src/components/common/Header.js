import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { SIZES, FONTS } from '../../constants/theme';

export default function Header({ title, subtitle, showAvatar = false, showNotification = false, rightComponent }) {
  const { user } = useAuth();

  if (showAvatar) {
    return (
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{(user?.name || 'O')[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>{title || `Hi, ${user?.name || 'Owner'} 👋`}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {showNotification && (
            <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
              <View style={styles.notificationBadge} />
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          {rightComponent}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.simpleHeader}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.simpleSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  gradientHeader: {
    paddingTop: SIZES.md,
    paddingHorizontal: SIZES.lg,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
  },
  greeting: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '700',
  },
  simpleSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
});
