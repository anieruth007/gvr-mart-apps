import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CategoryDto, ProductDto } from '@gvr-mart/shared-types';
import { colors, gradients, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SectionHeader } from '../../components/SectionHeader';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { BannerCarousel } from '../../components/BannerCarousel';
import { useCart } from '../../context/CartContext';

const CATEGORY_ICONS: Record<string, string> = {
  Fruits: '🍎',
  Vegetables: '🥦',
  'Leafy Greens': '🥬',
  Exotic: '🥝',
  'Dry Fruits': '🥜',
};

function discountPct(p: ProductDto) {
  const v = p.variants[0];
  if (!v) return 0;
  const mrp = Number(v.mrp);
  const price = Number(v.sellingPrice);
  return mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
}

export function HomeScreen({ navigation }: any) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [featured, setFeatured] = useState<ProductDto[]>([]);
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { quantityFor, addItem, setQuantity } = useCart();

  const load = useCallback(async () => {
    const [cats, products, all] = await Promise.all([
      api.get<CategoryDto[]>('/categories'),
      api.get<ProductDto[]>('/products?featuredOnly=true'),
      api.get<ProductDto[]>('/products'),
    ]);
    setCategories(cats);
    setFeatured(products);
    setAllProducts(all);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const dailyOffers = [...allProducts].sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 8);

  const goToCategory = (categoryName: string) => {
    const match = categories.find((c) => c.name.toLowerCase().includes(categoryName));
    navigation.navigate('Categories', match ? { categoryId: match.id } : undefined);
  };

  const renderProduct = (product: ProductDto, cardStyle?: object) => {
    const variantId = product.variants[0]?.id;
    return (
      <ProductCard
        key={product.id}
        product={product}
        style={cardStyle}
        quantity={variantId ? quantityFor(variantId) : 0}
        onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        onIncrement={() => variantId && (quantityFor(variantId) === 0 ? addItem(variantId) : setQuantity(variantId, quantityFor(variantId) + 1))}
        onDecrement={() => variantId && setQuantity(variantId, Math.max(0, quantityFor(variantId) - 1))}
      />
    );
  };

  return (
    <ScreenContainer padded={false} refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.utilityBar}>
        <Text style={styles.utilityText}>
          📍 Deliver to: <Text style={styles.utilityBold}>Chennai, TN</Text>
        </Text>
        <Text style={styles.utilityText}>⚡ 30-min delivery</Text>
      </View>

      <View style={styles.body}>
        <BannerCarousel
          slides={[
            <LinearGradient key="brand" colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>● Farm-fresh · Picked today</Text>
              </View>
              <Text style={typography.heroTitle}>
                Real freshness,{'\n'}
                <Text style={{ color: colors.mango, fontFamily: fontFamily.headingBold }}>zero</Text> middlemen.
              </Text>
              <Text style={styles.heroSubtitle}>Vegetables & fruits sourced straight from Tamil Nadu farms to your kitchen.</Text>
              <TouchableOpacity style={styles.heroCta} onPress={() => navigation.navigate('Categories')}>
                <Text style={styles.heroCtaText}>Start Shopping →</Text>
              </TouchableOpacity>
              <View style={styles.heroStat}>
                <Text style={styles.heroStars}>★★★★★</Text>
                <Text style={styles.heroStatText}>4.9 · 12k+ orders</Text>
              </View>
            </LinearGradient>,
            <TouchableOpacity key="veg-offer" activeOpacity={0.9} onPress={() => goToCategory('vegetable')} style={[styles.promoBanner, { backgroundColor: colors.mangoSoft }]}>
              <Text style={styles.promoTag}>FLAT 20% OFF</Text>
              <Text style={styles.promoTitle}>Fresh Vegetables</Text>
              <Text style={styles.promoSubtitle}>On your first 3 orders this week</Text>
              <View style={styles.promoCta}>
                <Text style={styles.promoCtaText}>Shop Now →</Text>
              </View>
            </TouchableOpacity>,
            <TouchableOpacity key="exotic-offer" activeOpacity={0.9} onPress={() => goToCategory('exotic')} style={[styles.promoBanner, { backgroundColor: colors.blueSoft }]}>
              <Text style={[styles.promoTag, { backgroundColor: colors.blueDeep }]}>FLAT 25% OFF</Text>
              <Text style={styles.promoTitle}>Exotic Fruits</Text>
              <Text style={styles.promoSubtitle}>Handpicked, ripened naturally</Text>
              <View style={styles.promoCta}>
                <Text style={styles.promoCtaText}>Shop Now →</Text>
              </View>
            </TouchableOpacity>,
          ]}
        />

        <View style={styles.section}>
          <SectionHeader eyebrow="Shop by" title="Categories" />
          <View style={styles.catRow}>
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                emoji={c.emoji ?? CATEGORY_ICONS[c.name] ?? '🧺'}
                label={c.name}
                onPress={() => navigation.navigate('Categories', { categoryId: c.id })}
              />
            ))}
          </View>
        </View>

        {dailyOffers.length > 0 && (
          <View style={styles.section}>
            <SectionHeader eyebrow="Ends tonight" title="Daily Offers" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollArea} contentContainerStyle={{ gap: 12 }}>
              {dailyOffers.map((p) => renderProduct(p, styles.compactCard))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.bulkBanner} onPress={() => navigation.navigate('BulkOrderForm')} activeOpacity={0.9}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bulkTag}>FOR EVENTS & BUSINESSES</Text>
              <Text style={styles.bulkTitle}>Need bulk quantities?</Text>
              <Text style={styles.bulkSubtitle}>Get a custom quotation for functions, hotels & shops</Text>
            </View>
            <Text style={styles.bulkArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader eyebrow="Today's picks" title="Featured Products" action={{ label: 'View all', onPress: () => navigation.navigate('Categories') }} />
          <View style={styles.grid}>{featured.map((p) => renderProduct(p))}</View>
        </View>

        <View style={styles.whyStrip}>
          {WHY_US.map((item) => (
            <View key={item.title} style={styles.whyItem}>
              <View style={styles.whyIcon}>
                <Text style={{ fontSize: 17 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.whyTitle}>{item.title}</Text>
                <Text style={styles.whyBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const WHY_US = [
  { icon: '🌱', title: 'Farm Fresh', body: 'Sourced daily from local farms' },
  { icon: '🚚', title: 'Fast Delivery', body: 'At your door in 30 minutes' },
  { icon: '↩️', title: 'Easy Returns', body: 'Not fresh? Free replacement' },
  { icon: '🔒', title: 'Secure Payment', body: 'UPI, cards & cash on delivery' },
];

const styles = StyleSheet.create({
  utilityBar: {
    backgroundColor: colors.blueDeep,
    paddingHorizontal: 18,
    paddingVertical: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  utilityText: { color: colors.blueSoft, fontSize: 11.5, fontFamily: fontFamily.body },
  utilityBold: { color: colors.mango, fontFamily: fontFamily.bodyBold },
  body: { padding: 18, paddingTop: 16 },
  hero: { flex: 1, borderRadius: radii.lg, padding: 22, paddingBottom: 26 },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 14,
  },
  heroTagText: { color: colors.white, fontSize: 11.5, fontFamily: fontFamily.bodyBold },
  heroSubtitle: { color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 16, maxWidth: 230, fontFamily: fontFamily.body },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mango,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 18,
  },
  heroCtaText: { color: colors.blueDeep, fontFamily: fontFamily.bodyExtraBold, fontSize: 13.5 },
  heroStat: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroStars: { color: colors.mango, fontSize: 12 },
  heroStatText: { color: colors.blueDeep, fontSize: 11.5, fontFamily: fontFamily.bodyBold },
  promoBanner: { flex: 1, borderRadius: radii.lg, padding: 22, justifyContent: 'center' },
  promoTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tomato,
    color: colors.white,
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 12,
    overflow: 'hidden',
  },
  promoTitle: { fontFamily: fontFamily.headingBold, fontSize: 24, color: colors.blueDeep, marginBottom: 6 },
  promoSubtitle: { fontFamily: fontFamily.body, fontSize: 13, color: colors.inkSoft, marginBottom: 16 },
  promoCta: { alignSelf: 'flex-start', backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  promoCtaText: { fontFamily: fontFamily.bodyExtraBold, fontSize: 12.5, color: colors.blueDeep },
  section: { marginTop: 24 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  horizontalScrollArea: { marginHorizontal: -18, paddingHorizontal: 18 },
  compactCard: { width: 148 },
  bulkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueDeep,
    borderRadius: radii.lg,
    padding: 18,
    gap: 12,
  },
  bulkTag: { color: colors.mango, fontFamily: fontFamily.bodyExtraBold, fontSize: 10.5, letterSpacing: 0.6, marginBottom: 6 },
  bulkTitle: { color: colors.white, fontFamily: fontFamily.headingSemibold, fontSize: 17, marginBottom: 4 },
  bulkSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11.5, fontFamily: fontFamily.body, maxWidth: 220 },
  bulkArrow: { color: colors.mango, fontSize: 22, fontFamily: fontFamily.headingBold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  whyStrip: {
    marginTop: 26,
    backgroundColor: colors.blueDeep,
    borderRadius: radii.lg,
    padding: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  whyItem: { flexDirection: 'row', gap: 10, width: '45%', alignItems: 'flex-start' },
  whyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyTitle: { color: colors.white, fontSize: 12.5, fontFamily: fontFamily.bodyExtraBold, marginBottom: 2 },
  whyBody: { color: 'rgba(255,255,255,0.65)', fontSize: 10.5, fontFamily: fontFamily.body, lineHeight: 14 },
});
