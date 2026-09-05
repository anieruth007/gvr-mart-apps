import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { OrderDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';

export function OrderHistoryScreen({ navigation }: any) {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const { refresh } = useCart();

  const load = useCallback(() => {
    api.get<OrderDto[]>('/orders/mine').then(setOrders);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const reorder = async (orderId: string) => {
    await api.post(`/orders/${orderId}/reorder`);
    await refresh();
    navigation.navigate('MainTabs', { screen: 'Cart' });
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>My Orders</Text>

      {orders.length === 0 ? (
        <EmptyState icon="cube-outline" message="You haven't placed any orders yet." />
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <TouchableOpacity onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}>
              <View style={styles.rowTop}>
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                <StatusBadge status={order.status} />
              </View>
              <Text style={styles.meta}>{order.items.length} item(s) · ₹{order.total}{order.isBulk ? ' · Bulk' : ''}</Text>
            </TouchableOpacity>
            {order.status === 'DELIVERED' && (
              <TouchableOpacity onPress={() => reorder(order.id)} style={styles.reorderBtn}>
                <Text style={styles.reorderText}>Buy Again</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 12, ...shadow.card },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderNumber: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink },
  meta: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft },
  reorderBtn: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: colors.blueSoft, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  reorderText: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.blueDeep },
});
