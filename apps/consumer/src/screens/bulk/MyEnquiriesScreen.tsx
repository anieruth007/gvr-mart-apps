import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BulkEnquiryDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Awaiting review',
  QUOTED: 'Quotation ready',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CONVERTED: 'Converted to order',
  CANCELLED: 'Cancelled',
};

export function MyEnquiriesScreen({ navigation }: any) {
  const [enquiries, setEnquiries] = useState<BulkEnquiryDto[]>([]);

  const load = useCallback(() => {
    api.get<BulkEnquiryDto[]>('/bulk/enquiries/mine').then(setEnquiries);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>My Bulk Enquiries</Text>

      {enquiries.length === 0 ? (
        <EmptyState icon="document-text-outline" message="No bulk enquiries yet." />
      ) : (
        enquiries.map((enq) => {
          const latestQuote = enq.quotations[0];
          return (
            <View key={enq.id} style={styles.card}>
              <View style={styles.rowTop}>
                <Text style={styles.contact}>{enq.contactName}</Text>
                <Text style={styles.statusText}>{STATUS_LABEL[enq.status]}</Text>
              </View>
              <Text style={styles.meta}>{enq.items.length} product(s) · {enq.deliveryLocation}</Text>
              {latestQuote && latestQuote.status === 'SENT' && (
                <Button
                  label={`Review Quotation · ₹${latestQuote.totalAmount}`}
                  onPress={() => navigation.navigate('QuotationDetail', { enquiryId: enq.id, quotationId: latestQuote.id })}
                  style={{ marginTop: 10 }}
                />
              )}
            </View>
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 12, ...shadow.card },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  contact: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink },
  statusText: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.blue },
  meta: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft },
});
