import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: string;
  minOrderValue: string;
  isActive: boolean;
  timesUsed: number;
  usageLimit?: number | null;
}

export function AdminCouponsScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FLAT'>('FLAT');
  const [value, setValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get<Coupon[]>('/coupons').then(setCoupons);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const submit = async () => {
    setError(null);
    if (!code || !value) {
      setError('Enter a code and value');
      return;
    }
    setBusy(true);
    try {
      await api.post('/coupons', { code, type, value: Number(value), minOrderValue: Number(minOrderValue) || 0 });
      setCode(''); setValue(''); setMinOrderValue('0'); setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not create coupon');
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (id: string) => {
    await api.delete(`/coupons/${id}`);
    load();
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={typography.h1}>Coupons</Text>
        <TouchableOpacity onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.toggle}>{showForm ? 'Cancel' : '+ Add Coupon'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <Field label="Code" value={code} onChangeText={(v: string) => setCode(v.toUpperCase())} autoCapitalize="characters" placeholder="WELCOME100" />
          <View style={styles.typeRow}>
            {(['FLAT', 'PERCENT'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.typeChip, type === t && styles.typeChipActive]}>
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.row}>
            <Field label={type === 'FLAT' ? 'Amount off (₹)' : 'Percent off (%)'} value={value} onChangeText={setValue} keyboardType="numeric" style={{ flex: 1 }} />
            <Field label="Min order value (₹)" value={minOrderValue} onChangeText={setMinOrderValue} keyboardType="numeric" style={{ flex: 1 }} />
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          <Button label="Create Coupon" onPress={submit} loading={busy} />
        </View>
      )}

      {coupons.length === 0 ? (
        <EmptyState icon="🏷️" message="No coupons yet." />
      ) : (
        coupons.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.code}>{c.code}</Text>
              <Text style={styles.meta}>
                {c.type === 'FLAT' ? `₹${c.value} off` : `${c.value}% off`} · min ₹{c.minOrderValue} · used {c.timesUsed}{c.usageLimit ? `/${c.usageLimit}` : ''}
              </Text>
            </View>
            {c.isActive ? (
              <TouchableOpacity onPress={() => deactivate(c.id)}>
                <Text style={styles.deactivate}>Deactivate</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.inactive}>Inactive</Text>
            )}
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

function Field({ label, style, ...props }: any) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...props} placeholderTextColor={colors.muted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  toggle: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.greenDeep },
  form: { backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginBottom: 20, ...shadow.card },
  fieldLabel: { fontFamily: fontFamily.bodyBold, fontSize: 10.5, color: colors.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: colors.cream, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fontFamily.body, fontSize: 13, color: colors.ink, borderWidth: 1, borderColor: colors.border },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7 },
  typeChipActive: { backgroundColor: colors.greenSoft, borderColor: colors.green },
  typeChipText: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.inkSoft },
  typeChipTextActive: { color: colors.greenDeep },
  row: { flexDirection: 'row', gap: 10 },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 10, ...shadow.card },
  code: { fontFamily: fontFamily.bodyExtraBold, fontSize: 14, color: colors.greenDeep, marginBottom: 3 },
  meta: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.inkSoft },
  deactivate: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.tomato },
  inactive: { fontFamily: fontFamily.bodyMedium, fontSize: 11.5, color: colors.faint },
});
