import React, { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';

interface Customer {
  id: string;
  phone: string;
  isActive: boolean;
  customerProfile?: { name?: string | null };
  _count: { orders: number; bulkEnquiries: number };
}

export function AdminCustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const load = useCallback(() => {
    api.get<Customer[]>('/admin/customers').then(setCustomers);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/admin/customers/${id}/status`, { isActive });
    load();
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>Customers</Text>

      {customers.length === 0 ? (
        <EmptyState icon="👥" message="No customers yet." />
      ) : (
        customers.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.customerProfile?.name ?? c.phone}</Text>
              <Text style={styles.meta}>{c.phone} · {c._count.orders} orders · {c._count.bulkEnquiries} bulk enquiries</Text>
            </View>
            <Switch value={c.isActive} onValueChange={(v) => toggleActive(c.id, v)} trackColor={{ true: colors.green, false: colors.border }} />
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 10, ...shadow.card },
  name: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink, marginBottom: 3 },
  meta: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.inkSoft },
});
