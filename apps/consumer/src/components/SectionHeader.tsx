import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, typography } from '@gvr-mart/theme';

interface Props {
  eyebrow: string;
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ eyebrow, title, action }: Props) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={typography.eyebrow}>{eyebrow}</Text>
        <Text style={typography.h2}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={styles.action}>{action.label} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  action: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12.5,
    color: colors.greenDeep,
  },
});
