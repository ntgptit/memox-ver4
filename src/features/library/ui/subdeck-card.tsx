/**
 * SubdeckCard (kit `_features/library/components/SubdeckCard.jsx`) — a subdeck row.
 * A subdeck IS a deck one level down, so it renders with the SAME shared DeckCard
 * anatomy as a top-level deck (icon tile · semibold title · "N cards · status" meta ·
 * quick-study trailing). Shared by the Library search results and the Subdeck List.
 */

import { Text } from 'react-native';

import { DeckCard, MxIconButton, useTheme } from '@/design-system';

import { deckStatus } from './library-fixtures';

export interface SubdeckCardProps {
  subdeck: {
    readonly id: string;
    readonly icon: string;
    readonly name: string;
    readonly cards: number;
    readonly due?: number;
    readonly newCards?: number;
  };
  index: number | string;
  nodePrefix?: string;
  selected?: boolean;
  /** Custom meta line (e.g. search results show "in <parent deck> · N cards"). */
  meta?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onStudy?: () => void;
}

export function SubdeckCard({
  subdeck: s,
  index,
  nodePrefix = 'library',
  selected,
  meta,
  onPress,
  onLongPress,
  onStudy,
}: SubdeckCardProps) {
  const t = useTheme();
  const status = deckStatus({ due: s.due, newCards: s.newCards });
  const statusColor =
    status.tone === 'warning' ? t.color.onWarningSoft : status.tone === 'accent' ? t.color.accent : t.color.onSuccessSoft;
  const body =
    meta !== undefined ? (
      meta
    ) : (
      <Text>
        {s.cards.toLocaleString('en-US')} cards ·{' '}
        <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: statusColor }]}>{status.label}</Text>
      </Text>
    );

  return (
    <DeckCard
      icon={s.icon || 'style'}
      tone="accent"
      titleWeight="semibold"
      title={s.name}
      meta={body}
      selected={selected}
      onPress={onPress}
      onLongPress={onLongPress}
      trailing={
        <MxIconButton
          icon="bolt"
          size="sm"
          accessibilityLabel={`Study ${s.name}`}
          onPress={onStudy}
          node={`${nodePrefix}/sub-study-${index}`}
        />
      }
      node={`${nodePrefix}/subdeck-${index}`}
    />
  );
}
