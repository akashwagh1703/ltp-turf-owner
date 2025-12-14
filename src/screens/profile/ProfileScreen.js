import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

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
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon') },
    { icon: 'information-circle-outline', label: 'About', onPress: () => Alert.alert('About', 'Turf Owner App v1.0.0') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.name}>{user?.name || 'Turf Owner'}</Text>
          <Text style={styles.phone}>{user?.phone || 'N/A'}</Text>
          <Text style={styles.email}>{user?.email || 'No email'}</Text>
        </Card>

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
    padding: SIZES.lg,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
  },
  profileCard: {
    margin: SIZES.lg,
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  avatarContainer: {
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  phone: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  email: {
    ...FONTS.caption,
    color: COLORS.textLight,
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
    backgroundColor: COLORS.card,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
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
    backgroundColor: COLORS.errorLight,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    margin: SIZES.lg,
    marginTop: SIZES.xl,
  },
  logoutText: {
    ...FONTS.bodyMedium,
    color: COLORS.error,
    marginLeft: SIZES.sm,
  },
  version: {
    ...FONTS.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
});
