import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { AddressDto } from '@gvr-mart/shared-types';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { api } from '../../api/client';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';

export function AddressListScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);

  const load = useCallback(() => {
    api.get<AddressDto[]>('/users/me/addresses').then(setAddresses);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: 18 }]}>Saved Addresses</Text>

      {addresses.length === 0 ? (
        <EmptyState icon="location-outline" message="No addresses saved yet." />
      ) : (
        addresses.map((addr) => (
          <View key={addr.id} style={styles.card}>
            <View style={styles.rowTop}>
              <Text style={styles.label}>{addr.label}</Text>
              {addr.isDefault && (
                <View style={styles.defaultPill}>
                  <Text style={styles.defaultPillText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.line}>
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
            </Text>
          </View>
        ))
      )}

      <Button label="+ Add New Address" variant="ghost" onPress={() => navigation.navigate('AddAddress')} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radii.md - 2, padding: 14, marginBottom: 12, ...shadow.card },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontFamily: fontFamily.bodyBold, fontSize: 13.5, color: colors.ink },
  defaultPill: { backgroundColor: colors.blueSoft, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  defaultPillText: { fontFamily: fontFamily.bodyBold, fontSize: 10, color: colors.blueDeep },
  line: { fontFamily: fontFamily.body, fontSize: 12, color: colors.inkSoft },
});
