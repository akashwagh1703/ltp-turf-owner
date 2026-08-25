import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { IMAGE_PICKER_OPTIONS, prepareJpeg } from '../../utils/formData';

const ACTION = '#E06C1F';
const CREAM = '#F7F4EF';
const UPI_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9.-]{2,64}$/;

export default function UpiSetupScreen({ navigation, route, blocking, onSkip }) {
  const { user, refreshUser } = useAuth();
  const isBlocking = blocking || route?.params?.blocking;
  const [upiId, setUpiId] = useState(user?.upi_id || '');
  const [qrUri, setQrUri] = useState(user?.qr_url || null);
  const [picked, setPicked] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pickQr = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload your UPI QR.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    setPicked(asset);
    setQrUri(asset.uri);
  };

  const handleSave = async () => {
    const trimmed = upiId.trim().toLowerCase();
    if (!UPI_REGEX.test(trimmed)) {
      setError('Enter a valid UPI ID, like name@oksbi or 9876543210@ybl');
      return;
    }
    if (!picked && !user?.has_upi) {
      setError('Upload a photo of your UPI QR from GPay, PhonePe, or Paytm.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('upi_id', trimmed);
      if (picked) {
        formData.append('qr', await prepareJpeg(picked));
      }

      const response = await authService.updateUpi(formData);
      const owner = response.data?.data || response.data;
      if (refreshUser) {
        await refreshUser();
      }
      Alert.alert(
        'UPI saved',
        response.data?.message || 'Players can pay you by scanning this QR.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation?.canGoBack?.()) {
                navigation.goBack();
              }
            },
          },
        ]
      );
      return owner;
    } catch (err) {
      const message =
        err.response?.data?.errors?.upi_id?.[0] ||
        err.response?.data?.errors?.qr?.[0] ||
        err.response?.data?.message ||
        err.message ||
        'Could not save UPI. Try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {!isBlocking && navigation?.canGoBack?.() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backHit}>
            <Ionicons name="chevron-back" size={24} color={COLORS.gray[900]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backHit} />
        )}
        <Text style={styles.headerTitle}>My UPI</Text>
        <View style={styles.backHit} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isBlocking && (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Add UPI to take bookings</Text>
            <Text style={styles.bannerBody}>
              Players pay you by scanning this QR. Walk-in cash still works if you skip for now.
            </Text>
          </View>
        )}

        <Text style={styles.lead}>
          This is the QR players scan after they book. Use the same UPI you use in GPay, PhonePe, or Paytm.
        </Text>

        <Input
          label="UPI ID"
          value={upiId}
          onChangeText={(text) => {
            setUpiId(text);
            setError('');
          }}
          placeholder="yourname@oksbi"
          autoCapitalize="none"
          autoCorrect={false}
          error={error && !picked ? error : undefined}
        />

        <Text style={styles.qrLabel}>UPI QR photo</Text>
        <TouchableOpacity style={styles.qrBox} onPress={pickQr} activeOpacity={0.8}>
          {qrUri ? (
            <Image source={{ uri: qrUri }} style={styles.qrImage} resizeMode="contain" />
          ) : (
            <View style={styles.qrEmpty}>
              <Ionicons name="qr-code-outline" size={48} color={COLORS.gray[400]} />
              <Text style={styles.qrEmptyText}>Tap to upload QR</Text>
            </View>
          )}
        </TouchableOpacity>
        {error && (picked || user?.has_upi) ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={saving ? 'Saving…' : 'Save UPI'}
          onPress={handleSave}
          disabled={saving}
          loading={saving}
          style={styles.saveBtn}
        />

        {isBlocking && onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skip} disabled={saving}>
            <Text style={styles.skipText}>Skip for now — walk-ins only</Text>
          </TouchableOpacity>
        )}

        {saving && (
          <ActivityIndicator color={ACTION} style={{ marginTop: SIZES.md }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    backgroundColor: '#FFF',
  },
  backHit: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.h3,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  content: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  banner: {
    backgroundColor: '#FFEDD5',
    borderRadius: 12,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
  },
  bannerTitle: {
    ...FONTS.body,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 4,
  },
  bannerBody: {
    ...FONTS.caption,
    color: '#9A3412',
    lineHeight: 20,
  },
  lead: {
    ...FONTS.body,
    color: COLORS.gray[600],
    marginBottom: SIZES.lg,
    lineHeight: 22,
  },
  qrLabel: {
    ...FONTS.caption,
    color: COLORS.gray[900],
    marginBottom: SIZES.xs,
    fontWeight: '500',
  },
  qrBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  qrImage: {
    width: 240,
    height: 240,
  },
  qrEmpty: {
    alignItems: 'center',
    padding: SIZES.xl,
  },
  qrEmptyText: {
    ...FONTS.body,
    color: COLORS.gray[500],
    marginTop: SIZES.sm,
  },
  error: {
    ...FONTS.small,
    color: COLORS.error[600],
    marginBottom: SIZES.md,
  },
  saveBtn: {
    backgroundColor: ACTION,
  },
  skip: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  skipText: {
    ...FONTS.body,
    color: COLORS.gray[600],
    fontWeight: '600',
  },
});
