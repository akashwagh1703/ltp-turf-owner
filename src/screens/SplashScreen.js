import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="football" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Turf Owner</Text>
        <Text style={styles.subtitle}>Manage Your Turfs</Text>
      </View>
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  loader: {
    marginTop: SIZES.xl,
  },
  version: {
    ...FONTS.caption,
    color: COLORS.textLight,
    position: 'absolute',
    bottom: SIZES.xl,
  },
});
