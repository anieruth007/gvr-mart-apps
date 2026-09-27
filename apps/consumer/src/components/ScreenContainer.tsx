import React from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@gvr-mart/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Pass an Animated.event handler (from Animated.ScrollView) to drive scroll-linked animations. */
  onScroll?: (...args: any[]) => void;
}

export function ScreenContainer({ children, scroll = true, padded = true, style, refreshing, onRefresh, onScroll }: Props) {
  const inner = padded ? styles.padded : undefined;
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.flex, inner, style]}>{children}</View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.ScrollView
        style={styles.flex}
        contentContainerStyle={[inner, style]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={onScroll ? 16 : undefined}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.blue} />
          ) : undefined
        }
      >
        {children}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  padded: { padding: 18, paddingBottom: 40 },
});
