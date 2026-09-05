import React, { useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '@gvr-mart/theme';

interface Props {
  slides: React.ReactNode[];
  height?: number;
  /** Horizontal space already consumed outside the carousel (e.g. screen padding on both sides). */
  horizontalInset?: number;
}

export function BannerCarousel({ slides, height = 220, horizontalInset = 36 }: Props) {
  const [index, setIndex] = useState(0);
  const width = Dimensions.get('window').width - horizontalInset;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(slides.length - 1, i)));
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={{ borderRadius: 22 }}
      >
        {slides.map((slide, i) => (
          <View key={i} style={{ width, height }}>
            {slide}
          </View>
        ))}
      </ScrollView>
      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.blue, width: 18 },
});
