/**
 * SectionLabel — shared composite, ported from the kit's `kit-helpers.jsx`
 * `SectionLabel` (`window.SectionLabel`): THE component for every small bold
 * (optionally ALL-CAPS) label — no inline copies. `onTint` renders on a colored
 * (primary) card; RN has no `color: inherit`, so it resolves to the on-primary
 * colour at label opacity.
 */

import { Text, type StyleProp, type TextStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';

export interface SectionLabelProps {
  children: ReactNode;
  onTint?: boolean;
  uppercase?: boolean;
  node?: string;
  /** Per-site margin/flex only, per the kit contract. */
  style?: StyleProp<TextStyle>;
}

export function SectionLabel({ children, onTint = false, uppercase = false, node, style }: SectionLabelProps) {
  const t = useTheme();

  return (
    <Text
      testID={node}
      style={[
        t.font.text({ size: 'sm', weight: 'bold', letterSpacing: 'wide' }),
        uppercase && { textTransform: 'uppercase' },
        onTint ? { color: t.color.onPrimary, opacity: t.opacity.label } : { color: t.color.textSecondary },
        { marginTop: t.space[1], marginLeft: t.space[1] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
