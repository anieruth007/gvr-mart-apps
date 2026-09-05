import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BulkEnquiryDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Needs quotation',
  QUOTED: 'Quotation sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CONVERTED: 'Converted to order',
  CANCELLED: 'Cancelled',
};

export function AdminBulkEnquiriesScreen({ navigation }: any) {
  const [enquiries, setEnquiries] = useState<BulkEnquiryDto[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.get<BulkEnquiryDto[]>('/bulk/enquiries').then(setEnquiries);
    }, []),
  );

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>Bulk Enquiries</Text>

      {enquiries.length === 0 ? (
        <EmptyState icon="📋" message="No bulk enquiries yet." />
      ) : (
        enquiries.map((enq) => (
          <TouchableOpacity key={enq.id} style={styles.card} onPress={() => navigation.navigate('AdminQuotationForm', { enquiryId: enq.id })}>
            <View style={styles.rowTop}>
              <Text style={styles.contact}>{enq.contactName}</Text>
              <Text style={styles.status}>{STATUS_LABEL[enq.status]}</Text>
            </View>
            <Text style={styles.meta}>{enq.items.length} product(s) · {enq.deliveryLocation}</Text>
            <Text style={styles.meta}>Needed by {new Date(enq.preferredDate).toLocaleDateString()}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 12, ...shadow.card },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  contact: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink },
  status: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: colors.blue },
  meta: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft },
});
