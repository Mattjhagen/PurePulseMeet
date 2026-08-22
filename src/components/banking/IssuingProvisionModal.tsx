import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { provisionIssuingCard } from '../../services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  onProvisioned: () => Promise<void> | void;
}

const initialForm = {
  phone: '', line1: '', line2: '', city: '', state: '', postalCode: '',
};

export const IssuingProvisionModal: React.FC<Props> = ({ visible, onClose, onProvisioned }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) setForm(initialForm);
  }, [visible]);

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    if (!form.phone.trim() || !form.line1.trim() || !form.city.trim() ||
        form.state.trim().length !== 2 || form.postalCode.trim().length < 5) {
      Alert.alert('Missing information', 'Enter a phone number and complete U.S. billing address. Use the two-letter state code.');
      return;
    }

    setSubmitting(true);
    try {
      await provisionIssuingCard({
        phone: form.phone.trim(),
        address: {
          line1: form.line1.trim(),
          ...(form.line2.trim() ? { line2: form.line2.trim() } : {}),
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
          postal_code: form.postalCode.trim(),
          country: 'US',
        },
      });
      await onProvisioned();
      onClose();
      Alert.alert('Sandbox card created', 'Your test card was created inactive and is ready for administrator review.');
    } catch (error) {
      Alert.alert('Unable to create card', error instanceof Error ? error.message : 'Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="card-outline" size={22} color={PurePulseTheme.colors.primaryLight} />
              <Text style={styles.title}>Create sandbox card</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={submitting} accessibilityLabel="Close card setup">
              <Ionicons name="close" size={24} color={PurePulseTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.notice}>
              <Ionicons name="flask-outline" size={18} color={PurePulseTheme.colors.warning} />
              <Text style={styles.noticeText}>Test mode only. This card cannot move or spend real money.</Text>
            </View>
            <Text style={styles.helper}>Stripe requires current contact and billing information for cardholder verification and 3D Secure.</Text>
            <TextInput style={styles.input} value={form.phone} onChangeText={value => update('phone', value)} placeholder="Phone number" placeholderTextColor={PurePulseTheme.colors.textMuted} keyboardType="phone-pad" textContentType="telephoneNumber" />
            <TextInput style={styles.input} value={form.line1} onChangeText={value => update('line1', value)} placeholder="Street address" placeholderTextColor={PurePulseTheme.colors.textMuted} textContentType="streetAddressLine1" />
            <TextInput style={styles.input} value={form.line2} onChangeText={value => update('line2', value)} placeholder="Apartment, suite, etc. (optional)" placeholderTextColor={PurePulseTheme.colors.textMuted} textContentType="streetAddressLine2" />
            <TextInput style={styles.input} value={form.city} onChangeText={value => update('city', value)} placeholder="City" placeholderTextColor={PurePulseTheme.colors.textMuted} textContentType="addressCity" />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.rowInput]} value={form.state} onChangeText={value => update('state', value.slice(0, 2))} placeholder="State" placeholderTextColor={PurePulseTheme.colors.textMuted} autoCapitalize="characters" maxLength={2} textContentType="addressState" />
              <TextInput style={[styles.input, styles.rowInput]} value={form.postalCode} onChangeText={value => update('postalCode', value)} placeholder="ZIP code" placeholderTextColor={PurePulseTheme.colors.textMuted} keyboardType="number-pad" textContentType="postalCode" />
            </View>
            <TouchableOpacity style={[styles.submit, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFF" /> : <><Ionicons name="shield-checkmark-outline" size={18} color="#FFF" /><Text style={styles.submitText}>Create inactive test card</Text></>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', backgroundColor: PurePulseTheme.colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...PurePulseTheme.typography.h3, fontSize: 18 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.35)', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  noticeText: { flex: 1, color: PurePulseTheme.colors.warning, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  helper: { color: PurePulseTheme.colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  input: { backgroundColor: PurePulseTheme.colors.cardBgSecondary, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: PurePulseTheme.colors.textPrimary, fontSize: 14, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  rowInput: { flex: 1 },
  submit: { marginTop: 8, marginBottom: 12, backgroundColor: PurePulseTheme.colors.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  disabled: { opacity: 0.55 },
  submitText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
