import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { BulkEnquiryDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';

interface LineDraft {
  unitPrice: string;
  discount: string;
}

export function AdminQuotationFormScreen({ route, navigation }: any) {
  const { enquiryId } = route.params;
  const [enquiry, setEnquiry] = useState<BulkEnquiryDto | null>(null);
  const [lines, setLines] = useState<Record<string, LineDraft>>({});
  const [deliveryCharge, setDeliveryCharge] = useState('0');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<BulkEnquiryDto>(`/bulk/enquiries/${enquiryId}`).then((data) => {
      setEnquiry(data);
      const draft: Record<string, LineDraft> = {};
      data.items.forEach((item) => {
        draft[item.variantId] = { unitPrice: item.variant.sellingPrice, discount: '0' };
      });
      setLines(draft);
    });
  }, [enquiryId]);

  if (!enquiry) return <ScreenContainer><Text>Loading...</Text></ScreenContainer>;

  const latestQuote = enquiry.quotations[0];
  const alreadySent = latestQuote && ['SENT', 'ACCEPTED'].includes(latestQuote.status);

  const updateLine = (variantId: string, key: keyof LineDraft, value: string) =>
    setLines((prev) => ({ ...prev, [variantId]: { ...prev[variantId], [key]: value } }));

  const total = enquiry.items.reduce((sum, item) => {
    const line = lines[item.variantId];
    if (!line) return sum;
    const unitPrice = Number(line.unitPrice) || 0;
    const discount = Number(line.discount) || 0;
    return sum + item.requestedQty * unitPrice - discount;
  }, 0) + (Number(deliveryCharge) || 0);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const items = enquiry.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.requestedQty,
        unitPrice: Number(lines[item.variantId]?.unitPrice) || 0,
        discount: Number(lines[item.variantId]?.discount) || 0,
      }));
      const quotation = await api.post<{ id: string }>(`/bulk/enquiries/${enquiryId}/quotations`, {
        deliveryCharge: Number(deliveryCharge) || 0,
        notes: notes || undefined,
        items,
      });
      await api.patch(`/bulk/quotations/${quotation.id}/send`);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not send quotation');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 4 }]}>Build Quotation</Text>
      <Text style={styles.subtitle}>For {enquiry.contactName} · {enquiry.contactPhone}</Text>
      {enquiry.notes && <Text style={styles.notes}>"{enquiry.notes}"</Text>}

      {enquiry.items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <Text style={styles.itemName}>{item.variant.product.name} · {item.variant.label}</Text>
          <Text style={styles.itemQty}>Requested: {item.requestedQty} {item.variant.unit}</Text>
          <View style={styles.row}>
            <Field label="Unit price (₹)" value={lines[item.variantId]?.unitPrice} onChangeText={(v: string) => updateLine(item.variantId, 'unitPrice', v)} />
            <Field label="Discount (₹)" value={lines[item.variantId]?.discount} onChangeText={(v: string) => updateLine(item.variantId, 'discount', v)} />
          </View>
        </View>
      ))}

      <Field label="Delivery charge (₹)" value={deliveryCharge} onChangeText={setDeliveryCharge} style={{ marginTop: 6 }} />
      <Field label="Notes for customer (optional)" value={notes} onChangeText={setNotes} />

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Quotation total</Text>
        <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {alreadySent ? (
        <Text style={styles.alreadySent}>A quotation has already been sent for this enquiry ({latestQuote.status}).</Text>
      ) : (
        <Button label="Send Quotation to Customer" onPress={submit} loading={busy} style={{ marginTop: 8 }} />
      )}
    </ScreenContainer>
  );
}

function Field({ label, style, ...props }: any) {
  return (
    <View style={[{ flex: 1, marginBottom: 12 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...props} keyboardType="numeric" placeholderTextColor={colors.muted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft, marginBottom: 4 },
  notes: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, fontStyle: 'italic', marginBottom: 16 },
  itemCard: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 12, ...shadow.card },
  itemName: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink, marginBottom: 2 },
  itemQty: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  fieldLabel: { fontFamily: fontFamily.bodyBold, fontSize: 10.5, color: colors.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: colors.cream, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink, borderWidth: 1, borderColor: colors.border },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.greenDeep, borderRadius: radii.md, padding: 16, marginTop: 8, marginBottom: 16 },
  totalLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.white },
  totalValue: { fontFamily: fontFamily.headingBold, fontSize: 18, color: colors.mango },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginBottom: 12 },
  alreadySent: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft, fontStyle: 'italic' },
});
