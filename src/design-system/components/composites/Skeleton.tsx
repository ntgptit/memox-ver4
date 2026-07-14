/**
 * Skeleton — shared composite, ported from the kit's `kit-helpers.jsx` `Skeleton`
 * (`.mxg-skel`): a sunken-surface placeholder block for loading states. Static (no
 * shimmer) so golden shots stay deterministic.
 */

import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';

export interface SkeletonProps {
  w?: DimensionValue;
  h?: number;
  r?: number;
  node?: string;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ w = '100%', h = 16, r = 8, node, style }: SkeletonProps) {
  const t = useTheme();
  return (
    <View
      testID={node}
      style={[{ width: w, height: h, borderRadius: r, backgroundColor: t.color.surfaceSunken }, style]}
    />
  );
}
