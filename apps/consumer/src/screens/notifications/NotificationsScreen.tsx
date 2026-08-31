import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NotificationDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';

const TYPE_ICON: Record<string, string> = { ORDER: '📦', BULK: '📋', PROMO: '🎁', SYSTEM: '🔔' };

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  const load = useCallback(() => {
    api.get<NotificationDto[]>('/notifications').then(setNotifications);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>Notifications</Text>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" message="You're all caught up." />
      ) : (
        notifications.map((n) => (
          <TouchableOpacity key={n.id} style={[styles.card, !n.isRead && styles.cardUnread]} onPress={() => !n.isRead && markRead(n.id)}>
            <Text style={styles.icon}>{TYPE_ICON[n.type] ?? '🔔'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.body}>{n.body}</Text>
            </View>
            {!n.isRead && <View style={styles.dot} />}
          </TouchableOpacity>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 10, alignItems: 'flex-start', ...shadow.card },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: colors.mango },
  icon: { fontSize: 20 },
  title: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.ink, marginBottom: 3 },
  body: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft, lineHeight: 17 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tomato, marginTop: 4 },
});
