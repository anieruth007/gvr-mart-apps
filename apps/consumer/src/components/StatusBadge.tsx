import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { OrderStatus } from '@gvr-mart/shared-types';
import { colors, fontFamily } from '@gvr-mart/theme';

const STATUS_COLOR: Record<OrderStatus, string> = {
  PLACED: colors.mango,
  CONFIRMED: colors.green,
  PREPARING: colors.green,
  PACKED: colors.green,
  ASSIGNED: colors.greenDeep,
  OUT_FOR_DELIVERY: colors.greenDeep,
  DELIVERED: colors.green,
  CANCELLED: colors.tomato,
  REFUND_PENDING: colors.tomato,
  REFUNDED: colors.inkSoft,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  PACKED: 'Packed',
  ASSIGNED: 'Delivery assigned',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUND_PENDING: 'Refund pending',
  REFUNDED: 'Refunded',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  text: { fontSize: 11, fontFamily: fontFamily.bodyBold },
});
