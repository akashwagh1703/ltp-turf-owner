import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, GRADIENTS } from '../constants/theme';

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={GRADIENTS.primary}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>LTP Turf Owner</Text>
        <Text style={styles.tagline}>Manage Your Turfs Effortlessly</Text>

        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </View>

      {/* Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SIZES.xl,
  },
  title: {
    ...FONTS.h1,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SIZES.sm,
  },
  tagline: {
    ...FONTS.body,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: SIZES.xxxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  version: {
    ...FONTS.small,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: SIZES.xxl,
  },
});
