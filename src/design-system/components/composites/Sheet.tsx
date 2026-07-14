/**
 * Sheet — shared bottom action-sheet surface, ported from the kit's
 * `kit-helpers.jsx` `Sheet` (`window.Sheet`): a grabber handle, an optional
 * ALL-CAPS section-label title, then the caller's rows. Wrap in a
 * `<Scrim align="end">`.
 */

import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';

export interface SheetProps {
  title?: string;
  node?: string;
  children: ReactNode;
}

export function Sheet({ title, node, children }: SheetProps) {
  const t = useTheme();

  return (
    <View
      testID={node}
      style={[
        {
          backgroundColor: t.color.surface,
          borderTopLeftRadius: t.radius['2xl'],
          borderTopRightRadius: t.radius['2xl'],
          paddingTop: t.space[3],
          paddingBottom: t.space[6],
          paddingHorizontal: t.layout.gutter,
          gap: t.space[1],
        },
        t.elevation.nav,
      ]}
    >
      {/* Grabber handle (kit: size-sm × 3xs pill, text-tertiary, centered). */}
      <View
        style={{
          width: t.size.sm,
          height: t.size['3xs'],
          borderRadius: t.radius.pill,
          backgroundColor: t.color.textTertiary,
          alignSelf: 'center',
          marginBottom: t.space[3],
        }}
      />
      {title !== undefined && (
        <Text
          style={[
            // Kit overlays render OUTSIDE `.app`, so this label keeps the browser's
            // compact default line box (~1.2) — `tight` is the token that matches it.
            t.font.text({ size: 'sm', weight: 'bold', letterSpacing: 'wide', lineHeight: 'tight' }),
            { color: t.color.textSecondary, textTransform: 'uppercase', marginBottom: t.space[2], marginLeft: t.space[2] },
          ]}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
