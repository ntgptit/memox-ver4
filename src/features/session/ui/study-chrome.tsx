/**
 * Shared study-mode chrome (WBS 6.x/7.x). The pieces every study-mode screen composes,
 * each a 1:1 port of its kit counterpart (kit-helpers.jsx + _shared/StudyPromptCard.jsx):
 * ProgressHeader, StudyPromptCard, FeedbackNote (kit `Note`), RoundComplete (kit
 * `EmptyState` complete panel), and ChoiceOption. Kept here so recall/guess/fill/match
 * never drift.
 */

import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { MxCard, MxButton, MxIconButton, EmptyState, Icon, useTheme, type Theme } from '@/design-system';

export function ProgressHeader({ done, total, node }: { done: number; total: number; node: string }) {
  const t = useTheme();
  const pct = total > 0 ? Math.min(1, done / total) : 0;
  // Kit ProgressHeader (kit-helpers.jsx): ONE row — an 8px bar (flex:1) beside a bold
  // `done/total` count. No "Progress" label, no second line; bar fill is on a `border`
  // track. One presentation for every study/review/game flow.
  return (
    <View
      testID={node}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: done }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}
    >
      <View
        style={{ flex: 1, height: t.space[2], borderRadius: t.radius.pill, backgroundColor: t.color.border, overflow: 'hidden' }}
      >
        <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: t.radius.pill, backgroundColor: t.color.primary }} />
      </View>
      <Text style={[t.font.text({ size: 'sm', weight: 'bold' }), { color: t.color.textSecondary }]}>
        {done}/{total}
      </Text>
    </View>
  );
}

/**
 * Kit `_shared/StudyPromptCard.jsx`: the study term centred in a card, edit tucked
 * top-right and audio bottom-right so the term stays the sole focus. `fill` stretches
 * the card (Recall); compact is `size-2xl + space-6` = 144 min-height (Guess).
 * Node ids follow the kit: `<prefix>/prompt` · `<prefix>/edit` · `<prefix>/audio`.
 */
export function StudyPromptCard({
  term,
  nodePrefix,
  fill = false,
  editable = true,
  playing = false,
  onEdit,
  onAudio,
}: {
  term: string;
  nodePrefix: string;
  fill?: boolean;
  editable?: boolean;
  playing?: boolean;
  onEdit?: () => void;
  onAudio?: () => void;
}) {
  const t = useTheme();
  return (
    <MxCard
      node={`${nodePrefix}/prompt`}
      style={[
        { alignItems: 'center', justifyContent: 'center' },
        fill ? { flex: 1 } : { minHeight: t.size['2xl'] + t.space[6] },
      ]}
    >
      <Text
        style={[
          t.font.text({ size: '3xl', weight: 'bold', letterSpacing: 'tight' }),
          { color: t.color.text, textAlign: 'center' },
        ]}
      >
        {term}
      </Text>
      {editable && (
        <View style={{ position: 'absolute', top: t.space[4], right: t.space[4] }}>
          <MxIconButton icon="edit" size="sm" accessibilityLabel="Edit card" onPress={onEdit} node={`${nodePrefix}/edit`} />
        </View>
      )}
      <View
        style={{
          position: 'absolute',
          bottom: t.space[4],
          right: t.space[4],
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space[2],
        }}
      >
        {playing && (
          <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.primary }]}>Playing…</Text>
        )}
        <MxIconButton
          icon={playing ? 'graphic_eq' : 'volume_up'}
          accessibilityLabel="Play pronunciation"
          onPress={onAudio}
          node={`${nodePrefix}/audio`}
        />
      </View>
    </MxCard>
  );
}

/** Kit `Note` (kit-helpers.jsx): icon + text on a soft tonal fill — no border. */
export function FeedbackNote({
  tone,
  icon,
  text,
  node,
}: {
  tone: 'accent' | 'warning' | 'success' | 'error';
  icon: string;
  text: string;
  node: string;
}) {
  const t = useTheme();
  const map = {
    accent: { bg: t.color.primarySoft, fg: t.color.onPrimarySoft },
    success: { bg: t.color.successSoft, fg: t.color.onSuccessSoft },
    warning: { bg: t.color.warningSoft, fg: t.color.onWarningSoft },
    error: { bg: t.color.errorSoft, fg: t.color.onErrorSoft },
  } as const;
  const { bg, fg } = map[tone];
  return (
    <View
      testID={node}
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[2],
        backgroundColor: bg,
        borderRadius: t.radius.control,
        paddingVertical: t.space[3],
        paddingHorizontal: t.space[4],
      }}
    >
      <Icon name={icon} size="sm" color={fg} />
      <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: fg, flex: 1 }]}>{text}</Text>
    </View>
  );
}

/**
 * Round-complete panel — the kit renders this as an `EmptyState` (celebration tile,
 * success tone) with a primary "Next round" CTA whose node is `<mode>/next`.
 */
export function RoundComplete({
  title,
  text,
  buttonLabel = 'Next round',
  onNext,
  node,
  ctaNode,
}: {
  title: string;
  text: string;
  buttonLabel?: string;
  onNext?: () => void;
  node: string;
  /** CTA node id; defaults to `<node>-next` for compatibility. */
  ctaNode?: string;
}) {
  return (
    <EmptyState
      node={node}
      icon="celebration"
      tone="success"
      title={title}
      text={text}
      action={
        <MxButton variant="primary" icon="arrow_forward" onPress={onNext} node={ctaNode ?? `${node}-next`}>
          {buttonLabel}
        </MxButton>
      }
    />
  );
}

export type ChoiceTone = 'neutral' | 'correct' | 'wrong';

/**
 * Kit `ChoiceOption` (kit-helpers.jsx): a selectable answer box — idle surface with a
 * hairline divider ring, or a correct/wrong soft-tinted feedback skin with a trailing
 * check_circle / cancel glyph.
 */
export function ChoiceOption({
  text,
  tone = 'neutral',
  onPress,
  node,
  accessibilityLabel,
  accessibilityState,
  style,
}: {
  text: string;
  tone?: ChoiceTone;
  onPress?: () => void;
  node?: string;
  accessibilityLabel?: string;
  accessibilityState?: { disabled?: boolean; selected?: boolean };
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const skin =
    tone === 'correct'
      ? { borderColor: t.color.success, borderWidth: t.stroke.emphasis, backgroundColor: t.color.successSoft, fg: t.color.onSuccessSoft }
      : tone === 'wrong'
        ? { borderColor: t.color.error, borderWidth: t.stroke.emphasis, backgroundColor: t.color.errorSoft, fg: t.color.onErrorSoft }
        : { borderColor: t.color.divider, borderWidth: t.stroke.hairline, backgroundColor: t.color.surface, fg: t.color.text };
  return (
    <Pressable
      testID={node}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space[3],
          padding: t.space[4],
          borderRadius: t.radius.control,
          borderColor: skin.borderColor,
          borderWidth: skin.borderWidth,
          backgroundColor: skin.backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[t.font.text({ size: 'base', weight: 'medium', lineHeight: 'normal' }), { color: skin.fg, flex: 1 }]}>
        {text}
      </Text>
      {tone === 'correct' && <Icon name="check_circle" size={t.iconSize.md} color={t.color.success} />}
      {tone === 'wrong' && <Icon name="cancel" size={t.iconSize.md} color={t.color.error} />}
    </Pressable>
  );
}

/** Local helper so screens can theme without re-importing. */
export type { Theme };
