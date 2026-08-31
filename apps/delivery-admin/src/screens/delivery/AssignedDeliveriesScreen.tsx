import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';

interface AssignedDelivery {
  id: string;
  acceptedAt: string | null;
  outForDeliveryAt: string | null;
  order: {
    orderNumber: string;
    total: string;
    paymentStatus: string;
    items: { productNameSnapshot: string; quantity: number }[];
    address: { line1: string; city: string; pincode: string };
    user: { phone: string; customerProfile?: { name?: string | null } };
  };
}

export function AssignedDeliveriesScreen({ navigation }: any) {
  const [deliveries, setDeliveries] = useState<AssignedDelivery[]>([]);

  const load = useCallback(() => {
    api.get<AssignedDelivery[]>('/delivery/assigned').then(setDeliveries);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>Assigned Deliveries</Text>

      {deliveries.length === 0 ? (
        <EmptyState icon="🛵" message="No deliveries assigned right now." />
      ) : (
        deliveries.map((d) => (
          <TouchableOpacity key={d.id} style={styles.card} onPress={() => navigation.navigate('DeliveryDetail', { delivery: d })}>
            <View style={styles.rowTop}>
              <Text style={styles.orderNumber}>#{d.order.orderNumber}</Text>
              <Text style={styles.stage}>
                {d.outForDeliveryAt ? 'Out for delivery' : d.acceptedAt ? 'Accepted' : 'New'}
              </Text>
            </View>
            <Text style={styles.customer}>{d.order.user.customerProfile?.name ?? d.order.user.phone}</Text>
            <Text style={styles.address}>{d.order.address.line1}, {d.order.address.city} - {d.order.address.pincode}</Text>
            <View style={styles.rowBottom}>
              <Text style={styles.itemCount}>{d.order.items.length} item(s)</Text>
              <Text style={styles.amount}>₹{d.order.total} · {d.order.paymentStatus === 'PAID' ? 'Paid' : 'Cash on delivery'}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 12, ...shadow.card },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderNumber: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink },
  stage: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.green },
  customer: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink, marginBottom: 2 },
  address: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, marginBottom: 8 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  itemCount: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.inkSoft },
  amount: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.greenDeep },
});
