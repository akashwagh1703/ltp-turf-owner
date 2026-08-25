import React, { useCallback, useEffect, useState } from 'react';
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
import { turfService } from '../../services/turfService';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { IMAGE_PICKER_OPTIONS, prepareJpeg } from '../../utils/formData';

const ACTION = '#E06C1F';
const CREAM = '#F7F4EF';
const STEPS = ['Basics', 'Place', 'Photos', 'Play'];
const SPORTS = [
  { id: 'football', label: 'Football' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'volleyball', label: 'Volleyball' },
];
const DURATIONS = [30, 60, 90, 120];

const emptyForm = {
  name: '',
  description: '',
  sport_type: 'football',
  city: '',
  address_line1: '',
  address_line2: '',
  state: '',
  pincode: '',
  opening_time: '06:00',
  closing_time: '22:00',
  slot_duration: 60,
  uniform_price: '',
  weekend_price: '',
};

function hhmm(value) {
  if (!value) return '';
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value).slice(0, 5);
  return String(match[1]).padStart(2, '0') + ':' + match[2];
}

export default function TurfWizardScreen({ navigation, route }) {
  const [turfId, setTurfId] = useState(route.params?.id || null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('draft');
  const [rejection, setRejection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const applyTurf = (turf) => {
    setTurfId(turf.id);
    setStatus(turf.status);
    setRejection(turf.rejection_reason || null);
    setImages(turf.images || []);
    setForm({
      name: turf.name === 'Untitled turf' ? '' : turf.name || '',
      description: turf.description || '',
      sport_type: turf.sport_type || 'football',
      city: turf.city || '',
      address_line1: turf.address_line1 || '',
      address_line2: turf.address_line2 || '',
      state: turf.state || '',
      pincode: turf.pincode === '000000' ? '' : turf.pincode || '',
      opening_time: hhmm(turf.opening_time) || '06:00',
      closing_time: hhmm(turf.closing_time) || '22:00',
      slot_duration: turf.slot_duration || 60,
      uniform_price: turf.uniform_price != null ? String(Math.round(Number(turf.uniform_price))) : '',
      weekend_price: turf.weekend_price != null ? String(Math.round(Number(turf.weekend_price))) : '',
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (route.params?.id) {
        const res = await turfService.getTurf(route.params.id);
        applyTurf(res.data?.data || res.data);
      } else {
        const res = await turfService.createDraft();
        applyTurf(res.data?.data || res.data);
      }
    } catch (error) {
      Alert.alert('Could not open wizard', error.response?.data?.message || 'Try again');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [navigation, route.params?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const payload = () => ({
    name: form.name.trim() || 'Untitled turf',
    description: form.description.trim(),
    sport_type: form.sport_type,
    city: form.city.trim(),
    address_line1: form.address_line1.trim(),
    address_line2: form.address_line2.trim() || null,
    state: form.state.trim(),
    pincode: form.pincode.trim().length === 6 ? form.pincode.trim() : '000000',
    opening_time: hhmm(form.opening_time),
    closing_time: hhmm(form.closing_time),
    slot_duration: form.slot_duration,
    uniform_price: form.uniform_price ? Number(form.uniform_price) : null,
    weekend_price: form.weekend_price ? Number(form.weekend_price) : null,
  });

  const save = async () => {
    if (!turfId) return false;
    setSaving(true);
    try {
      const res = await turfService.updateTurf(turfId, payload());
      applyTurf(res.data?.data || res.data);
      return true;
    } catch (error) {
      Alert.alert('Could not save', error.response?.data?.message || 'Try again');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    const ok = await save();
    if (ok) setStep((s) => Math.min(3, s + 1));
  };

  const handleSubmit = async () => {
    const ok = await save();
    if (!ok) return;
    setSaving(true);
    try {
      const res = await turfService.submitTurf(turfId);
      Alert.alert('Submitted', res.data?.message || 'LTP will review it.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const code = error.response?.data?.error?.code;
      if (code === 'UPI_REQUIRED') {
        Alert.alert(
          'Add UPI first',
          error.response?.data?.message || 'Add your UPI ID and QR before submitting this turf to LTP.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add UPI',
              onPress: () => navigation.navigate('Profile', { screen: 'UpiSetup' }),
            },
          ]
        );
        return;
      }
      Alert.alert('Cannot submit', error.response?.data?.message || 'Finish the missing fields.');
    } finally {
      setSaving(false);
    }
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add turf photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      ...IMAGE_PICKER_OPTIONS,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0] || !turfId) return;
    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('photo', await prepareJpeg(asset));
    setSaving(true);
    try {
      await turfService.uploadPhoto(turfId, formData);
      const res = await turfService.getTurf(turfId);
      applyTurf(res.data?.data || res.data);
    } catch (error) {
      Alert.alert('Upload failed', error.response?.data?.message || 'Try a smaller JPG or PNG.');
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = (imageId) => {
    Alert.alert('Remove photo?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await turfService.deletePhoto(turfId, imageId);
            setImages((prev) => prev.filter((img) => img.id !== imageId));
          } catch (error) {
            Alert.alert('Could not remove', error.response?.data?.message || 'Try again');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACTION} />
        </View>
      </SafeAreaView>
    );
  }

  const waiting = status === 'pending';
  const live = status === 'approved';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backHit}>
          <Ionicons name="chevron-back" size={24} color={COLORS.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{live ? 'Edit turf' : 'Add turf'}</Text>
        <View style={styles.backHit} />
      </View>

      <View style={styles.stepBar}>
        {STEPS.map((label, i) => (
          <TouchableOpacity key={label} style={styles.stepItem} onPress={() => setStep(i)}>
            <View style={[styles.stepDot, i <= step && styles.stepDotOn]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumOn]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {rejection && status === 'draft' ? (
        <View style={styles.rejectBanner}>
          <Text style={styles.rejectTitle}>LTP asked you to fix this</Text>
          <Text style={styles.rejectBody}>{rejection}</Text>
        </View>
      ) : null}
      {waiting ? (
        <View style={styles.waitBanner}>
          <Text style={styles.waitText}>Waiting for LTP to review. Bookings open only after approval.</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Input label="Turf name" value={form.name} onChangeText={(v) => setField('name', v)} placeholder="Greenfield Turf" />
            <Text style={styles.label}>Sport</Text>
            <View style={styles.chipRow}>
              {SPORTS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, form.sport_type === s.id && styles.chipOn]}
                  onPress={() => setField('sport_type', s.id)}
                >
                  <Text style={[styles.chipText, form.sport_type === s.id && styles.chipTextOn]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input
              label="Description (optional)"
              value={form.description}
              onChangeText={(v) => setField('description', v)}
              placeholder="Floodlights, parking, changing rooms…"
              multiline
            />
          </>
        )}

        {step === 1 && (
          <>
            <Input label="City" value={form.city} onChangeText={(v) => setField('city', v)} placeholder="Pune" />
            <Input label="Address" value={form.address_line1} onChangeText={(v) => setField('address_line1', v)} placeholder="Lane, landmark" />
            <Input label="Area (optional)" value={form.address_line2} onChangeText={(v) => setField('address_line2', v)} />
            <Input label="State" value={form.state} onChangeText={(v) => setField('state', v)} placeholder="Maharashtra" />
            <Input
              label="PIN code"
              value={form.pincode}
              onChangeText={(v) => setField('pincode', v.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.hint}>Cover photo plus up to 8 more. First photo is the cover.</Text>
            <View style={styles.photoGrid}>
              {images.map((img) => (
                <View key={img.id} style={styles.photoWrap}>
                  <Image source={{ uri: img.image_url }} style={styles.photo} />
                  {img.is_primary ? <Text style={styles.coverBadge}>Cover</Text> : null}
                  <TouchableOpacity style={styles.photoX} onPress={() => removePhoto(img.id)}>
                    <Ionicons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 9 && (
                <TouchableOpacity style={styles.addPhoto} onPress={pickPhoto}>
                  <Ionicons name="camera-outline" size={28} color={ACTION} />
                  <Text style={styles.addPhotoText}>Add photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Input
              label="Opens (HH:MM)"
              value={form.opening_time}
              onChangeText={(v) => setField('opening_time', v)}
              placeholder="06:00"
            />
            <Input
              label="Closes (HH:MM)"
              value={form.closing_time}
              onChangeText={(v) => setField('closing_time', v)}
              placeholder="22:00"
            />
            <Text style={styles.label}>Slot length</Text>
            <View style={styles.chipRow}>
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, form.slot_duration === d && styles.chipOn]}
                  onPress={() => setField('slot_duration', d)}
                >
                  <Text style={[styles.chipText, form.slot_duration === d && styles.chipTextOn]}>{d} min</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input
              label="Weekday price (₹)"
              value={form.uniform_price}
              onChangeText={(v) => setField('uniform_price', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="800"
            />
            <Input
              label="Weekend price (₹)"
              value={form.weekend_price}
              onChangeText={(v) => setField('weekend_price', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Same as weekday if empty"
            />
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <Button title="Back" variant="secondary" onPress={() => setStep((s) => s - 1)} style={styles.footerBtn} />
        )}
        {step < 3 ? (
          <Button title={saving ? 'Saving…' : 'Next'} onPress={goNext} loading={saving} style={[styles.footerBtn, styles.actionBtn]} />
        ) : waiting || live ? (
          <Button title={saving ? 'Saving…' : 'Save'} onPress={save} loading={saving} style={[styles.footerBtn, styles.actionBtn]} />
        ) : (
          <Button
            title={saving ? 'Please wait…' : 'Submit for LTP'}
            onPress={handleSubmit}
            loading={saving}
            style={[styles.footerBtn, styles.actionBtn]}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    backgroundColor: '#FFF',
  },
  backHit: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray[900] },
  stepBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingBottom: SIZES.md,
    paddingHorizontal: SIZES.sm,
  },
  stepItem: { flex: 1, alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotOn: { backgroundColor: '#1F7A4C' },
  stepNum: { fontWeight: '700', color: COLORS.gray[600], fontSize: 12 },
  stepNumOn: { color: '#FFF' },
  stepLabel: { marginTop: 4, fontSize: 11, color: COLORS.gray[500] },
  stepLabelOn: { color: '#1F7A4C', fontWeight: '700' },
  rejectBanner: { backgroundColor: '#FEE4E2', padding: SIZES.md, margin: SIZES.md, borderRadius: 12 },
  rejectTitle: { fontWeight: '700', color: '#B42318' },
  rejectBody: { marginTop: 4, color: '#B42318' },
  waitBanner: { backgroundColor: '#FDF0E7', padding: SIZES.md, marginHorizontal: SIZES.md, borderRadius: 12 },
  waitText: { color: '#9A3412', fontWeight: '600', textAlign: 'center' },
  content: { padding: SIZES.lg, paddingBottom: 40 },
  label: { ...FONTS.caption, fontWeight: '600', color: COLORS.gray[900], marginBottom: SIZES.sm },
  hint: { ...FONTS.caption, color: COLORS.gray[500], marginBottom: SIZES.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.lg },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  chipOn: { backgroundColor: '#1F7A4C', borderColor: '#1F7A4C' },
  chipText: { fontWeight: '600', color: COLORS.gray[800] },
  chipTextOn: { color: '#FFF' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  photoWrap: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  coverBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: '#1F7A4C',
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
    borderRadius: 6,
  },
  photoX: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderStyle: 'dashed',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: { marginTop: 6, fontSize: 12, fontWeight: '600', color: ACTION },
  footer: {
    flexDirection: 'row',
    gap: SIZES.sm,
    padding: SIZES.lg,
    backgroundColor: '#FFF',
    ...SHADOWS.small,
  },
  footerBtn: { flex: 1 },
  actionBtn: { backgroundColor: ACTION },
});
