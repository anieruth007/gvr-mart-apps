import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BulkEnquiryDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';

export function QuotationDetailScreen({ route, navigation }: any) {
  const { enquiryId, quotationId } = route.params;
  const [enquiry, setEnquiry] = useState<BulkEnquiryDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<BulkEnquiryDto>(`/bulk/enquiries/${enquiryId}`).then(setEnquiry);
  }, [enquiryId]);

  if (!enquiry) return <ScreenContainer><Text>Loading...</Text></ScreenContainer>;
  const quotation = enquiry.quotations.find((q) => q.id === quotationId);
  if (!quotation) return <ScreenContainer><Text>Quotation not found.</Text></ScreenContainer>;

  const respond = async (action: 'ACCEPT' | 'REJECT') => {
    setError(null);
    setBusy(true);
    try {
      const result = await api.patch<{ status: string; order?: { id: string } }>(
        `/bulk/quotations/${quotationId}/respond`,
        { action },
      );
      if (result.order) {
        navigation.replace('OrderTracking', { orderId: result.order.id });
      } else {
        navigation.goBack();
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not submit your response');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 4 }]}>Quotation</Text>
      <Text style={styles.subtitle}>For {enquiry.contactName} · {enquiry.deliveryLocation}</Text>

      {quotation.items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemQty}>Qty {item.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>₹{item.unitPrice} each</Text>
          <Text style={styles.itemTotal}>₹{item.lineTotal}</Text>
        </View>
      ))}

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery charge</Text>
          <Text style={styles.summaryValue}>₹{quotation.deliveryCharge}</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: 8 }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{quotation.totalAmount}</Text>
        </View>
      </View>

      {quotation.notes && <Text style={styles.notes}>Note from GVR Mart: {quotation.notes}</Text>}

      {error && <Text style={styles.error}>{error}</Text>}

      {quotation.status === 'SENT' && (
        <View style={styles.actions}>
          <Button label="Reject" variant="ghost" onPress={() => respond('REJECT')} loading={busy} style={{ flex: 1 }} />
          <Button label="Accept & Order" onPress={() => respond('ACCEPT')} loading={busy} style={{ flex: 1 }} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft, marginBottom: 18 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemQty: { fontFamily: fontFamily.bodyMedium, fontSize: 13, color: colors.ink },
  itemPrice: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, marginRight: 12 },
  itemTotal: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink },
  summary: { marginTop: 16, padding: 16, backgroundColor: colors.white, borderRadius: radii.md, ...shadow.card },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft },
  summaryValue: { fontFamily: fontFamily.bodyMedium, fontSize: 12.5, color: colors.ink },
  totalLabel: { fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.ink },
  totalValue: { fontFamily: fontFamily.bodyExtraBold, fontSize: 15, color: colors.blueDeep },
  notes: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, marginTop: 14, fontStyle: 'italic' },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
});
