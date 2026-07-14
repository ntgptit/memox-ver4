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
import { MxIconButton } from '../navigation/MxIconButton';

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
  /** Kit bell slot — an icon button with an unread badge dot (root bars). */
  notification?: { dot?: boolean; onPress?: () => void };
  /** Kit avatar slot — rendered after the bell (root bars). */
  avatar?: ReactNode;
  /** Scrolled state: opaque surface + divider (vs the transparent top state). */
  scrolled?: boolean;
  node?: string;
}

/** Kit `.cappbar__badge--dot`: a 10px error pill pinned at the bell's top-right. */
const BELL_DOT = { size: 10, inset: 7 };

function Bell({ dot = false, onPress }: { dot?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <View>
      <MxIconButton
        icon="notifications"
        size="sm"
        accessibilityLabel={dot ? 'Notifications, unread' : 'Notifications'}
        onPress={onPress}
        node="shell/notifications"
      />
      {dot && (
        <View
          accessibilityElementsHidden
          style={{
            position: 'absolute',
            top: BELL_DOT.inset,
            right: BELL_DOT.inset,
            width: BELL_DOT.size,
            height: BELL_DOT.size,
            borderRadius: t.radius.pill,
            backgroundColor: t.color.error,
          }}
        />
      )}
    </View>
  );
}

export function MxContextualAppBar({
  variant = 'root',
  title,
  context,
  main,
  count,
  leading,
  actions,
  notification,
  avatar,
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
      {(actions !== undefined || notification !== undefined || avatar !== undefined) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
          {actions}
          {notification !== undefined && <Bell dot={notification.dot} onPress={notification.onPress} />}
          {avatar}
        </View>
      )}
    </View>
  );
}
