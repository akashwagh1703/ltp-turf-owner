import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Please enter valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await authService.sendOtp(phone);
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await login(phone, otp);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="football" size={50} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to manage your turfs</Text>
          </View>

          <Card style={styles.card}>
            <Input
              label="Phone Number"
              placeholder="Enter 10-digit phone"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              editable={!otpSent}
            />

            {otpSent && (
              <View style={styles.otpContainer}>
                <Input
                  label="OTP"
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
                <Text style={styles.otpHint}>Default OTP: 999999</Text>
              </View>
            )}

            {!otpSent ? (
              <Button title="Send OTP" onPress={handleSendOtp} loading={loading} />
            ) : (
              <>
                <Button title="Verify & Login" onPress={handleVerifyOtp} loading={loading} />
                <Button
                  title="Resend OTP"
                  variant="secondary"
                  onPress={handleSendOtp}
                  style={{ marginTop: SIZES.md }}
                />
              </>
            )}
          </Card>

          <Text style={styles.footer}>Turf Owner App v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    ...SHADOWS.medium,
  },
  otpContainer: {
    marginBottom: SIZES.md,
  },
  otpHint: {
    ...FONTS.caption,
    color: COLORS.info,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
  footer: {
    ...FONTS.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.xl,
  },
});
