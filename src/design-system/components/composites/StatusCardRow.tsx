/**
 * StatusCardRow — shared composite, ported from the kit's `_shared/StatusCardRow.jsx`:
 * term + meaning (+ optional deck line) with the single new/due/mastered status badge
 * map shared by the Flashcard List (every card row) and Search results.
 *
 * Layout: a top row pins the term (left, md extrabold) and the badge (right); the
 * meaning flows FULL-WIDTH below. `clampMeaning` renders the collapsible meaning —
 * clamped to N lines with a "Show more" toggle row that is ALWAYS reserved (invisible
 * until the meaning overflows) so every card keeps a uniform height.
 */

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Icon } from '../../icons';
import { MxBadge } from '../core/MxBadge';

export type CardStatus = 'new' | 'due' | 'mastered';

const STATUS: Record<CardStatus, { label: string; tone: 'error' | 'success' | undefined }> = {
  new: { label: 'New', tone: undefined },
  due: { label: 'Due', tone: 'error' },
  mastered: { label: 'Mastered', tone: 'success' },
};

export interface StatusCardRowProps {
  term: string;
  meaning: string;
  /** Optional deck line under the meaning (Search results). */
  deck?: string;
  status: CardStatus;
  hidden?: boolean;
  /** Tighten the term letter-spacing (Flashcard List). */
  tightTerm?: boolean;
  /** Ellipsis-clip the meaning to one line (Search). */
  truncateMeaning?: boolean;
  /** Collapsible meaning clamped to N lines (true → 1) with a Show-more toggle. */
  clampMeaning?: boolean | number;
  node?: string;
}

export function StatusCardRow({
  term,
  meaning,
  deck,
  status,
  hidden = false,
  tightTerm = false,
  truncateMeaning = false,
  clampMeaning,
  node,
}: StatusCardRowProps) {
  const t = useTheme();
  const s = STATUS[status];
  const collapsible = !!clampMeaning && !truncateMeaning;
  const lines = typeof clampMeaning === 'number' ? clampMeaning : 1;
  const [expanded, setExpanded] = useState(false);
  // Deterministic first paint for the golden shots; onTextLayout corrects it live.
  const [overflowing, setOverflowing] = useState(() => collapsible && meaning.length > 48);

  const showToggle = overflowing || expanded;

  return (
    <View testID={node} style={{ opacity: hidden ? t.opacity.half : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}>
        <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
          <Text
            numberOfLines={1}
            style={[
              t.font.text({ size: 'md', weight: 'extrabold', letterSpacing: tightTerm ? 'tight' : 'normal' }),
              { color: t.color.text, flexShrink: 1 },
            ]}
          >
            {term}
          </Text>
          {hidden && <Icon name="visibility_off" size={t.font.size.base} color={t.color.textTertiary} />}
        </View>
        <MxBadge tone={s.tone} soft>
          {s.label}
        </MxBadge>
      </View>
      <Text
        numberOfLines={truncateMeaning ? 1 : collapsible && !expanded ? lines : undefined}
        onTextLayout={(e) => {
          if (collapsible && !expanded) setOverflowing(e.nativeEvent.lines.length >= lines && meaning.length > 48);
        }}
        style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, marginTop: t.space[1] }]}
      >
        {meaning}
      </Text>
      {collapsible && (
        // Always reserve the toggle row so every card keeps a uniform height; it is
        // invisible/inert until the one-line meaning actually overflows (kit .card-more).
        <Pressable
          testID={node ? `${node}-more` : undefined}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less' : 'Show more'}
          accessibilityElementsHidden={!showToggle}
          disabled={!showToggle}
          hitSlop={t.space[3]}
          onPress={() => setExpanded((v) => !v)}
          style={{ marginTop: t.space[1], opacity: showToggle ? 1 : 0 }}
        >
          {/* The kit's .card-more button keeps the browser's compact default line box
              (`normal`, ≈1.3), not the body's 1.5 — `snug` is the token that matches it. */}
          <Text style={[t.font.text({ size: 'sm', weight: 'semibold', lineHeight: 'snug' }), { color: t.color.accent }]}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </Pressable>
      )}
      {deck !== undefined && (
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textTertiary, marginTop: t.space[1] }]}>{deck}</Text>
      )}
    </View>
  );
}
