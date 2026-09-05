import React from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, fontFamily } from '@gvr-mart/theme';

interface Props {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

// Stepper is always nested inside a pressable product card. On react-native-web, a tap here
// bubbles up through the DOM and also fires the card's own onPress (navigate to detail) unless
// explicitly stopped — native's touch-responder negotiation usually isolates this on its own,
// but stopping propagation here makes the behavior correct and explicit on both platforms.
function stop(e: GestureResponderEvent, handler: () => void) {
  e.stopPropagation();
  handler();
}

export function Stepper({ quantity, onIncrement, onDecrement }: Props) {
  if (quantity === 0) {
    return (
      <TouchableOpacity style={styles.addBtn} onPress={(e) => stop(e, onIncrement)} activeOpacity={0.85}>
        <Text style={styles.addBtnLabel}>+</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.stepper}>
      <TouchableOpacity onPress={(e) => stop(e, onDecrement)} hitSlop={8}>
        <Text style={styles.stepperBtn}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepperQty}>{quantity}</Text>
      <TouchableOpacity onPress={(e) => stop(e, onIncrement)} hitSlop={8}>
        <Text style={styles.stepperBtn}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: radii.sm - 1,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 2,
  },
  addBtnLabel: { color: colors.white, fontSize: 17, fontFamily: fontFamily.bodyBold, lineHeight: 19 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.blue,
    borderRadius: radii.sm - 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  stepperBtn: { color: colors.white, fontSize: 16, fontFamily: fontFamily.bodyBold, width: 14, textAlign: 'center' },
  stepperQty: { color: colors.white, fontSize: 12.5, fontFamily: fontFamily.bodyBold, minWidth: 14, textAlign: 'center' },
});
