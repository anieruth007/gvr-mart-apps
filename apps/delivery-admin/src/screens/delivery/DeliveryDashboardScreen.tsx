import React, { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAuth } from '../../context/AuthContext';

interface Earnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalCompleted: number;
}

export function DeliveryDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [assignedCount, setAssignedCount] = useState(0);

  const load = useCallback(() => {
    api.get<Earnings>('/delivery/earnings').then(setEarnings);
    api.get<any[]>('/delivery/assigned').then((rows) => setAssignedCount(rows.length));
    api
      .get<{ deliveryPartnerProfile?: { isOnline: boolean } }>('/users/me')
      .then((me) => setIsOnline(!!me.deliveryPartnerProfile?.isOnline));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleOnline = async (value: boolean) => {
    setIsOnline(value);
    await api.patch('/delivery/status', { isOnline: value });
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View>
          <Text style={typography.eyebrow}>Welcome back</Text>
          <Text style={typography.h1}>{user?.name ?? user?.phone}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.onlineCard}>
        <View>
          <Text style={styles.onlineLabel}>{isOnline ? "You're online" : "You're offline"}</Text>
          <Text style={styles.onlineHint}>{isOnline ? 'Ready to receive deliveries' : 'Go online to start receiving orders'}</Text>
        </View>
        <Switch value={isOnline} onValueChange={toggleOnline} trackColor={{ true: colors.green, false: colors.border }} />
      </View>

      <TouchableOpacity style={styles.assignedCard} onPress={() => navigation.navigate('AssignedDeliveries')}>
        <View>
          <Text style={styles.assignedLabel}>Assigned Deliveries</Text>
          <Text style={styles.assignedCount}>{assignedCount} active</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Earnings</Text>
      <View style={styles.earningsGrid}>
        <EarningTile label="Today" value={earnings?.today ?? 0} />
        <EarningTile label="This Week" value={earnings?.thisWeek ?? 0} />
        <EarningTile label="This Month" value={earnings?.thisMonth ?? 0} />
      </View>

      <TouchableOpacity style={styles.historyLink} onPress={() => navigation.navigate('DeliveryHistory')}>
        <Text style={styles.historyLinkText}>View delivery history & full earnings →</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

function EarningTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.earningTile}>
      <Text style={styles.earningValue}>₹{value}</Text>
      <Text style={styles.earningLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  logout: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.tomato },
  onlineCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.greenDeep, borderRadius: radii.lg, padding: 18, marginBottom: 16 },
  onlineLabel: { color: colors.white, fontFamily: fontFamily.headingSemibold, fontSize: 16, marginBottom: 4 },
  onlineHint: { color: 'rgba(255,255,255,0.7)', fontFamily: fontFamily.body, fontSize: 11.5, maxWidth: 200 },
  assignedCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.md, padding: 16, marginBottom: 20, ...shadow.card },
  assignedLabel: { fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.ink },
  assignedCount: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.faint },
  sectionLabel: { fontSize: 12, fontFamily: fontFamily.bodyExtraBold, color: colors.inkSoft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  earningsGrid: { flexDirection: 'row', gap: 10 },
  earningTile: { flex: 1, backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, alignItems: 'center', ...shadow.card },
  earningValue: { fontFamily: fontFamily.bodyExtraBold, fontSize: 17, color: colors.greenDeep, marginBottom: 4 },
  earningLabel: { fontFamily: fontFamily.body, fontSize: 10.5, color: colors.inkSoft },
  historyLink: { marginTop: 18, alignItems: 'center', padding: 12 },
  historyLinkText: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.greenDeep },
});
