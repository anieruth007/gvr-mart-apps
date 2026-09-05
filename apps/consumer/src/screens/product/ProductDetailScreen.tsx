import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ProductDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { useCart } from '../../context/CartContext';

export function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    api.get<ProductDto>(`/products/${productId}`).then((p) => {
      setProduct(p);
      setVariantId(p.variants[0]?.id ?? null);
    });
  }, [productId]);

  if (!product) return <ScreenContainer><Text>Loading...</Text></ScreenContainer>;

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const mrp = Number(variant?.mrp ?? 0);
  const price = Number(variant?.sellingPrice ?? 0);

  const handleAdd = async () => {
    if (variant) await addItem(variant.id);
  };

  const handleBuyNow = async () => {
    if (variant) {
      await addItem(variant.id);
      navigation.navigate('Checkout');
    }
  };

  return (
    <ScreenContainer padded={false}>
      <View style={styles.imageWrap}>
        {product.imageUrl && <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />}
      </View>

      <View style={styles.body}>
        <Text style={typography.h1}>{product.name}</Text>
        <Text style={styles.rating}>★ {product.rating.toFixed(1)} rating</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          {mrp > price && <Text style={styles.mrp}>₹{mrp}</Text>}
          {mrp > price && (
            <View style={styles.discountPill}>
              <Text style={styles.discountText}>{Math.round((1 - price / mrp) * 100)}% off</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Select size</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantRow}>
          {product.variants.map((v) => (
            <TouchableOpacity
              key={v.id}
              onPress={() => setVariantId(v.id)}
              style={[styles.variantChip, variantId === v.id && styles.variantChipActive]}
            >
              <Text style={[styles.variantLabel, variantId === v.id && styles.variantLabelActive]}>{v.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {product.description && (
          <>
            <Text style={styles.sectionLabel}>About this product</Text>
            <Text style={styles.description}>{product.description}</Text>
          </>
        )}

        <Text style={styles.stockNote}>
          {variant && variant.stockQty > 0 ? `${variant.stockQty} in stock` : 'Out of stock'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button label="Add to Cart" variant="ghost" onPress={handleAdd} disabled={!variant || variant.stockQty === 0} style={{ flex: 1 }} />
        <Button label="Buy Now" onPress={handleBuyNow} disabled={!variant || variant.stockQty === 0} style={{ flex: 1 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  imageWrap: { height: 260, backgroundColor: colors.blueSoft },
  image: { width: '100%', height: '100%' },
  body: { padding: 20, gap: 4 },
  rating: { fontSize: 12, color: colors.mango, fontFamily: fontFamily.bodyBold, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  price: { fontSize: 24, fontFamily: fontFamily.bodyExtraBold, color: colors.blueDeep },
  mrp: { fontSize: 14, color: colors.faint, textDecorationLine: 'line-through', fontFamily: fontFamily.body },
  discountPill: { backgroundColor: colors.blueSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  discountText: { fontSize: 11, color: colors.blueDeep, fontFamily: fontFamily.bodyBold },
  sectionLabel: { fontSize: 12, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginTop: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  variantRow: { flexDirection: 'row' },
  variantChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  variantChipActive: { borderColor: colors.blue, backgroundColor: colors.blueSoft },
  variantLabel: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.inkSoft },
  variantLabelActive: { color: colors.blueDeep },
  description: { fontFamily: fontFamily.body, fontSize: 13.5, color: colors.inkSoft, lineHeight: 20 },
  stockNote: { fontFamily: fontFamily.bodyMedium, fontSize: 12, color: colors.blue, marginTop: 16 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cream,
    ...shadow.floating,
  },
});
