/**
 * DeckCard — shared composite, ported from the kit's `_shared/DeckCard.jsx`: THE one
 * deck/subdeck list card shared across Dashboard, Library and search, so anatomy +
 * spacing never drift between screens.
 *
 * Anatomy: [ visual ] [ title / meta ] [ trailing ].
 * - visual: an MxIconTile (icon+tone), or — in selection mode (`selected` non-null) —
 *   a check_circle / radio_button_unchecked indicator.
 * - trailing: any node (a due badge, a quick-study icon button…). Hidden in selection.
 */

import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../theme';
import { Icon, type IconName } from '../../icons';
import { MxCard } from '../surfaces/MxCard';
import { MxIconTile, type MxIconTileTone } from '../surfaces/MxIconTile';

export interface DeckCardProps {
  icon?: IconName | string;
  tone?: MxIconTileTone;
  title: string;
  /** Title weight — subdecks render semibold (kit SubdeckCard), decks bold. */
  titleWeight?: 'bold' | 'semibold';
  /** Meta line under the title (string or pre-colored Text nodes). */
  meta?: ReactNode;
  /** Selection mode: non-null renders the check/radio visual and hides `trailing`. */
  selected?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
  /** Long-press (e.g. entering selection mode — the M3 convention). */
  onLongPress?: () => void;
  accessibilityLabel?: string;
  node?: string;
}

export function DeckCard({
  icon,
  tone = 'accent',
  title,
  titleWeight = 'bold',
  meta,
  selected,
  trailing,
  onPress,
  onLongPress,
  accessibilityLabel,
  node,
}: DeckCardProps) {
  const t = useTheme();
  const selectionMode = selected !== undefined;

  const visual = selectionMode ? (
    <Icon
      name={selected ? 'check_circle' : 'radio_button_unchecked'}
      size={t.iconSize.lg}
      color={selected ? t.color.accent : t.color.textTertiary}
    />
  ) : (
    <MxIconTile icon={icon ?? 'style'} tone={tone} />
  );

  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4], minWidth: 0 }}>
      {visual}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={2} style={[t.font.text({ size: 'base', weight: titleWeight }), { color: t.color.text }]}>
          {title}
        </Text>
        {meta !== undefined && (
          <Text
            numberOfLines={1}
            style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, marginTop: t.space[1] }]}
          >
            {meta}
          </Text>
        )}
      </View>
      {!selectionMode && trailing ? trailing : null}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        testID={node}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={selectionMode ? { selected } : undefined}
      >
        <MxCard padding="sm" variant={selected ? 'primary-soft' : 'elevated'}>{body}</MxCard>
      </Pressable>
    );
  }
  return (
    <MxCard node={node} padding="sm" variant={selected ? 'primary-soft' : 'elevated'}>
      {body}
    </MxCard>
  );
}
