import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, shadow, fontFamily } from '@gvr-mart/theme';

interface Props {
  emoji: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}

export function CategoryChip({ emoji, label, active, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.wrap} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.icon, active && styles.iconActive]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 74, alignItems: 'center', gap: 8 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.card,
  },
  iconActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  emoji: { fontSize: 28 },
  label: { fontSize: 11.5, fontFamily: fontFamily.bodyBold, color: colors.inkSoft, textAlign: 'center' },
  labelActive: { color: colors.greenDeep },
});
