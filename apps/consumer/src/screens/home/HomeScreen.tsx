import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { CategoryDto, ProductDto } from '@gvr-mart/shared-types';
import { colors, gradients, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SectionHeader } from '../../components/SectionHeader';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { BannerCarousel } from '../../components/BannerCarousel';
import { FadeInSection } from '../../components/FadeInSection';
import { useCart } from '../../context/CartContext';
import { ALL_CATEGORY_PHOTO, CATEGORY_PHOTOS } from '../../constants/categoryPhotos';

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
  const scrollY = useRef(new Animated.Value(0)).current;
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true });
  const heroScale = scrollY.interpolate({ inputRange: [-120, 0], outputRange: [1.25, 1], extrapolate: 'clamp' });
  const heroTranslate = scrollY.interpolate({ inputRange: [0, 200], outputRange: [0, -40], extrapolate: 'clamp' });

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
    <ScreenContainer padded={false} refreshing={refreshing} onRefresh={onRefresh} onScroll={handleScroll}>
      <View style={styles.utilityBar}>
        <View style={styles.utilityItem}>
          <Ionicons name="location-outline" size={13} color={colors.blueSoft} />
          <Text style={styles.utilityText}>
            Deliver to: <Text style={styles.utilityBold}>Chennai, TN</Text>
          </Text>
        </View>
        <View style={styles.utilityItem}>
          <Ionicons name="flash-outline" size={13} color={colors.blueSoft} />
          <Text style={styles.utilityText}>30-min delivery</Text>
        </View>
      </View>

      <View style={styles.brandBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>G</Text>
          </View>
          <Text style={styles.logoText}>
            GVR <Text style={{ color: colors.mango }}>Mart</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Categories')} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={16} color={colors.muted} />
          <Text style={styles.searchPlaceholder}>Search for fresh mangoes, spinach...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Animated.View style={{ transform: [{ scale: heroScale }, { translateY: heroTranslate }] }}>
        <BannerCarousel
          height={310}
          slides={[
            <LinearGradient key="brand" colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>● Farm-fresh · Picked today</Text>
              </View>
              <Text style={typography.heroTitle}>
                Real freshness,{'\n'}
                <Text style={{ color: colors.mango, fontFamily: fontFamily.headingBold }}>zero</Text> middlemen.
              </Text>
              <Text style={styles.heroSubtitle} numberOfLines={2}>Vegetables & fruits sourced straight from Tamil Nadu farms to your kitchen.</Text>
              <TouchableOpacity style={styles.heroCta} onPress={() => navigation.navigate('Categories')}>
                <Text style={styles.heroCtaText}>Start Shopping →</Text>
              </TouchableOpacity>
              <View style={styles.heroStat}>
                <Ionicons name="star" size={12} color={colors.mango} />
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
            <TouchableOpacity key="bulk-offer" activeOpacity={0.9} onPress={() => navigation.navigate('BulkOrderForm')} style={styles.bulkSlide}>
              <Text style={styles.bulkTag}>FOR EVENTS & BUSINESSES</Text>
              <Text style={styles.bulkSlideTitle}>Need bulk quantities?</Text>
              <Text style={styles.bulkSlideSubtitle} numberOfLines={2}>Get a custom quotation for functions, hotels & shops</Text>
              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Get Quotation →</Text>
              </View>
            </TouchableOpacity>,
          ]}
        />
        </Animated.View>

        <FadeInSection index={1} style={styles.section}>
          <SectionHeader eyebrow="Shop by" title="Categories" />
          <View style={styles.catRow}>
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                imageUrl={c.imageUrl ?? CATEGORY_PHOTOS[c.name] ?? ALL_CATEGORY_PHOTO}
                label={c.name}
                onPress={() => navigation.navigate('Categories', { categoryId: c.id })}
              />
            ))}
          </View>
        </FadeInSection>

        {dailyOffers.length > 0 && (
          <FadeInSection index={2} style={styles.section}>
            <SectionHeader eyebrow="Ends tonight" title="Daily Offers" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollArea} contentContainerStyle={{ gap: 12 }}>
              {dailyOffers.map((p) => renderProduct(p, styles.compactCard))}
            </ScrollView>
          </FadeInSection>
        )}

        <FadeInSection index={3} style={styles.section}>
          <SectionHeader eyebrow="Today's picks" title="Featured Products" action={{ label: 'View all', onPress: () => navigation.navigate('Categories') }} />
          <View style={styles.grid}>{featured.map((p) => renderProduct(p))}</View>
        </FadeInSection>

        <FadeInSection index={4} style={styles.whyStrip}>
          {WHY_US.map((item) => (
            <View key={item.title} style={styles.whyItem}>
              <View style={styles.whyIcon}>
                <Ionicons name={item.icon} size={16} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.whyTitle}>{item.title}</Text>
                <Text style={styles.whyBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </FadeInSection>
      </View>
    </ScreenContainer>
  );
}

const WHY_US: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; body: string }[] = [
  { icon: 'leaf-outline', title: 'Farm Fresh', body: 'Sourced daily from local farms' },
  { icon: 'bicycle-outline', title: 'Fast Delivery', body: 'At your door in 30 minutes' },
  { icon: 'refresh-outline', title: 'Easy Returns', body: 'Not fresh? Free replacement' },
  { icon: 'shield-checkmark-outline', title: 'Secure Payment', body: 'UPI, cards & cash on delivery' },
];

const styles = StyleSheet.create({
  utilityBar: {
    backgroundColor: colors.blueDeep,
    paddingHorizontal: 18,
    paddingVertical: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  utilityItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  utilityText: { color: colors.blueSoft, fontSize: 11.5, fontFamily: fontFamily.body },
  utilityBold: { color: colors.mango, fontFamily: fontFamily.bodyBold },
  brandBar: { backgroundColor: colors.cream, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 4 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  logoMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.blueDeep, alignItems: 'center', justifyContent: 'center' },
  logoMarkText: { color: colors.white, fontFamily: fontFamily.headingBold, fontSize: 16 },
  logoText: { fontFamily: fontFamily.headingBold, fontSize: 19, color: colors.blueDeep },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    ...shadow.card,
  },
  searchPlaceholder: { fontFamily: fontFamily.body, fontSize: 13, color: colors.muted },
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
  bulkSlide: { flex: 1, borderRadius: radii.lg, padding: 22, justifyContent: 'center', backgroundColor: colors.blueDeep },
  bulkTag: { color: colors.mango, fontFamily: fontFamily.bodyExtraBold, fontSize: 10.5, letterSpacing: 0.6, marginBottom: 10 },
  bulkSlideTitle: { color: colors.white, fontFamily: fontFamily.headingBold, fontSize: 24, marginBottom: 6 },
  bulkSlideSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: fontFamily.body, maxWidth: 240, marginBottom: 16 },
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
