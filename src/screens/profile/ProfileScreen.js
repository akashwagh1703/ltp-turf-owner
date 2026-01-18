import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon') },
    { icon: 'information-circle-outline', label: 'About', onPress: () => Alert.alert('About', 'Turf Owner App v1.0.0') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#FFF" />
            </View>
          </View>
          <Text style={styles.name}>{user?.name || 'Turf Owner'}</Text>
          <Text style={styles.phone}>{user?.phone || 'N/A'}</Text>
          {user?.email && <Text style={styles.email}>{user.email}</Text>}
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={24} color={COLORS.textSecondary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
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
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxl,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: SIZES.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  name: {
    ...FONTS.h1,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: SIZES.xs,
  },
  phone: {
    ...FONTS.h4,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: SIZES.xs,
  },
  email: {
    ...FONTS.body,
    color: 'rgba(255,255,255,0.85)',
  },
  section: {
    padding: SIZES.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: SIZES.lg,
    borderRadius: 12,
    marginBottom: SIZES.sm,
    ...SHADOWS.small,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    ...FONTS.body,
    color: COLORS.text,
    marginLeft: SIZES.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error[50],
    padding: SIZES.lg,
    borderRadius: 12,
    margin: SIZES.lg,
    marginTop: SIZES.xl,
    borderWidth: 2,
    borderColor: COLORS.error[200],
  },
  logoutText: {
    ...FONTS.h4,
    color: COLORS.error[600],
    marginLeft: SIZES.sm,
    fontWeight: '600',
  },
  version: {
    ...FONTS.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
});
