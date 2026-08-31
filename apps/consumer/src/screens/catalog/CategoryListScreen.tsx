import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { CategoryDto, ProductDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';

const CATEGORY_ICONS: Record<string, string> = {
  Fruits: '🍎',
  Vegetables: '🥦',
  'Leafy Greens': '🥬',
  Exotic: '🥝',
  'Dry Fruits': '🥜',
};

export function CategoryListScreen({ navigation, route }: any) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(route?.params?.categoryId ?? null);
  const [search, setSearch] = useState('');
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

  return (
    <ScreenContainer padded={false}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <Text>🔍</Text>
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
        <View style={styles.catRow}>
          <CategoryChip emoji="🧺" label="All" active={!activeCategory} onPress={() => setActiveCategory(null)} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              emoji={c.emoji ?? CATEGORY_ICONS[c.name] ?? '🧺'}
              label={c.name}
              active={activeCategory === c.id}
              onPress={() => setActiveCategory(c.id)}
            />
          ))}
        </View>

        {products.length === 0 ? (
          <EmptyState icon="🥬" message="No products match your search yet." />
        ) : (
          <View style={styles.grid}>
            {products.map((product) => {
              const variantId = product.variants[0]?.id;
              return (
                <ProductCard
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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 18, paddingBottom: 4 },
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
  searchInput: { flex: 1, fontFamily: fontFamily.body, fontSize: 14, color: colors.ink },
  body: { padding: 18, paddingTop: 14 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
});
