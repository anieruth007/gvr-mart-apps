import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CategoryDto, ProductDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { Stepper } from '../../components/Stepper';
import { useCart } from '../../context/CartContext';
import { ALL_CATEGORY_PHOTO, CATEGORY_PHOTOS } from '../../constants/categoryPhotos';

type SortMode = 'default' | 'price_asc' | 'price_desc';

function cheapestPrice(p: ProductDto) {
  return Math.min(...p.variants.map((v) => Number(v.sellingPrice)), Infinity);
}

export function CategoryListScreen({ navigation, route }: any) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(route?.params?.categoryId ?? null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('default');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const { quantityFor, addItem, setQuantity } = useCart();

  useEffect(() => {
    api.get<CategoryDto[]>('/categories').then(setCategories);
  }, []);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (search.trim()) params.set('search', search.trim());
    const data = await api.get<ProductDto[]>(`/products?${params.toString()}`);
    setProducts(data);
  }, [activeCategory, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'price_asc') return cheapestPrice(a) - cheapestPrice(b);
    if (sort === 'price_desc') return cheapestPrice(b) - cheapestPrice(a);
    return 0;
  });

  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name ?? 'All Products';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>{activeCategoryName}</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for fresh mangoes, spinach..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
          <SidebarItem
            imageUrl={ALL_CATEGORY_PHOTO}
            label="All"
            active={!activeCategory}
            onPress={() => setActiveCategory(null)}
          />
          {categories.map((c) => (
            <SidebarItem
              key={c.id}
              imageUrl={c.imageUrl ?? CATEGORY_PHOTOS[c.name] ?? ALL_CATEGORY_PHOTO}
              label={c.name}
              active={activeCategory === c.id}
              onPress={() => setActiveCategory(c.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={styles.sortRowContent}>
            {(['default', 'price_asc', 'price_desc'] as const).map((mode) => (
              <TouchableOpacity key={mode} onPress={() => setSort(mode)} style={[styles.sortChip, sort === mode && styles.sortChipActive]}>
                <Text style={[styles.sortChipText, sort === mode && styles.sortChipTextActive]}>
                  {mode === 'default' ? 'Sort' : mode === 'price_asc' ? 'Low to High' : 'High to Low'}
                </Text>
                {mode === 'default' && <Ionicons name="chevron-down" size={12} color={colors.inkSoft} />}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.gridScrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridScroll}>
            {sortedProducts.length === 0 ? (
              <EmptyState icon="leaf-outline" message="No products match your search yet." />
            ) : (
              <View style={styles.grid}>
                {sortedProducts.map((product) => {
                  const variantId = product.variants[0]?.id;
                  return (
                    <ProductRow
                      key={product.id}
                      product={product}
                      quantity={variantId ? quantityFor(variantId) : 0}
                      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                      onIncrement={() => variantId && (quantityFor(variantId) === 0 ? addItem(variantId) : setQuantity(variantId, quantityFor(variantId) + 1))}
                      onDecrement={() => variantId && setQuantity(variantId, Math.max(0, quantityFor(variantId) - 1))}
                    />
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ProductRow({
  product,
  quantity,
  onPress,
  onIncrement,
  onDecrement,
}: {
  product: ProductDto;
  quantity: number;
  onPress: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const variant = product.variants[0];
  if (!variant) return null;
  const mrp = Number(variant.mrp);
  const price = Number(variant.sellingPrice);
  const discountPct = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  // The stepper is a sibling of the "open detail" touch target, not nested inside it — see the
  // note in ProductCard.tsx on why nesting pressables here is fragile across platforms.
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.rowPressable} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.rowImageWrap}>
          {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.rowImage} resizeMode="cover" /> : null}
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.rowUnit}>{variant.label}</Text>
          <View style={styles.rowPriceRow}>
            <Text style={styles.rowPrice}>₹{price}</Text>
            {mrp > price && <Text style={styles.rowMrp}>₹{mrp}</Text>}
            {discountPct > 0 && <Text style={styles.rowDiscount}>{discountPct}% off</Text>}
          </View>
        </View>
      </TouchableOpacity>
      <Stepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
    </View>
  );
}

function SidebarItem({ imageUrl, label, active, onPress }: { imageUrl: string; label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.sidebarItem, active && styles.sidebarItemActive]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.sidebarPhotoWrap, active && styles.sidebarPhotoWrapActive]}>
        <Image source={{ uri: imageUrl }} style={styles.sidebarPhoto} resizeMode="cover" />
      </View>
      <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const SIDEBAR_WIDTH = 92;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { padding: 18, paddingBottom: 12, backgroundColor: colors.cream },
  headerTitle: { fontFamily: fontFamily.headingBold, fontSize: 19, color: colors.blueDeep, marginBottom: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    ...shadow.card,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.body, fontSize: 13.5, color: colors.ink },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: { width: SIDEBAR_WIDTH, backgroundColor: colors.white, borderRightWidth: 1, borderRightColor: colors.border },
  sidebarItem: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, gap: 6, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  sidebarItemActive: { backgroundColor: colors.blueSoft, borderLeftColor: colors.blue },
  sidebarPhotoWrap: { width: 48, height: 48, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.cream, borderWidth: 1.5, borderColor: 'transparent' },
  sidebarPhotoWrapActive: { borderColor: colors.blue },
  sidebarPhoto: { width: '100%', height: '100%' },
  sidebarLabel: { fontSize: 10, fontFamily: fontFamily.bodyMedium, color: colors.inkSoft, textAlign: 'center', lineHeight: 12.5 },
  sidebarLabelActive: { color: colors.blueDeep, fontFamily: fontFamily.bodyBold },
  content: { flex: 1 },
  sortRow: { flexGrow: 0, paddingTop: 14, paddingBottom: 10 },
  sortRowContent: { flexDirection: 'row', gap: 8, paddingHorizontal: 14 },
  sortChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  sortChipActive: { backgroundColor: colors.blueSoft, borderColor: colors.blue },
  sortChipText: { fontFamily: fontFamily.bodyMedium, fontSize: 11, color: colors.inkSoft },
  sortChipTextActive: { color: colors.blueDeep, fontFamily: fontFamily.bodyBold },
  gridScrollView: { flex: 1 },
  gridScroll: { padding: 14, paddingTop: 4, paddingBottom: 24 },
  grid: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.md - 2,
    padding: 10,
    ...shadow.card,
  },
  rowPressable: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowImageWrap: { width: 68, height: 68, borderRadius: radii.sm, overflow: 'hidden', backgroundColor: colors.blueSoft },
  rowImage: { width: '100%', height: '100%' },
  rowBody: { flex: 1 },
  rowName: { fontSize: 13, fontFamily: fontFamily.bodyBold, color: colors.ink, marginBottom: 3, lineHeight: 17 },
  rowUnit: { fontSize: 11, color: colors.inkSoft, marginBottom: 5, fontFamily: fontFamily.body },
  rowPriceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 },
  rowPrice: { fontSize: 14, fontFamily: fontFamily.bodyExtraBold, color: colors.ink },
  rowMrp: { fontSize: 10.5, color: colors.faint, textDecorationLine: 'line-through', fontFamily: fontFamily.body },
  rowDiscount: { fontSize: 10.5, fontFamily: fontFamily.bodyBold, color: '#1E9E4E' },
});
