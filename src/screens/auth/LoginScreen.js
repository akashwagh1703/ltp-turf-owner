import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { COLORS, SIZES, FONTS, SHADOWS, GRADIENTS } from '../../constants/theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await authService.sendOtp(phone);
      setOtpSent(true);
      Alert.alert('OTP Sent! 📱', 'Please check your phone for the OTP code');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP code');
      return;
    }
    setLoading(true);
    try {
      await login(phone, otp);
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.headerGradient}
          >
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to manage your turfs</Text>
          </LinearGradient>

          {/* Login Card */}
          <View style={styles.cardContainer}>
            <Card style={styles.card}>
              {!otpSent ? (
                // Phone Number Step
                <>
                  <View style={styles.stepHeader}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>Step 1</Text>
                    </View>
                    <Text style={styles.stepTitle}>Enter Your Phone Number</Text>
                    <Text style={styles.stepSubtitle}>We'll send you a verification code</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.phoneInputWrapper}>
                      <View style={styles.countryCode}>
                        <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                      </View>
                      <Input
                        placeholder="Enter 10-digit phone"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phone}
                        onChangeText={setPhone}
                        style={styles.phoneInput}
                      />
                    </View>
                  </View>

                  <Button 
                    title="Send OTP" 
                    onPress={handleSendOtp} 
                    loading={loading}
                    style={styles.button}
                  />
                </>
              ) : (
                // OTP Verification Step
                <>
                  <View style={styles.stepHeader}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>Step 2</Text>
                    </View>
                    <Text style={styles.stepTitle}>Verify OTP</Text>
                    <Text style={styles.stepSubtitle}>
                      Code sent to +91 {phone}
                    </Text>
                    <TouchableOpacity onPress={handleChangeNumber} style={styles.changeNumber}>
                      <Text style={styles.changeNumberText}>Change Number</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="Enter 6-digit OTP"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otp}
                      onChangeText={setOtp}
                      style={styles.otpInput}
                    />
                    <View style={styles.otpHintBox}>
                      <Ionicons name="information-circle" size={16} color={COLORS.info} />
                      <Text style={styles.otpHint}>Development OTP: 999999</Text>
                    </View>
                  </View>

                  <Button 
                    title="Verify & Login" 
                    onPress={handleVerifyOtp} 
                    loading={loading}
                    style={styles.button}
                  />
                  
                  <TouchableOpacity 
                    onPress={handleSendOtp} 
                    style={styles.resendButton}
                    disabled={loading}
                  >
                    <Ionicons name="refresh" size={16} color={COLORS.primary} />
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </Card>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.featureText}>Secure Login</Text>
              </View>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="flash" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.featureText}>Quick Access</Text>
              </View>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.featureText}>Data Protected</Text>
              </View>
            </View>
          </View>

          <Text style={styles.footer}>LTP Turf Owner • Version 1.0.0</Text>
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
  },
  headerGradient: {
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.xxxl + SIZES.xl,
    paddingHorizontal: SIZES.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    ...FONTS.h2,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  subtitle: {
    ...FONTS.body,
    color: '#FFFFFF',
    opacity: 0.95,
    textAlign: 'center',
  },
  cardContainer: {
    marginTop: -SIZES.xxxl,
    paddingHorizontal: SIZES.lg,
  },
  card: {
    ...SHADOWS.large,
    padding: SIZES.xl,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  stepBadge: {
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
    marginBottom: SIZES.md,
  },
  stepBadgeText: {
    ...FONTS.captionMedium,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  stepTitle: {
    ...FONTS.h4,
    color: COLORS.gray[900],
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  stepSubtitle: {
    ...FONTS.caption,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  changeNumber: {
    marginTop: SIZES.sm,
  },
  changeNumberText: {
    ...FONTS.captionMedium,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: SIZES.xl,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  countryCode: {
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  countryCodeText: {
    ...FONTS.bodyMedium,
    color: COLORS.gray[900],
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '600',
  },
  otpHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.xs,
    marginTop: SIZES.md,
    padding: SIZES.sm,
    backgroundColor: COLORS.primary[50],
    borderRadius: SIZES.radiusSm,
  },
  otpHint: {
    ...FONTS.caption,
    color: COLORS.primary[700],
    fontWeight: '500',
  },
  button: {
    marginBottom: SIZES.md,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.xs,
    paddingVertical: SIZES.md,
  },
  resendText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SIZES.xxl,
    paddingHorizontal: SIZES.md,
  },
  feature: {
    alignItems: 'center',
    gap: SIZES.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    ...FONTS.small,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  footer: {
    ...FONTS.caption,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: SIZES.xxl,
    marginBottom: SIZES.xl,
  },
});
