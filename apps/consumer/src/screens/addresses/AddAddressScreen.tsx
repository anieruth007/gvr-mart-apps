import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';

export function AddAddressScreen({ navigation }: any) {
  const [form, setForm] = useState({ label: 'Home', line1: '', line2: '', city: 'Chennai', state: 'Tamil Nadu', pincode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setError(null);
    if (!form.line1 || !form.pincode) {
      setError('Please fill in the address and pincode');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/me/addresses', form);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 20 }]}>Add Delivery Address</Text>

      <Field label="Label" value={form.label} onChangeText={update('label')} placeholder="Home, Office..." />
      <Field label="Address line 1" value={form.line1} onChangeText={update('line1')} placeholder="Flat / House no, Street" />
      <Field label="Address line 2 (optional)" value={form.line2} onChangeText={update('line2')} placeholder="Landmark, area" />
      <View style={styles.row}>
        <Field label="City" value={form.city} onChangeText={update('city')} style={{ flex: 1 }} />
        <Field label="State" value={form.state} onChangeText={update('state')} style={{ flex: 1 }} />
      </View>
      <Field label="Pincode" value={form.pincode} onChangeText={update('pincode')} keyboardType="number-pad" maxLength={6} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label="Save Address" onPress={save} loading={loading} style={{ marginTop: 12 }} />
    </ScreenContainer>
  );
}

function Field({ label, style, ...props }: any) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} placeholderTextColor={colors.muted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: colors.white, borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fontFamily.body, fontSize: 14, color: colors.ink, ...shadow.card },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginTop: 4 },
});
