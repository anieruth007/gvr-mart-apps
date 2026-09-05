import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductDto, ProductVariantDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Stepper } from '../../components/Stepper';
import { useCart } from '../../context/CartContext';

type Tab = 'highlights' | 'description';

const INFO_ITEMS: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; body: string }[] = [
  { icon: 'refresh-outline', title: 'Easy Returns', body: 'Not fresh? Free replacement' },
  { icon: 'bicycle-outline', title: 'Fast Delivery', body: 'At your door in 30 min' },
  { icon: 'headset-outline', title: '24/7 Support', body: 'We’re here to help' },
];

export function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('highlights');
  const [liked, setLiked] = useState(false);
  const { cart, quantityFor, addItem, setQuantity } = useCart();

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
  const discountPct = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  const quantity = variant ? quantityFor(variant.id) : 0;

  return (
    <ScreenContainer padded={false} scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          {product.imageUrl && <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />}
          <TouchableOpacity style={styles.bookmarkBtn} onPress={() => setLiked((v) => !v)}>
            <Ionicons name={liked ? 'bookmark' : 'bookmark-outline'} size={16} color={liked ? colors.blue : colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          {product.description && <Text style={styles.subtitle}>{product.description}</Text>}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantScroll} contentContainerStyle={{ gap: 10 }}>
            {product.variants.map((v) => (
              <VariantCard key={v.id} variant={v} active={variantId === v.id} onPress={() => setVariantId(v.id)} />
            ))}
          </ScrollView>

          <View style={styles.infoRow}>
            {INFO_ITEMS.map((item) => (
              <View key={item.title} style={styles.infoItem}>
                <Ionicons name={item.icon} size={18} color={colors.blueDeep} />
                <Text style={styles.infoTitle}>{item.title}</Text>
                <Text style={styles.infoBody}>{item.body}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tabsRow}>
            <TabChip label="Highlights" active={tab === 'highlights'} onPress={() => setTab('highlights')} />
            <TabChip label="Description" active={tab === 'description'} onPress={() => setTab('description')} />
          </View>

          {tab === 'highlights' ? (
            <View style={styles.highlightsCard}>
              <HighlightRow label="Category" value={product.isFeatured ? 'Featured pick' : 'Everyday essential'} />
              <HighlightRow label="Pack size" value={variant?.label ?? '-'} />
              <HighlightRow label="Unit" value={variant?.unit ?? '-'} />
              <HighlightRow label="Availability" value={variant && variant.stockQty > 0 ? `${variant.stockQty} in stock` : 'Out of stock'} last />
            </View>
          ) : (
            <Text style={styles.description}>{product.description || 'No additional description available for this product yet.'}</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <View style={styles.footerPriceRow}>
            <Text style={styles.footerPrice}>₹{price}</Text>
            {mrp > price && <Text style={styles.footerMrp}>₹{mrp}</Text>}
          </View>
          {discountPct > 0 && <Text style={styles.footerDiscount}>{discountPct}% off</Text>}
        </View>
        {variant && variant.stockQty > 0 ? (
          <Stepper
            quantity={quantity}
            onIncrement={() => (quantity === 0 ? addItem(variant.id) : setQuantity(variant.id, quantity + 1))}
            onDecrement={() => setQuantity(variant.id, Math.max(0, quantity - 1))}
          />
        ) : (
          <View style={styles.outOfStockPill}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

function VariantCard({ variant, active, onPress }: { variant: ProductVariantDto; active: boolean; onPress: () => void }) {
  const mrp = Number(variant.mrp);
  const price = Number(variant.sellingPrice);
  const discountPct = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.variantCard, active && styles.variantCardActive]}>
      <Text style={[styles.variantLabel, active && styles.variantLabelActive]}>{variant.label}</Text>
      {discountPct > 0 && <Text style={styles.variantDiscount}>{discountPct}% OFF</Text>}
      <View style={styles.variantPriceRow}>
        <Text style={styles.variantPrice}>₹{price}</Text>
        {mrp > price && <Text style={styles.variantMrp}>₹{mrp}</Text>}
      </View>
      <Text style={styles.variantStock}>{variant.stockQty > 0 ? `${variant.stockQty} left` : 'Out of stock'}</Text>
    </TouchableOpacity>
  );
}

function TabChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabChip, active && styles.tabChipActive]}>
      <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function HighlightRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.highlightRow, !last && styles.highlightRowBorder]}>
      <Text style={styles.highlightLabel}>{label}</Text>
      <Text style={styles.highlightValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrap: { height: 260, backgroundColor: colors.blueSoft, position: 'relative' },
  image: { width: '100%', height: '100%' },
  bookmarkBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 20, paddingBottom: 8 },
  name: { fontFamily: fontFamily.headingBold, fontSize: 21, color: colors.blueDeep, marginBottom: 4 },
  subtitle: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft, marginBottom: 16, lineHeight: 18 },
  variantScroll: { marginBottom: 20 },
  variantCard: {
    width: 118,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 10,
  },
  variantCardActive: { borderColor: colors.blue, backgroundColor: colors.blueSoft },
  variantLabel: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.ink, marginBottom: 4 },
  variantLabelActive: { color: colors.blueDeep },
  variantDiscount: { fontFamily: fontFamily.bodyBold, fontSize: 10, color: '#1E9E4E', marginBottom: 6 },
  variantPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginBottom: 4 },
  variantPrice: { fontFamily: fontFamily.bodyExtraBold, fontSize: 13.5, color: colors.ink },
  variantMrp: { fontFamily: fontFamily.body, fontSize: 10, color: colors.faint, textDecorationLine: 'line-through' },
  variantStock: { fontFamily: fontFamily.body, fontSize: 9.5, color: colors.inkSoft },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 20,
    ...shadow.card,
  },
  infoItem: { flex: 1, alignItems: 'center', gap: 4 },
  infoTitle: { fontFamily: fontFamily.bodyBold, fontSize: 10.5, color: colors.ink, textAlign: 'center' },
  infoBody: { fontFamily: fontFamily.body, fontSize: 9, color: colors.inkSoft, textAlign: 'center' },
  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8 },
  tabChipActive: { backgroundColor: colors.blueDeep, borderColor: colors.blueDeep },
  tabChipText: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.inkSoft },
  tabChipTextActive: { color: colors.white },
  highlightsCard: { backgroundColor: colors.white, borderRadius: radii.md, ...shadow.card },
  highlightRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  highlightRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  highlightLabel: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft },
  highlightValue: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.ink },
  description: { fontFamily: fontFamily.body, fontSize: 13, color: colors.inkSoft, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    ...shadow.floating,
  },
  footerPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  footerPrice: { fontFamily: fontFamily.bodyExtraBold, fontSize: 19, color: colors.ink },
  footerMrp: { fontFamily: fontFamily.body, fontSize: 13, color: colors.faint, textDecorationLine: 'line-through' },
  footerDiscount: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: '#1E9E4E', marginTop: 2 },
  outOfStockPill: { backgroundColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radii.sm },
  outOfStockText: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.inkSoft },
});
