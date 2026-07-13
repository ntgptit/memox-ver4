/**
 * MxContextualAppBar (WBS 1.5) — base class `cappbar` (ADR 0004). A single compact
 * (56px) bar: leading slot · main (context + title) · actions slot. `scrolled`
 * switches from the transparent top state to a surface + divider. `variant` tunes
 * the layout (modal centers the title).
 */

import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';

export type MxAppBarVariant = 'root' | 'nested' | 'search' | 'selection' | 'modal';

export interface MxContextualAppBarProps {
  variant?: MxAppBarVariant;
  /** The screen heading (20/semibold). */
  title?: string;
  /** A smaller context line above the title (e.g. a breadcrumb). */
  context?: string;
  leading?: ReactNode;
  actions?: ReactNode;
  /** Scrolled state: opaque surface + divider (vs the transparent top state). */
  scrolled?: boolean;
  node?: string;
}

export function MxContextualAppBar({
  variant = 'root',
  title,
  context,
  leading,
  actions,
  scrolled = false,
  node,
}: MxContextualAppBarProps) {
  const t = useTheme();

  return (
    <View
      testID={node}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        minHeight: t.layout.appBarHeight,
        paddingHorizontal: t.layout.gutter,
        backgroundColor: scrolled ? t.color.surface : 'transparent',
        borderBottomWidth: t.stroke.hairline,
        borderBottomColor: scrolled ? t.color.divider : 'transparent',
      }}
    >
      {leading !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>{leading}</View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        {context !== undefined && (
          <Text numberOfLines={1} style={[t.font.text({ size: 'base', weight: 'medium' }), { color: t.color.textSecondary }]}>
            {context}
          </Text>
        )}
        {title !== undefined && (
          <Text
            numberOfLines={1}
            style={[
              t.font.text({ size: 'lg', weight: 'semibold', letterSpacing: 'tight' }),
              { color: t.color.text, textAlign: variant === 'modal' ? 'center' : 'left' },
            ]}
          >
            {title}
          </Text>
        )}
      </View>
      {actions !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>{actions}</View>
      )}
    </View>
  );
}
