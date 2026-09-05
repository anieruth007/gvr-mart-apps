import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { OrderDto, OrderStatus } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';

const FILTERS: (OrderStatus | 'ALL')[] = ['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'PACKED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export function AdminOrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const load = useCallback((status: OrderStatus | 'ALL') => {
    const query = status === 'ALL' ? '' : `?status=${status}`;
    api.get<OrderDto[]>(`/orders${query}`).then(setOrders);
  }, []);

  useFocusEffect(useCallback(() => { load(filter); }, [load, filter]));

  return (
    <ScreenContainer padded={false}>
      <View style={styles.header}>
        <Text style={typography.h1}>Orders</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.body}>
        {orders.length === 0 ? (
          <EmptyState icon="📦" message="No orders match this filter." />
        ) : (
          orders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.card} onPress={() => navigation.navigate('AdminOrderDetail', { orderId: order.id })}>
              <View style={styles.rowTop}>
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                <StatusBadge status={order.status} />
              </View>
              <Text style={styles.meta}>{order.items.length} item(s) · ₹{order.total}{order.isBulk ? ' · Bulk' : ''}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 18, paddingBottom: 4 },
  filterRow: { flexGrow: 0, marginBottom: 14 },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8 },
  filterChipActive: { backgroundColor: colors.blueDeep, borderColor: colors.blueDeep },
  filterText: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.inkSoft },
  filterTextActive: { color: colors.white },
  body: { paddingHorizontal: 18 },
  card: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 12, ...shadow.card },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderNumber: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink },
  meta: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft },
});
