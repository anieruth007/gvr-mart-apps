import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '@gvr-mart/theme';

interface Props {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  message: string;
}

export function EmptyState({ icon, message }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={30} color={colors.blue} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  message: { fontSize: 13, color: colors.inkSoft, textAlign: 'center', fontFamily: fontFamily.body, lineHeight: 19 },
});
