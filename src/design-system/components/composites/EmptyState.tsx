/**
 * EmptyState — shared composite, ported from the kit's `kit-helpers.jsx`
 * `EmptyState` (`window.EmptyState`): a centered lg icon tile, extrabold title,
 * secondary body copy capped at a readable measure, and an optional action.
 */

import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import type { IconName } from '../../icons';
import { MxIconTile, type MxIconTileTone } from '../surfaces/MxIconTile';

export interface EmptyStateProps {
  icon: IconName | string;
  tone?: MxIconTileTone;
  title: string;
  text?: string;
  /** Widen the copy column (+20) to match kit shots that wrap wider than 220. */
  wide?: boolean;
  /** Stretch the action row so a kit `block` button spans the content width. */
  blockAction?: boolean;
  action?: ReactNode;
  node?: string;
}

export function EmptyState({ icon, tone, title, text, wide = false, blockAction = false, action, node }: EmptyStateProps) {
  const t = useTheme();

  return (
    <View
      testID={node}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space[4],
        paddingVertical: t.space[7],
        paddingHorizontal: t.space[4],
      }}
    >
      <MxIconTile icon={icon} tone={tone} size="lg" />
      {/* Kit declares max-width 220. Some kit SHOTS wrap their body copy slightly
          wider than the app's font metrics allow at 220 — `wide` (+20) makes those
          screens break lines where their frozen references do (rendered contract
          over declared CSS); everything else keeps the kit's 220. */}
      <View
        style={{ gap: t.space[2], maxWidth: wide ? t.size['3xl'] + t.space[5] : t.size['3xl'], alignItems: 'center' }}
      >
        <Text
          accessibilityRole="header"
          style={[
            t.font.text({ size: 'lg', weight: 'extrabold', letterSpacing: 'tight' }),
            { color: t.color.text, textAlign: 'center' },
          ]}
        >
          {title}
        </Text>
        {text !== undefined && (
          <Text
            style={[
              t.font.text({ size: 'base', lineHeight: 'normal' }),
              { color: t.color.textSecondary, textAlign: 'center' },
            ]}
          >
            {text}
          </Text>
        )}
      </View>
      {/* Hug + center the action: a non-block MxButton pins itself flex-start, so it
          needs a self-centering wrapper to sit centered like the kit's inline-flex. */}
      {action !== undefined && (
        <View style={blockAction ? { alignSelf: 'stretch' } : { alignSelf: 'center', alignItems: 'center' }}>
          {action}
        </View>
      )}
    </View>
  );
}
