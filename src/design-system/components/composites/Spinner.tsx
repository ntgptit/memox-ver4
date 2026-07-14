/**
 * Spinner — shared composite, ported from the kit's `.spinner` (components.css):
 * a semantic indeterminate loading ring (icon-size-md box, divider ring with an
 * accent top arc, 0.8s rotation). A captured frame still reads as loading.
 */

import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { useTheme } from '../../theme';

export interface SpinnerProps {
  accessibilityLabel?: string;
  node?: string;
}

export function Spinner({ accessibilityLabel, node }: SpinnerProps) {
  const t = useTheme();
  // Lazily-initialized stable Animated.Value (not a ref — read during render).
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  return (
    <Animated.View
      testID={node}
      accessibilityLabel={accessibilityLabel}
      style={{
        width: t.iconSize.md,
        height: t.iconSize.md,
        borderWidth: t.stroke.emphasis,
        borderColor: t.color.divider,
        borderTopColor: t.color.accent,
        borderRadius: t.radius.pill,
        transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
      }}
    />
  );
}
