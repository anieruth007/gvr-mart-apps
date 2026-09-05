import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';

export function DeliveryDetailScreen({ route, navigation }: any) {
  const { delivery } = route.params;
  const [accepted, setAccepted] = useState(!!delivery.acceptedAt);
  const [outForDelivery, setOutForDelivery] = useState(!!delivery.outForDeliveryAt);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = delivery.order;

  const handleAccept = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/delivery/${delivery.id}/accept`);
      setAccepted(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not accept delivery');
    } finally {
      setBusy(false);
    }
  };

  const handleOutForDelivery = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/delivery/${delivery.id}/out-for-delivery`);
      setOutForDelivery(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not update status');
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/delivery/${delivery.id}/complete`, { otp });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Incorrect OTP');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 4 }]}>#{order.orderNumber}</Text>
      <Text style={styles.customer}>{order.user.customerProfile?.name ?? order.user.phone}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Delivery address</Text>
        <Text style={styles.value}>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</Text>
        <Text style={styles.value}>{order.address.city}, {order.address.state} - {order.address.pincode}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.user.phone}`)} style={styles.callBtn}>
          <Text style={styles.callBtnText}>📞 Call Customer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Items ({order.items.length})</Text>
        {order.items.map((item: any, idx: number) => (
          <Text key={idx} style={styles.value}>
            {item.productNameSnapshot} × {item.quantity}
          </Text>
        ))}
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <Text style={styles.value}>Amount to collect</Text>
          <Text style={styles.amount}>{order.paymentStatus === 'PAID' ? 'Paid online' : `₹${order.total} (COD)`}</Text>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {!accepted && <Button label="Accept Delivery" onPress={handleAccept} loading={busy} />}

      {accepted && !outForDelivery && (
        <Button label="Mark Out for Delivery" onPress={handleOutForDelivery} loading={busy} />
      )}

      {outForDelivery && (
        <View style={styles.otpSection}>
          <Text style={styles.sectionLabel}>Delivery OTP</Text>
          <Text style={styles.otpHint}>Ask the customer for the 4-digit code shared in their notifications.</Text>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="0000"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.otpInput}
          />
          <Button label="Mark Delivered" onPress={handleComplete} loading={busy} disabled={otp.length < 4} style={{ marginTop: 14 }} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  customer: { fontFamily: fontFamily.bodyMedium, fontSize: 13, color: colors.inkSoft, marginBottom: 18 },
  card: { backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginBottom: 16, ...shadow.card },
  sectionLabel: { fontSize: 11.5, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontFamily: fontFamily.body, fontSize: 13, color: colors.ink, marginBottom: 2 },
  callBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: colors.blueSoft, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  callBtnText: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.blueDeep },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  amount: { fontFamily: fontFamily.bodyExtraBold, fontSize: 13, color: colors.blueDeep },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginBottom: 12 },
  otpSection: { marginTop: 4 },
  otpHint: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, marginBottom: 12 },
  otpInput: {
    backgroundColor: colors.white,
    borderRadius: radii.md - 2,
    height: 54,
    textAlign: 'center',
    fontFamily: fontFamily.headingBold,
    fontSize: 22,
    letterSpacing: 8,
    color: colors.ink,
    ...shadow.card,
  },
});
