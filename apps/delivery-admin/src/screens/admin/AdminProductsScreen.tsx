import React, { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { CategoryDto, ProductDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api, ApiError } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';

const EMPTY_FORM = { name: '', categoryId: '', description: '', imageUrl: '', label: '', unit: 'kg', mrp: '', sellingPrice: '', stockQty: '' };

// Used whenever a product has no photo of its own — keeps every card visually complete
// instead of showing a broken image or blank tile.
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=70&auto=format';

export function AdminProductsScreen() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get<ProductDto[]>('/products').then(setProducts);
    api.get<CategoryDto[]>('/categories').then((cats) => {
      setCategories(cats);
      setForm((f) => ({ ...f, categoryId: f.categoryId || cats[0]?.id || '' }));
    });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const update = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach your own product photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setForm((f) => ({ ...f, imageUrl: result.assets[0].uri }));
    }
  };

  const submit = async () => {
    setError(null);
    if (!form.name || !form.categoryId || !form.label || !form.mrp || !form.sellingPrice) {
      setError('Please fill in the product name, category, variant label, and prices');
      return;
    }
    setBusy(true);
    try {
      await api.post('/products', {
        name: form.name,
        categoryId: form.categoryId,
        description: form.description || undefined,
        // Falls back to a generic stock photo when the seller hasn't supplied their own —
        // real packaging/product photos always take priority when provided.
        imageUrl: form.imageUrl || PLACEHOLDER_IMAGE,
        variants: [
          {
            label: form.label,
            unit: form.unit,
            mrp: Number(form.mrp),
            sellingPrice: Number(form.sellingPrice),
            stockQty: Number(form.stockQty) || 0,
          },
        ],
      });
      setForm({ ...EMPTY_FORM, categoryId: form.categoryId });
      setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not create product');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={typography.h1}>Products</Text>
        <TouchableOpacity onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.toggle}>{showForm ? 'Cancel' : '+ Add Product'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Product photo</Text>
          <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto}>
            {form.imageUrl ? (
              <Image source={{ uri: form.imageUrl }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={26} color={colors.blueDeep} />
                <Text style={styles.photoPlaceholderText}>Add your own photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>
            {form.imageUrl ? 'Using your uploaded photo.' : "No photo yet — a stock photo will be used until you add one."}
          </Text>

          <Field label="Product name" value={form.name} onChangeText={update('name')} />
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.catRow}>
            {categories.map((c) => (
              <TouchableOpacity key={c.id} onPress={() => setForm((f) => ({ ...f, categoryId: c.id }))} style={[styles.catChip, form.categoryId === c.id && styles.catChipActive]}>
                <Text style={[styles.catChipText, form.categoryId === c.id && styles.catChipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Field label="Description (optional)" value={form.description} onChangeText={update('description')} />
          <View style={styles.row}>
            <Field label="Variant label" value={form.label} onChangeText={update('label')} placeholder="1 kg" style={{ flex: 1 }} />
            <Field label="Unit" value={form.unit} onChangeText={update('unit')} style={{ flex: 1 }} />
          </View>
          <View style={styles.row}>
            <Field label="MRP" value={form.mrp} onChangeText={update('mrp')} keyboardType="numeric" style={{ flex: 1 }} />
            <Field label="Selling price" value={form.sellingPrice} onChangeText={update('sellingPrice')} keyboardType="numeric" style={{ flex: 1 }} />
            <Field label="Stock" value={form.stockQty} onChangeText={update('stockQty')} keyboardType="numeric" style={{ flex: 1 }} />
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          <Button label="Create Product" onPress={submit} loading={busy} />
        </View>
      )}

      {products.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={styles.cardRow}>
            <Image source={{ uri: p.imageUrl || PLACEHOLDER_IMAGE }} style={styles.cardImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.name}</Text>
              {p.variants.map((v) => (
                <View key={v.id} style={styles.variantRow}>
                  <Text style={styles.variantLabel}>{v.label}</Text>
                  <Text style={styles.variantPrice}>₹{v.sellingPrice}</Text>
                  <Text style={[styles.stock, v.stockQty === 0 && { color: colors.tomato }]}>{v.stockQty} in stock</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}

function Field({ label, style, ...props }: any) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...props} placeholderTextColor={colors.muted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  toggle: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.blueDeep },
  form: { backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginBottom: 20, ...shadow.card },
  fieldLabel: { fontFamily: fontFamily.bodyBold, fontSize: 10.5, color: colors.inkSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: colors.cream, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fontFamily.body, fontSize: 13, color: colors.ink, borderWidth: 1, borderColor: colors.border },
  photoPicker: { marginBottom: 6 },
  photoPreview: { width: 96, height: 96, borderRadius: radii.sm, backgroundColor: colors.blueSoft },
  photoPlaceholder: { width: 96, height: 96, borderRadius: radii.sm, backgroundColor: colors.cream, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoPlaceholderText: { fontFamily: fontFamily.bodyMedium, fontSize: 9.5, color: colors.inkSoft, textAlign: 'center', paddingHorizontal: 6 },
  photoHint: { fontFamily: fontFamily.body, fontSize: 10.5, color: colors.inkSoft, marginBottom: 14 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  catChipActive: { backgroundColor: colors.blueSoft, borderColor: colors.blue },
  catChipText: { fontFamily: fontFamily.bodyMedium, fontSize: 11.5, color: colors.inkSoft },
  catChipTextActive: { color: colors.blueDeep, fontFamily: fontFamily.bodyBold },
  row: { flexDirection: 'row', gap: 10 },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginBottom: 10 },
  card: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 10, ...shadow.card },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardImage: { width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.blueSoft },
  name: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink, marginBottom: 8 },
  variantRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  variantLabel: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, flex: 1 },
  variantPrice: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.blueDeep, marginRight: 10 },
  stock: { fontFamily: fontFamily.bodyMedium, fontSize: 11, color: colors.blue },
});
