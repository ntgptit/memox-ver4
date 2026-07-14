/**
 * ProgressBar — shared composite, ported from the kit's `kit-helpers.jsx`
 * `ProgressBar` (`window.ProgressBar`): a pill track (border colour) with a
 * primary (or `tone`-coloured) fill at `value`%. Dashboard goal card uses
 * height 10, deck-card progress uses 6, the default is the kit's 8.
 */

import { View } from 'react-native';

import { useTheme } from '../../theme';

export interface ProgressBarProps {
  /** Progress in percent, clamped to [0, 100]. */
  value: number;
  /** Fill colour override (defaults to the primary colour). */
  tone?: string;
  height?: number;
  accessibilityLabel?: string;
  node?: string;
}

export function ProgressBar({ value, tone, height = 8, accessibilityLabel, node }: ProgressBarProps) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(100, value));

  return (
    <View
      testID={node}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={{ height, borderRadius: t.radius.pill, backgroundColor: t.color.border, overflow: 'hidden' }}
    >
      <View
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: t.radius.pill,
          backgroundColor: tone ?? t.color.primary,
        }}
      />
    </View>
  );
}
