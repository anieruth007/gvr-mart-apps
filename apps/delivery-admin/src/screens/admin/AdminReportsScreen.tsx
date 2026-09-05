import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';

interface SalesReport { totalOrders: number; totalRevenue: number; averageOrderValue: number; completedOrders: number; cancelledOrders: number; }
interface ProductPerf { product?: { name: string }; unitsSold: number; revenue: number; }
interface InventoryRow { product: string; variant: string; stockQty: number; lowStock: boolean; }
interface BulkConversion { totalEnquiries: number; quoted: number; accepted: number; converted: number; rejected: number; conversionRate: number; averageBulkOrderValue: number; }

export function AdminReportsScreen() {
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [products, setProducts] = useState<ProductPerf[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [bulk, setBulk] = useState<BulkConversion | null>(null);

  useFocusEffect(
    useCallback(() => {
      api.get<SalesReport>('/reports/sales').then(setSales);
      api.get<ProductPerf[]>('/reports/products').then(setProducts);
      api.get<InventoryRow[]>('/reports/inventory').then(setInventory);
      api.get<BulkConversion>('/reports/bulk-conversion').then(setBulk);
    }, []),
  );

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>Reports</Text>

      <Text style={styles.sectionLabel}>Sales Overview</Text>
      <View style={styles.grid}>
        <Tile label="Total revenue" value={`₹${sales?.totalRevenue ?? 0}`} />
        <Tile label="Total orders" value={`${sales?.totalOrders ?? 0}`} />
        <Tile label="Avg order value" value={`₹${(sales?.averageOrderValue ?? 0).toFixed(0)}`} />
        <Tile label="Cancelled" value={`${sales?.cancelledOrders ?? 0}`} />
      </View>

      <Text style={styles.sectionLabel}>Top Products</Text>
      {products.slice(0, 5).map((p, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.rowLabel}>{p.product?.name ?? 'Unknown'}</Text>
          <Text style={styles.rowValue}>{p.unitsSold} sold · ₹{p.revenue}</Text>
        </View>
      ))}

      <Text style={styles.sectionLabel}>Inventory</Text>
      {inventory.filter((i) => i.lowStock).length === 0 ? (
        <Text style={styles.okNote}>No low-stock items right now.</Text>
      ) : (
        inventory.filter((i) => i.lowStock).map((i, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.rowLabel}>{i.product} · {i.variant}</Text>
            <Text style={[styles.rowValue, { color: colors.tomato }]}>{i.stockQty} left</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionLabel}>Bulk Conversion</Text>
      <View style={styles.grid}>
        <Tile label="Total enquiries" value={`${bulk?.totalEnquiries ?? 0}`} />
        <Tile label="Converted" value={`${bulk?.converted ?? 0}`} />
        <Tile label="Conversion rate" value={`${((bulk?.conversionRate ?? 0) * 100).toFixed(0)}%`} />
        <Tile label="Avg bulk order" value={`₹${(bulk?.averageBulkOrderValue ?? 0).toFixed(0)}`} />
      </View>
    </ScreenContainer>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 12, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, ...shadow.card },
  tileValue: { fontFamily: fontFamily.bodyExtraBold, fontSize: 17, color: colors.blueDeep, marginBottom: 4 },
  tileLabel: { fontFamily: fontFamily.body, fontSize: 11, color: colors.inkSoft },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radii.sm, padding: 12, marginBottom: 8, ...shadow.card },
  rowLabel: { fontFamily: fontFamily.bodyMedium, fontSize: 12.5, color: colors.ink, flex: 1 },
  rowValue: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.blueDeep },
  okNote: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft, fontStyle: 'italic' },
});
