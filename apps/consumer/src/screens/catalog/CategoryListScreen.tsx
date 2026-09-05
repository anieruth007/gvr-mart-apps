import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CategoryDto, ProductDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
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
          <View style={styles.sortRow}>
            {(['default', 'price_asc', 'price_desc'] as const).map((mode) => (
              <TouchableOpacity key={mode} onPress={() => setSort(mode)} style={[styles.sortChip, sort === mode && styles.sortChipActive]}>
                <Text style={[styles.sortChipText, sort === mode && styles.sortChipTextActive]}>
                  {mode === 'default' ? 'Sort' : mode === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low'}
                </Text>
                {mode === 'default' && <Ionicons name="chevron-down" size={12} color={colors.inkSoft} />}
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridScroll}>
            {sortedProducts.length === 0 ? (
              <EmptyState icon="leaf-outline" message="No products match your search yet." />
            ) : (
              <View style={styles.grid}>
                {sortedProducts.map((product) => {
                  const variantId = product.variants[0]?.id;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      style={styles.gridCard}
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
  sortRow: { flexDirection: 'row', gap: 8, padding: 14, paddingBottom: 10 },
  sortChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  sortChipActive: { backgroundColor: colors.blueSoft, borderColor: colors.blue },
  sortChipText: { fontFamily: fontFamily.bodyMedium, fontSize: 11, color: colors.inkSoft },
  sortChipTextActive: { color: colors.blueDeep, fontFamily: fontFamily.bodyBold },
  gridScroll: { padding: 14, paddingTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: '48%' },
});
