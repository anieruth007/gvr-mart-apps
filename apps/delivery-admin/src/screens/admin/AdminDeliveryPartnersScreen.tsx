import React, { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';

interface Partner {
  id: string;
  phone: string;
  isActive: boolean;
  deliveryPartnerProfile?: { name?: string | null; vehicleInfo?: string | null; isOnline: boolean };
  _count: { deliveriesDone: number };
}

export function AdminDeliveryPartnersScreen() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get<Partner[]>('/admin/delivery-partners').then(setPartners);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/admin/delivery-partners/${id}/status`, { isActive });
    load();
  };

  const submit = async () => {
    setError(null);
    if (!phone || !name) {
      setError('Enter both phone number and name');
      return;
    }
    setBusy(true);
    try {
      await api.post('/admin/delivery-partners', {
        phone: phone.startsWith('+91') ? phone : `+91${phone}`,
        name,
        vehicleInfo: vehicle || undefined,
      });
      setPhone(''); setName(''); setVehicle(''); setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not create delivery partner');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={typography.h1}>Delivery Partners</Text>
        <TouchableOpacity onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.toggle}>{showForm ? 'Cancel' : '+ Add Partner'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="98765 43210" />
          <Field label="Name" value={name} onChangeText={setName} />
          <Field label="Vehicle info (optional)" value={vehicle} onChangeText={setVehicle} placeholder="Bike TN-01" />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button label="Create Delivery Partner" onPress={submit} loading={busy} />
        </View>
      )}

      {partners.length === 0 ? (
        <EmptyState icon="🛵" message="No delivery partners yet." />
      ) : (
        partners.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.deliveryPartnerProfile?.name ?? p.phone}</Text>
              <Text style={styles.meta}>
                {p.phone} · {p._count.deliveriesDone} deliveries · {p.deliveryPartnerProfile?.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            <Switch value={p.isActive} onValueChange={(v) => toggleActive(p.id, v)} trackColor={{ true: colors.green, false: colors.border }} />
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

function Field({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
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
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 10, ...shadow.card },
  name: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink, marginBottom: 3 },
  meta: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.inkSoft },
});
