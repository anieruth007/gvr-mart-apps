import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ProductDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, fontFamily } from '@gvr-mart/theme';
import { Stepper } from './Stepper';

interface Props {
  product: ProductDto;
  quantity: number;
  onPress: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductCard({ product, quantity, onPress, onIncrement, onDecrement }: Props) {
  const [liked, setLiked] = useState(false);
  const variant = product.variants[0];
  if (!variant) return null;

  const mrp = Number(variant.mrp);
  const price = Number(variant.sellingPrice);
  const discountPct = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  // The stepper and favorite button are deliberately siblings of the "open detail" touch target,
  // not nested inside it — nesting a pressable inside another pressable's hit area is fragile
  // across RN's native responder system vs. react-native-web's DOM-based one, so we avoid it
  // entirely rather than relying on event propagation quirks to keep them independent.
  return (
    <View style={styles.card}>
      {discountPct > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discountPct}% off</Text>
        </View>
      )}
      <TouchableOpacity style={styles.favBtn} onPress={() => setLiked((v) => !v)} hitSlop={6}>
        <Text style={[styles.favIcon, liked && styles.favIconActive]}>{liked ? '♥' : '♡'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageWrap} pointerEvents="none">
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : null}
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{variant.label}</Text>
        <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
      </TouchableOpacity>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.now}>₹{price}</Text>
          {mrp > price && <Text style={styles.was}>₹{mrp}</Text>}
        </View>
        <Stepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47.5%',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 12,
    ...shadow.card,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.greenDeep,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    zIndex: 2,
  },
  discountText: { color: colors.white, fontSize: 10, fontFamily: fontFamily.bodyBold },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  favIcon: { fontSize: 14, color: '#C9CFC0' },
  favIconActive: { color: colors.tomato },
  imageWrap: {
    backgroundColor: colors.greenSoft,
    borderRadius: radii.sm,
    overflow: 'hidden',
    aspectRatio: 1 / 0.85,
    marginBottom: 10,
  },
  image: { width: '100%', height: '100%' },
  name: { fontSize: 13.5, fontFamily: fontFamily.bodyBold, color: colors.ink, marginBottom: 2 },
  unit: { fontSize: 11, color: colors.inkSoft, marginBottom: 6, fontFamily: fontFamily.body },
  rating: { fontSize: 10.5, color: colors.mango, fontFamily: fontFamily.bodyBold, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  now: { fontSize: 14.5, fontFamily: fontFamily.bodyExtraBold, color: colors.greenDeep },
  was: { fontSize: 10.5, color: colors.faint, textDecorationLine: 'line-through', fontFamily: fontFamily.body },
});
