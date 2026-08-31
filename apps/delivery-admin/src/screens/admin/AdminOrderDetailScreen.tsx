import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { OrderDto, OrderStatus } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  PLACED: { status: 'CONFIRMED', label: 'Confirm Order' },
  CONFIRMED: { status: 'PREPARING', label: 'Start Preparing' },
  PREPARING: { status: 'PACKED', label: 'Mark Packed' },
};

interface Partner {
  id: string;
  isActive: boolean;
  deliveryPartnerProfile?: { name?: string | null; isOnline: boolean };
  phone: string;
}

export function AdminOrderDetailScreen({ route }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get<OrderDto>(`/orders/${orderId}`).then(setOrder);
  }, [orderId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useFocusEffect(
    useCallback(() => {
      api.get<Partner[]>('/admin/delivery-partners').then((all) => setPartners(all.filter((p) => p.isActive)));
    }, []),
  );

  if (!order) return <ScreenContainer><Text>Loading...</Text></ScreenContainer>;

  const advance = async (status: OrderStatus) => {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not update order');
    } finally {
      setBusy(false);
    }
  };

  const assign = async () => {
    if (!selectedPartner) return;
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${orderId}/assign`, { deliveryPartnerId: selectedPartner });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not assign delivery partner');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED', reason: 'Cancelled by admin' });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not cancel order');
    } finally {
      setBusy(false);
    }
  };

  const nextStep = NEXT_STATUS[order.status];
  const canCancel = ['PLACED', 'CONFIRMED', 'PREPARING', 'PACKED'].includes(order.status);

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={typography.h2}>{order.isBulk ? 'Bulk Order' : 'Order'}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.productNameSnapshot} · {item.variantLabelSnapshot} × {item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{item.lineTotal}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.total}</Text>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {nextStep && (
        <Button label={nextStep.label} onPress={() => advance(nextStep.status)} loading={busy} style={{ marginBottom: 12 }} />
      )}

      {order.status === 'PACKED' && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Assign delivery partner</Text>
          {partners.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.partnerRow, selectedPartner === p.id && styles.partnerRowActive]}
              onPress={() => setSelectedPartner(p.id)}
            >
              <Text style={styles.partnerName}>{p.deliveryPartnerProfile?.name ?? p.phone}</Text>
              <Text style={styles.partnerStatus}>{p.deliveryPartnerProfile?.isOnline ? '● Online' : '○ Offline'}</Text>
            </TouchableOpacity>
          ))}
          <Button label="Assign" onPress={assign} loading={busy} disabled={!selectedPartner} style={{ marginTop: 12 }} />
        </View>
      )}

      {canCancel && <Button label="Cancel Order" variant="danger" onPress={cancel} loading={busy} />}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  orderNumber: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.inkSoft, marginBottom: 2 },
  card: { backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginBottom: 16, ...shadow.card },
  sectionLabel: { fontSize: 11.5, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { flex: 1, fontFamily: fontFamily.body, fontSize: 12.5, color: colors.ink },
  itemPrice: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.ink },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  totalLabel: { fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.ink },
  totalValue: { fontFamily: fontFamily.bodyExtraBold, fontSize: 14, color: colors.greenDeep },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginBottom: 12 },
  partnerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: radii.sm, borderWidth: 1.5, borderColor: colors.border, marginBottom: 8 },
  partnerRowActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  partnerName: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.ink },
  partnerStatus: { fontFamily: fontFamily.bodyMedium, fontSize: 11, color: colors.inkSoft },
});
