import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { AddressDto, OrderDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';

export function CheckoutScreen({ navigation }: any) {
  const { cart, refresh } = useCart();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useFocusEffect (not a mount-only useEffect) so a newly saved address shows up immediately
  // when the user returns here from AddAddressScreen, instead of needing to leave and re-enter.
  useFocusEffect(
    useCallback(() => {
      api.get<AddressDto[]>('/users/me/addresses').then((data) => {
        setAddresses(data);
        setSelectedAddressId((current) => {
          if (current && data.some((a) => a.id === current)) return current;
          return data.find((a) => a.isDefault)?.id ?? data[0]?.id ?? null;
        });
      });
    }, []),
  );

  if (!cart || cart.items.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState icon="🛒" message="Your cart is empty." />
      </ScreenContainer>
    );
  }

  const deliveryFee = cart.subtotal >= 500 ? 0 : 30;
  const total = cart.subtotal + deliveryFee;

  const placeOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }
    setError(null);
    setPlacing(true);
    try {
      const order = await api.post<OrderDto>('/orders', {
        addressId: selectedAddressId,
        slotType: 'ASAP',
        couponCode: couponCode.trim() || undefined,
      });
      await refresh();
      navigation.replace('OrderTracking', { orderId: order.id });
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>Checkout</Text>

      <Text style={styles.sectionLabel}>Deliver to</Text>
      {addresses.length === 0 ? (
        <TouchableOpacity style={styles.addAddressBtn} onPress={() => navigation.navigate('AddAddress')}>
          <Text style={styles.addAddressText}>+ Add a delivery address</Text>
        </TouchableOpacity>
      ) : (
        addresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            style={[styles.addressCard, selectedAddressId === addr.id && styles.addressCardActive]}
            onPress={() => setSelectedAddressId(addr.id)}
          >
            <Text style={styles.addressLabel}>{addr.label}</Text>
            <Text style={styles.addressLine}>
              {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionLabel}>Delivery slot</Text>
      <View style={styles.slotChip}>
        <Text style={styles.slotChipText}>⚡ ASAP · within 30 minutes</Text>
      </View>
      <Text style={styles.slotNote}>Scheduled delivery slots are coming in a future update.</Text>

      <Text style={styles.sectionLabel}>Coupon code</Text>
      <TextInput
        value={couponCode}
        onChangeText={setCouponCode}
        placeholder="e.g. WELCOME100"
        placeholderTextColor={colors.muted}
        autoCapitalize="characters"
        style={styles.couponInput}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{cart.subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery fee</Text>
          <Text style={styles.summaryValue}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
        </View>
        <Text style={styles.couponNote}>Coupon discount is applied when you place the order.</Text>
        <View style={[styles.summaryRow, { marginTop: 8 }]}>
          <Text style={styles.totalLabel}>Estimated total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
      </View>

      <View style={styles.codNote}>
        <Text style={styles.codNoteText}>💵 Cash on Delivery — online payment is coming in a future update.</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label="Place Order" onPress={placeOrder} loading={placing} disabled={!selectedAddressId} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 12, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginTop: 18, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  addressCard: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent', ...shadow.card },
  addressCardActive: { borderColor: colors.blue },
  addressLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink, marginBottom: 4 },
  addressLine: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft },
  addAddressBtn: { backgroundColor: colors.blueSoft, borderRadius: radii.md - 2, padding: 16, alignItems: 'center' },
  addAddressText: { fontFamily: fontFamily.bodyBold, color: colors.blueDeep, fontSize: 13 },
  slotChip: { backgroundColor: colors.blueSoft, borderRadius: radii.sm, paddingVertical: 10, paddingHorizontal: 14, alignSelf: 'flex-start' },
  slotChipText: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.blueDeep },
  slotNote: { fontFamily: fontFamily.body, fontSize: 11, color: colors.inkSoft, marginTop: 6 },
  couponInput: { backgroundColor: colors.white, borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink, ...shadow.card },
  summary: { marginTop: 20, padding: 16, backgroundColor: colors.white, borderRadius: radii.md, ...shadow.card },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft },
  summaryValue: { fontFamily: fontFamily.bodyMedium, fontSize: 12.5, color: colors.ink },
  couponNote: { fontFamily: fontFamily.body, fontSize: 10.5, color: colors.faint, marginTop: 2 },
  totalLabel: { fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.ink },
  totalValue: { fontFamily: fontFamily.bodyExtraBold, fontSize: 15, color: colors.blueDeep },
  codNote: { marginTop: 14, backgroundColor: colors.mangoSoft, borderRadius: radii.sm, padding: 12 },
  codNoteText: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.ink },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginTop: 12 },
});
