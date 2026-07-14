/**
 * Ring — shared composite, ported from the kit's `kit-helpers.jsx` `Ring`
 * (`window.Ring`): a percentage arc (kit: conic-gradient over a sunken track)
 * with centered children on a surface disc. Drawn with react-native-svg
 * (DEP-SVG) — a stroked arc over a full track circle, butt caps, from 12
 * o'clock — visually equivalent to the kit's conic fill at the shared frame.
 */

import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';

export interface RingProps {
  /** Filled percent, clamped to [0, 100]. */
  pct: number;
  /** Outer diameter (kit default size-lg). */
  size?: number;
  /** Arc colour (kit default primary). */
  tone?: string;
  /** Ring thickness = the kit's `inset` (space-2 default). */
  inset?: number;
  accessibilityLabel?: string;
  node?: string;
  children?: ReactNode;
}

export function Ring({ pct, size, tone, inset, accessibilityLabel, node, children }: RingProps) {
  const t = useTheme();
  const box = size ?? t.size.lg;
  const thickness = inset ?? t.space[2];
  const clamped = Math.max(0, Math.min(100, pct));
  const r = (box - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View testID={node} accessibilityLabel={accessibilityLabel} style={{ width: box, height: box }}>
      <Svg width={box} height={box}>
        <Circle cx={box / 2} cy={box / 2} r={r} stroke={t.color.surfaceSunken} strokeWidth={thickness} fill="none" />
        <Circle
          cx={box / 2}
          cy={box / 2}
          r={r}
          stroke={tone ?? t.color.primary}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: thickness,
          left: thickness,
          right: thickness,
          bottom: thickness,
          borderRadius: t.radius.pill,
          backgroundColor: t.color.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}
