import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SIZES.md + 2,
    paddingHorizontal: SIZES.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: COLORS.action,
  },
  action: {
    backgroundColor: '#E06C1F',
  },
  secondary: {
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  text: {
    ...FONTS.body,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  actionText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: COLORS.gray[900],
  },
  disabled: {
    opacity: 0.5,
  },
});
