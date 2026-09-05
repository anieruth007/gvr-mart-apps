import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAuth } from '../../context/AuthContext';

interface Dashboard {
  sales: { today: { revenue: number; orderCount: number }; thisWeek: { revenue: number }; thisMonth: { revenue: number } };
  orderPipeline: Record<string, number>;
  inventory: { lowStockCount: number };
  delivery: { totalPartners: number; onlinePartners: number };
  bulk: Record<string, number>;
}

const MENU = [
  { icon: '📦', label: 'Orders', screen: 'AdminOrders' },
  { icon: '🥬', label: 'Products', screen: 'AdminProducts' },
  { icon: '📋', label: 'Bulk Enquiries', screen: 'AdminBulkEnquiries' },
  { icon: '👥', label: 'Customers', screen: 'AdminCustomers' },
  { icon: '🛵', label: 'Delivery Partners', screen: 'AdminDeliveryPartners' },
  { icon: '🏷️', label: 'Coupons', screen: 'AdminCoupons' },
  { icon: '📊', label: 'Reports', screen: 'AdminReports' },
];

export function AdminDashboardScreen({ navigation }: any) {
  const { logout } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);

  useFocusEffect(
    useCallback(() => {
      api.get<Dashboard>('/admin/dashboard').then(setData);
    }, []),
  );

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View>
          <Text style={typography.eyebrow}>GVR Mart</Text>
          <Text style={typography.h1}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiGrid}>
        <KpiTile label="Today's revenue" value={`₹${data?.sales.today.revenue ?? 0}`} />
        <KpiTile label="Today's orders" value={`${data?.sales.today.orderCount ?? 0}`} />
        <KpiTile label="Low stock items" value={`${data?.inventory.lowStockCount ?? 0}`} warn={!!data?.inventory.lowStockCount} />
        <KpiTile label="Partners online" value={`${data?.delivery.onlinePartners ?? 0}/${data?.delivery.totalPartners ?? 0}`} />
      </View>

      <Text style={styles.sectionLabel}>Order Pipeline</Text>
      <View style={styles.pipelineRow}>
        {Object.entries(data?.orderPipeline ?? {}).map(([status, count]) => (
          <View key={status} style={styles.pipelineChip}>
            <Text style={styles.pipelineCount}>{count}</Text>
            <Text style={styles.pipelineLabel}>{status.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Manage</Text>
      <View style={styles.menuGrid}>
        {MENU.map((item) => (
          <TouchableOpacity key={item.screen} style={styles.menuTile} onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}

function KpiTile({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.kpiTile}>
      <Text style={[styles.kpiValue, warn && { color: colors.tomato }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  logout: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.tomato },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  kpiTile: { width: '47%', backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, ...shadow.card },
  kpiValue: { fontFamily: fontFamily.bodyExtraBold, fontSize: 18, color: colors.blueDeep, marginBottom: 4 },
  kpiLabel: { fontFamily: fontFamily.body, fontSize: 11, color: colors.inkSoft },
  sectionLabel: { fontSize: 12, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  pipelineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  pipelineChip: { backgroundColor: colors.blueSoft, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 80 },
  pipelineCount: { fontFamily: fontFamily.bodyExtraBold, fontSize: 15, color: colors.blueDeep },
  pipelineLabel: { fontFamily: fontFamily.bodyMedium, fontSize: 9.5, color: colors.blueDeep, textTransform: 'capitalize' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuTile: { width: '31%', backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, alignItems: 'center', gap: 6, ...shadow.card },
  menuIcon: { fontSize: 22 },
  menuLabel: { fontFamily: fontFamily.bodyBold, fontSize: 10.5, color: colors.ink, textAlign: 'center' },
});
