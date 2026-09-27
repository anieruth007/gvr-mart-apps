import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  /** Stagger index — each step delays the animation a little further behind the previous one. */
  index?: number;
  style?: ViewStyle;
}

// Fades and slides a section in on mount. Kept as a small generic wrapper (rather than baking
// this into each screen) so any section can opt in with one line.
export function FadeInSection({ children, index = 0, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay: index * 90,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
