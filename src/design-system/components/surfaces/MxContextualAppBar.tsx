/**
 * MxContextualAppBar (WBS 1.5 / states 2.2) — base class `cappbar` (ADR 0004). A
 * single compact (56px) bar: leading slot · main · actions slot. `scrolled` switches
 * the transparent top state to a surface + divider. `variant` selects the state:
 *   - root     — screen heading; transparent at top, elevates on scroll.
 *   - nested   — a back leading + title (+ context breadcrumb); overflow via `actions`.
 *   - search   — a `main` slot holding a search dock (title/context ignored).
 *   - selection — selection mode: tinted bar, `count` → "N selected".
 *   - modal    — centered title between a close leading and a confirm action.
 * Titles truncate to one line (ellipsis) so long headings never clip meaning.
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
  /** Custom main content (e.g. a search dock for the `search` variant); replaces title/context. */
  main?: ReactNode;
  /** Selection count for the `selection` variant → renders "N selected". */
  count?: number;
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
  main,
  count,
  leading,
  actions,
  scrolled = false,
  node,
}: MxContextualAppBarProps) {
  const t = useTheme();

  const selectionMode = variant === 'selection';
  const elevated = scrolled || selectionMode;
  const backgroundColor = selectionMode
    ? t.color.surfaceMuted
    : scrolled
      ? t.color.surface
      : 'transparent';
  const heading = selectionMode && count !== undefined ? `${count} selected` : title;

  return (
    <View
      testID={node}
      accessibilityRole="header"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        minHeight: t.layout.appBarHeight,
        paddingHorizontal: t.layout.gutter,
        backgroundColor,
        borderBottomWidth: t.stroke.hairline,
        borderBottomColor: elevated ? t.color.divider : 'transparent',
      }}
    >
      {leading !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>{leading}</View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        {main !== undefined ? (
          main
        ) : (
          <>
            {context !== undefined && (
              <Text
                numberOfLines={1}
                style={[t.font.text({ size: 'base', weight: 'medium' }), { color: t.color.textSecondary }]}
              >
                {context}
              </Text>
            )}
            {heading !== undefined && (
              <Text
                numberOfLines={1}
                style={[
                  t.font.text({ size: 'lg', weight: 'semibold', letterSpacing: 'tight' }),
                  { color: t.color.text, textAlign: variant === 'modal' ? 'center' : 'left' },
                ]}
              >
                {heading}
              </Text>
            )}
          </>
        )}
      </View>
      {actions !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>{actions}</View>
      )}
    </View>
  );
}
