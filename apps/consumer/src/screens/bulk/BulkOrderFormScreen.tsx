import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { ProductDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Stepper } from '../../components/Stepper';

export function BulkOrderFormScreen({ navigation }: any) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<ProductDto[]>('/products').then(setProducts);
  }, []);

  const setQty = (variantId: string, qty: number) =>
    setQuantities((q) => {
      const next = { ...q };
      if (qty <= 0) delete next[variantId];
      else next[variantId] = qty;
      return next;
    });

  const submit = async () => {
    const items = Object.entries(quantities).map(([variantId, requestedQty]) => ({ variantId, requestedQty }));
    if (items.length === 0) {
      setError('Add at least one product with a quantity');
      return;
    }
    if (!contactName || !contactPhone || !preferredDate || !deliveryLocation) {
      setError('Please fill in all the contact and delivery details');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.post('/bulk/enquiries', {
        contactName,
        contactPhone: contactPhone.startsWith('+91') ? contactPhone : `+91${contactPhone}`,
        preferredDate: new Date(preferredDate).toISOString(),
        deliveryLocation,
        notes: notes || undefined,
        items,
      });
      navigation.replace('MyEnquiries');
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not submit your bulk enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 4 }]}>Bulk Order Enquiry</Text>
      <Text style={styles.subtitle}>For functions, hotels, restaurants & shops — we'll send you a custom quotation.</Text>

      <Text style={styles.sectionLabel}>Select products & quantities</Text>
      {products.map((p) => {
        const variant = p.variants[0];
        if (!variant) return null;
        return (
          <View key={p.id} style={styles.productRow}>
            <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.productUnit}>{variant.unit}</Text>
            <Stepper
              quantity={quantities[variant.id] ?? 0}
              onIncrement={() => setQty(variant.id, (quantities[variant.id] ?? 0) + 5)}
              onDecrement={() => setQty(variant.id, Math.max(0, (quantities[variant.id] ?? 0) - 5))}
            />
          </View>
        );
      })}

      <Text style={styles.sectionLabel}>Contact & delivery details</Text>
      <Field label="Contact name" value={contactName} onChangeText={setContactName} />
      <Field label="Contact phone" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
      <Field label="Preferred date (YYYY-MM-DD)" value={preferredDate} onChangeText={setPreferredDate} placeholder="2026-09-10" />
      <Field label="Delivery location" value={deliveryLocation} onChangeText={setDeliveryLocation} placeholder="Venue / address" />
      <Field label="Additional notes (optional)" value={notes} onChangeText={setNotes} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label="Submit Enquiry" onPress={submit} loading={loading} style={{ marginTop: 12 }} />
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
  subtitle: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft, marginBottom: 18, lineHeight: 18 },
  sectionLabel: { fontSize: 12, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
  productName: { flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: 13, color: colors.ink },
  productUnit: { fontFamily: fontFamily.body, fontSize: 11, color: colors.inkSoft, marginRight: 4 },
  fieldLabel: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: colors.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: colors.white, borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fontFamily.body, fontSize: 13.5, color: colors.ink, ...shadow.card },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginTop: 8 },
});
