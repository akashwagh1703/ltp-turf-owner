import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

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
      <View style={styles.content}>
        <Text style={styles.title}>Turf Owner Login</Text>
        <Text style={styles.subtitle}>Manage your turfs and bookings</Text>

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
          <Input
            label="OTP"
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
    justifyContent: 'center',
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xl,
  },
});
