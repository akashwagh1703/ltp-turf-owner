import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { turfService } from '../../services/turfService';
import { COLORS, SIZES, FONTS, GRADIENTS } from '../../constants/theme';

export default function TurfUpdateRequestScreen({ route, navigation }) {
  const { turf } = route.params;
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState({});
  const [selectedFields, setSelectedFields] = useState({});

  const updateableFields = [
    { key: 'name', label: 'Turf Name', type: 'text', value: turf.name },
    { key: 'description', label: 'Description', type: 'text', value: turf.description },
    { key: 'address_line1', label: 'Address Line 1', type: 'text', value: turf.address_line1 },
    { key: 'address_line2', label: 'Address Line 2', type: 'text', value: turf.address_line2 },
    { key: 'opening_time', label: 'Opening Time', type: 'text', value: turf.opening_time },
    { key: 'closing_time', label: 'Closing Time', type: 'text', value: turf.closing_time },
    { key: 'uniform_price', label: 'Price per Hour', type: 'number', value: turf.uniform_price?.toString() },
  ];

  const toggleField = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
    
    if (!selectedFields[fieldKey]) {
      const field = updateableFields.find(f => f.key === fieldKey);
      setUpdates(prev => ({
        ...prev,
        [fieldKey]: field.value || ''
      }));
    } else {
      setUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[fieldKey];
        return newUpdates;
      });
    }
  };

  const updateField = (fieldKey, value) => {
    setUpdates(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(updates).length === 0) {
      Alert.alert('Error', 'Please select at least one field to update');
      return;
    }

    // Format changes with old and new values for admin review
    const formattedChanges = {};
    Object.keys(updates).forEach(fieldKey => {
      const field = updateableFields.find(f => f.key === fieldKey);
      formattedChanges[fieldKey] = {
        old: field.value || '',
        new: updates[fieldKey]
      };
    });

    setLoading(true);
    try {
      await turfService.requestUpdate(turf.id, formattedChanges);
      Alert.alert(
        'Success',
        'Update request submitted successfully. Admin will review and approve your changes.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Submit update request error:', error);
      Alert.alert('Error', 'Failed to submit update request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Update</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.subtitle}>Select fields you want to update for {turf.name}</Text>
        </Card>

        {updateableFields.map((field) => (
          <Card key={field.key} style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <Switch
                value={selectedFields[field.key] || false}
                onValueChange={() => toggleField(field.key)}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
                thumbColor={selectedFields[field.key] ? COLORS.primary[600] : COLORS.gray[400]}
              />
            </View>
            
            {selectedFields[field.key] && (
              <View style={styles.inputContainer}>
                <Text style={styles.currentLabel}>Current: {field.value || 'Not set'}</Text>
                <TextInput
                  style={styles.input}
                  value={updates[field.key] || ''}
                  onChangeText={(value) => updateField(field.key, value)}
                  placeholder={`Enter new ${field.label.toLowerCase()}`}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  multiline={field.key === 'description'}
                  numberOfLines={field.key === 'description' ? 3 : 1}
                />
              </View>
            )}
          </Card>
        ))}

        <Button
          title="Submit Request"
          onPress={handleSubmit}
          loading={loading}
          disabled={Object.keys(updates).length === 0}
          style={styles.submitButton}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h3,
    color: '#FFF',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  card: {
    margin: SIZES.lg,
    marginBottom: SIZES.md,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fieldCard: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  fieldLabel: {
    ...FONTS.h4,
    color: COLORS.text,
    flex: 1,
  },
  inputContainer: {
    marginTop: SIZES.sm,
  },
  currentLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    ...FONTS.body,
    color: COLORS.text,
    backgroundColor: '#FFF',
  },
  submitButton: {
    margin: SIZES.lg,
  },
});