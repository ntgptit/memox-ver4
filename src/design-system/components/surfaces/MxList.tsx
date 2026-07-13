/**
 * MxList (WBS 1.5) — the canonical vertical stack for any list of cards
 * (decks/subdecks/cards/results). Flex column with a token gap (default `space-3`
 * = 12px); screens wrap card lists in this rather than dropping items into the
 * 24px section-gap scroll body (ADR 0004 / kit).
 */

import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import type { SpaceStep } from '../../tokens';

export interface MxListProps {
  children?: ReactNode;
  /** Item gap token (default `3` = 12px). */
  gap?: SpaceStep;
  node?: string;
  style?: StyleProp<ViewStyle>;
}

export function MxList({ children, gap = 3, node, style }: MxListProps) {
  const t = useTheme();
  return (
    <View testID={node} style={[{ flexDirection: 'column', gap: t.space[gap] }, style]}>
      {children}
    </View>
  );
}
