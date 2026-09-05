import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, fontFamily } from '@gvr-mart/theme';
import { Stepper } from './Stepper';

interface Props {
  product: ProductDto;
  quantity: number;
  onPress: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Overrides the default 2-column-grid width — pass a fixed width for horizontal scrollers. */
  style?: ViewStyle;
}

export function ProductCard({ product, quantity, onPress, onIncrement, onDecrement, style }: Props) {
  const [liked, setLiked] = useState(false);
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = product.variants[variantIdx] ?? product.variants[0];
  if (!variant) return null;

  const mrp = Number(variant.mrp);
  const price = Number(variant.sellingPrice);
  const discountPct = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  // The stepper and favorite button are deliberately siblings of the "open detail" touch target,
  // not nested inside it — nesting a pressable inside another pressable's hit area is fragile
  // across RN's native responder system vs. react-native-web's DOM-based one, so we avoid it
  // entirely rather than relying on event propagation quirks to keep them independent.
  return (
    <View style={[styles.card, style]}>
      <View style={styles.imageOuter}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.imageInner}>
          {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" /> : null}
        </TouchableOpacity>

        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>30 MIN</Text>
        </View>
        <TouchableOpacity style={styles.favBtn} onPress={() => setLiked((v) => !v)} hitSlop={6}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={13} color={liked ? colors.tomato : '#C9CFC0'} />
        </TouchableOpacity>
        <View style={styles.stepperFloating}>
          <Stepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
        </View>
      </View>

      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
      </TouchableOpacity>

      {product.variants.length > 1 && (
        <View style={styles.variantRow}>
          {product.variants.slice(0, 2).map((v, i) => (
            <TouchableOpacity key={v.id} onPress={() => setVariantIdx(i)} style={[styles.variantChip, i === variantIdx && styles.variantChipActive]}>
              <Text style={[styles.variantChipText, i === variantIdx && styles.variantChipTextActive]} numberOfLines={1}>
                {v.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {product.variants.length <= 1 && <Text style={styles.unit}>{variant.label}</Text>}

      <View style={styles.priceRow}>
        <Text style={styles.now}>₹{price}</Text>
        {mrp > price && <Text style={styles.was}>₹{mrp}</Text>}
        {discountPct > 0 && <Text style={styles.discountText}>{discountPct}% off</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47.5%',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 10,
    paddingBottom: 12,
    ...shadow.card,
  },
  imageOuter: { position: 'relative', marginBottom: 12 },
  imageInner: {
    backgroundColor: colors.blueSoft,
    borderRadius: radii.sm,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  image: { width: '100%', height: '100%' },
  timeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeBadgeText: { fontSize: 9, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, letterSpacing: 0.3 },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperFloating: { position: 'absolute', bottom: 8, right: 8 },
  name: { fontSize: 13, fontFamily: fontFamily.bodyBold, color: colors.ink, marginBottom: 6, lineHeight: 17, minHeight: 34 },
  unit: { fontSize: 11, color: colors.inkSoft, marginBottom: 6, fontFamily: fontFamily.body },
  variantRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  variantChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    maxWidth: 76,
  },
  variantChipActive: { borderColor: colors.blue, backgroundColor: colors.blueSoft },
  variantChipText: { fontSize: 9.5, fontFamily: fontFamily.bodyMedium, color: colors.inkSoft },
  variantChipTextActive: { color: colors.blueDeep, fontFamily: fontFamily.bodyBold },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 },
  now: { fontSize: 14.5, fontFamily: fontFamily.bodyExtraBold, color: colors.ink },
  was: { fontSize: 10.5, color: colors.faint, textDecorationLine: 'line-through', fontFamily: fontFamily.body },
  discountText: { fontSize: 10.5, fontFamily: fontFamily.bodyBold, color: '#1E9E4E' },
});
