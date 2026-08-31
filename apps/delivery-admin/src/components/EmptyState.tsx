import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '@gvr-mart/theme';

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  icon: { fontSize: 40, marginBottom: 12 },
  message: { fontSize: 13, color: colors.inkSoft, textAlign: 'center', fontFamily: fontFamily.body, lineHeight: 19 },
});
