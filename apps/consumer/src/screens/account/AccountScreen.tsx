import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { icon: '📦', label: 'My Orders', screen: 'OrderHistory' },
  { icon: '📋', label: 'My Bulk Enquiries', screen: 'MyEnquiries' },
  { icon: '📍', label: 'Saved Addresses', screen: 'AddressList' },
  { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
];

export function AccountScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'G'}</Text>
        </View>
        <View>
          <Text style={typography.h3}>{user?.name ?? 'Guest'}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>
      </View>

      {MENU.map((item) => (
        <TouchableOpacity key={item.screen} style={styles.row} onPress={() => navigation.navigate(item.screen)}>
          <View style={styles.rowIcon}>
            <Text style={{ fontSize: 17 }}>{item.icon}</Text>
          </View>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>Preview build · GVR Mart</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blueDeep, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontFamily: fontFamily.headingBold, fontSize: 22 },
  phone: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 10, ...shadow.card },
  rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink },
  chevron: { fontSize: 20, color: colors.faint },
  logout: { marginTop: 16, alignItems: 'center', padding: 14 },
  logoutText: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.tomato },
  footerNote: { textAlign: 'center', fontFamily: fontFamily.body, fontSize: 11, color: colors.muted, marginTop: 20 },
});
