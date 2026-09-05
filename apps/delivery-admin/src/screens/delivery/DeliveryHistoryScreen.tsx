import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';

interface HistoryEntry {
  id: string;
  earning: string;
  deliveredAt: string;
  order: { orderNumber: string; total: string };
}

interface Earnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalCompleted: number;
  lifetimeEarnings: number;
}

export function DeliveryHistoryScreen() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);

  useFocusEffect(
    useCallback(() => {
      api.get<HistoryEntry[]>('/delivery/history').then(setHistory);
      api.get<Earnings>('/delivery/earnings').then(setEarnings);
    }, []),
  );

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>Earnings & History</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>₹{earnings?.lifetimeEarnings ?? 0}</Text>
        <Text style={styles.summaryLabel}>Lifetime earnings · {earnings?.totalCompleted ?? 0} deliveries completed</Text>
      </View>

      <Text style={styles.sectionLabel}>Completed Deliveries</Text>
      {history.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" message="No completed deliveries yet." />
      ) : (
        history.map((h) => (
          <View key={h.id} style={styles.row}>
            <View>
              <Text style={styles.orderNumber}>#{h.order.orderNumber}</Text>
              <Text style={styles.date}>{new Date(h.deliveredAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.earning}>+₹{h.earning}</Text>
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: colors.blueDeep, borderRadius: radii.lg, padding: 20, marginBottom: 22, alignItems: 'center' },
  summaryValue: { color: colors.white, fontFamily: fontFamily.headingBold, fontSize: 30, marginBottom: 6 },
  summaryLabel: { color: 'rgba(255,255,255,0.75)', fontFamily: fontFamily.body, fontSize: 12 },
  sectionLabel: { fontSize: 12, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 10, ...shadow.card },
  orderNumber: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink },
  date: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  earning: { fontFamily: fontFamily.bodyExtraBold, fontSize: 14, color: colors.blue },
});
