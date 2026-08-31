import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Stepper } from '../../components/Stepper';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';

export function CartScreen({ navigation }: any) {
  const { cart, setQuantity } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <ScreenContainer>
        <Text style={[typography.h1, { marginBottom: 4 }]}>Your Cart</Text>
        <EmptyState icon="🛒" message="Your cart is empty. Add some farm-fresh picks!" />
      </ScreenContainer>
    );
  }

  const deliveryFee = cart.subtotal >= 500 ? 0 : 30;
  const total = cart.subtotal + deliveryFee;

  return (
    <ScreenContainer scroll={false} padded={false}>
      <View style={styles.header}>
        <Text style={typography.h1}>Your Cart</Text>
        <Text style={styles.count}>{cart.itemCount} items</Text>
      </View>

      <View style={styles.list}>
        {cart.items.map((item) => (
          <View key={item.id} style={styles.row}>
            {item.variant.product.imageUrl && (
              <Image source={{ uri: item.variant.product.imageUrl }} style={styles.image} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.variant.product.name}</Text>
              <Text style={styles.unit}>{item.variant.label} · ₹{item.variant.sellingPrice}</Text>
            </View>
            <Stepper
              quantity={item.quantity}
              onIncrement={() => setQuantity(item.variantId, item.quantity + 1)}
              onDecrement={() => setQuantity(item.variantId, item.quantity - 1)}
            />
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{cart.subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery fee</Text>
          <Text style={styles.summaryValue}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: 8 }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
        <Button label={`Proceed to Checkout · ₹${total}`} onPress={() => navigation.navigate('Checkout')} style={{ marginTop: 16 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 18, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  count: { fontFamily: fontFamily.bodyMedium, fontSize: 12.5, color: colors.inkSoft },
  list: { paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  image: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.greenSoft },
  name: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink },
  unit: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  summary: {
    margin: 18,
    padding: 18,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    ...shadow.card,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft },
  summaryValue: { fontFamily: fontFamily.bodyMedium, fontSize: 12.5, color: colors.ink },
  totalLabel: { fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.ink },
  totalValue: { fontFamily: fontFamily.bodyExtraBold, fontSize: 15, color: colors.greenDeep },
});
