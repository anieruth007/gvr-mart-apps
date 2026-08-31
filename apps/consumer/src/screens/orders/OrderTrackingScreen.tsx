import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { OrderDto, OrderStatus } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';

const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: 'PLACED', label: 'Order placed' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'ASSIGNED', label: 'Delivery partner assigned' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export function OrderTrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    api.get<OrderDto>(`/orders/${orderId}`).then(setOrder);
  }, [orderId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!order) return <ScreenContainer><Text>Loading...</Text></ScreenContainer>;

  const isTerminalFailure = ['CANCELLED', 'REFUND_PENDING', 'REFUNDED'].includes(order.status);
  const currentIndex = TIMELINE.findIndex((t) => t.status === order.status);
  const canCancel = ['PLACED', 'CONFIRMED', 'PREPARING', 'PACKED'].includes(order.status);

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      await api.patch(`/orders/${orderId}/cancel`, { reason: 'Cancelled by customer' });
      load();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={typography.h2}>{order.isBulk ? 'Bulk Order' : 'Order Tracking'}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {!isTerminalFailure ? (
        <View style={styles.timeline}>
          {TIMELINE.map((step, idx) => {
            const done = idx <= currentIndex;
            const isLast = idx === TIMELINE.length - 1;
            return (
              <View key={step.status} style={styles.timelineRow}>
                <View style={styles.timelineTrack}>
                  <View style={[styles.dot, done && styles.dotDone]} />
                  {!isLast && <View style={[styles.line, idx < currentIndex && styles.lineDone]} />}
                </View>
                <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>{step.label}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.cancelledBox}>
          <Text style={styles.cancelledText}>
            {order.status === 'CANCELLED' ? (order as any).cancelReason || 'This order was cancelled.' : 'This order is being refunded.'}
          </Text>
        </View>
      )}

      {order.status === 'OUT_FOR_DELIVERY' && (
        <View style={styles.otpNote}>
          <Text style={styles.otpNoteText}>
            🔑 Check your notifications for the delivery OTP to share with your delivery partner.
          </Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>Items</Text>
      {order.items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.itemName}>{item.productNameSnapshot} · {item.variantLabelSnapshot}</Text>
          <Text style={styles.itemQty}>x{item.quantity}</Text>
          <Text style={styles.itemPrice}>₹{item.lineTotal}</Text>
        </View>
      ))}

      <View style={styles.summary}>
        <SummaryRow label="Subtotal" value={`₹${order.subtotal}`} />
        <SummaryRow label="Discount" value={`-₹${order.discount}`} />
        <SummaryRow label="Delivery fee" value={`₹${order.deliveryFee}`} />
        <SummaryRow label="Total" value={`₹${order.total}`} bold />
      </View>

      {canCancel && (
        <Button label="Cancel Order" variant="danger" onPress={cancelOrder} loading={cancelling} style={{ marginTop: 18 }} />
      )}
    </ScreenContainer>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={bold ? styles.totalLabel : styles.summaryLabel}>{label}</Text>
      <Text style={bold ? styles.totalValue : styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  orderNumber: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: colors.inkSoft, marginBottom: 2 },
  timeline: { marginBottom: 20 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineTrack: { alignItems: 'center', width: 24 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, marginTop: 3 },
  dotDone: { backgroundColor: colors.green },
  line: { width: 2, flex: 1, minHeight: 24, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.green },
  timelineLabel: { fontFamily: fontFamily.bodyMedium, fontSize: 13, color: colors.faint, paddingBottom: 20, marginLeft: 10 },
  timelineLabelDone: { color: colors.ink, fontFamily: fontFamily.bodyBold },
  cancelledBox: { backgroundColor: colors.mangoSoft, borderRadius: radii.sm, padding: 14, marginBottom: 20 },
  cancelledText: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.ink },
  otpNote: { backgroundColor: colors.greenSoft, borderRadius: radii.sm, padding: 12, marginBottom: 20 },
  otpNoteText: { fontFamily: fontFamily.bodyMedium, fontSize: 12, color: colors.greenDeep },
  sectionLabel: { fontSize: 12, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemName: { flex: 1, fontFamily: fontFamily.body, fontSize: 12.5, color: colors.ink },
  itemQty: { fontFamily: fontFamily.bodyMedium, fontSize: 12, color: colors.inkSoft, marginRight: 10 },
  itemPrice: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.ink },
  summary: { marginTop: 16, padding: 16, backgroundColor: colors.white, borderRadius: radii.md, ...shadow.card },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft },
  summaryValue: { fontFamily: fontFamily.bodyMedium, fontSize: 12.5, color: colors.ink },
  totalLabel: { fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.ink },
  totalValue: { fontFamily: fontFamily.bodyExtraBold, fontSize: 14, color: colors.greenDeep },
});
