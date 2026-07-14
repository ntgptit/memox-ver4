/**
 * Study-result feature-local components (WBS 7.4) — RN ports of the kit's
 * `_features/study-result/components/*`: ResultHero (centered icon tile +
 * title/subtitle), StreakGoalCard (streak + today's goal on primary-soft),
 * FinalizingView (saving/committing skeleton), Cta (per-state action pair).
 */

import { Text, View } from 'react-native';

import {
  Icon,
  MxBadge,
  MxButton,
  MxCard,
  MxIconTile,
  ProgressBar,
  Skeleton,
  useTheme,
  type MxIconTileTone,
} from '@/design-system';

import type { StudyResultKind, StudyResultSummary } from './study-result-fixtures';

/** Kit ResultHero: lg icon tile + extrabold title + secondary subtitle, centered. */
export function ResultHero({ icon, tone, title, text }: { icon: string; tone?: MxIconTileTone; title: string; text: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: t.space[3], paddingTop: t.space[4] }}>
      <MxIconTile icon={icon} tone={tone} size="lg" />
      <View style={{ alignItems: 'center' }}>
        <Text
          accessibilityRole="header"
          style={[
            t.font.text({ size: 'lg', weight: 'extrabold', letterSpacing: 'tight' }),
            { color: t.color.text, textAlign: 'center' },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            t.font.text({ size: 'base' }),
            { color: t.color.textSecondary, textAlign: 'center', maxWidth: t.size['4xl'], marginTop: t.space[1] },
          ]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

/** Kit StreakGoalCard: neutral primary-soft streak card; green only on the met badge. */
export function StreakGoalCard({ summary, met }: { summary: StudyResultSummary; met: boolean }) {
  const t = useTheme();
  const fg = t.color.onPrimarySoft;
  return (
    <MxCard node="study-result/goal" variant="primary-soft" style={{ gap: t.space[3] }}>
      {met && (
        <View style={{ flexDirection: 'row' }}>
          <MxBadge tone="success" soft node="study-result/goal-badge">
            <Icon name="celebration" size={t.iconSize.sm} color={t.color.onSuccessSoft} /> Daily goal completed!
          </MxBadge>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
        <Icon name="local_fire_department" size={t.iconSize.lg} color={fg} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[t.font.text({ size: 'md', weight: 'extrabold' }), { color: fg }]}>
            {summary.streakDays} days
          </Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: fg, opacity: t.opacity.labelSoft }]}>
            day streak{met ? ' · +1 today' : ''}
          </Text>
        </View>
      </View>
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: t.space[2] }}>
          <Text style={[t.font.text({ size: 'sm' }), { color: fg, opacity: t.opacity.label }]}>Today&apos;s goal</Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: fg, opacity: t.opacity.label }]}>
            {summary.goalDone}/{summary.goalMinutes} min
          </Text>
        </View>
        <ProgressBar value={summary.goalPct} height={8} tone={t.color.primary} accessibilityLabel="Today's goal progress" node="study-result/goal-bar" />
      </View>
    </MxCard>
  );
}

/** Kit FinalizingView body: hero + three skeleton stat cards + a card skeleton. */
export function FinalizingBody({ retry }: { retry: boolean }) {
  const t = useTheme();
  return (
    <>
      <ResultHero
        icon={retry ? 'refresh' : 'cloud_sync'}
        tone="accent"
        title={retry ? 'Retrying…' : 'Saving your results…'}
        text={retry ? 'Trying again to update your review schedule and streak.' : 'Updating your review schedule and streak.'}
      />
      <View style={{ flexDirection: 'row', gap: t.space[3] }}>
        {[0, 1, 2].map((i) => (
          <MxCard key={i} variant="muted" padding="sm" node={`study-result/finalizing-stat-${i}`} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ alignItems: 'center', gap: t.space[2], alignSelf: 'stretch' }}>
              <Skeleton w={44} h={22} />
              <Skeleton w="64%" h={10} />
            </View>
          </MxCard>
        ))}
      </View>
      <Skeleton h={120} r={20} />
    </>
  );
}

/** Kit Cta: the per-state primary/ghost action pair. */
export function Cta({
  kind,
  wrong,
  onContinue,
  onLater,
  onReviewWrong,
  onLibrary,
}: {
  kind: StudyResultKind;
  wrong: number;
  onContinue?: () => void;
  onLater?: () => void;
  onReviewWrong?: () => void;
  onLibrary?: () => void;
}) {
  if (kind === 'goal-missed') {
    return (
      <>
        <MxButton variant="primary" icon="bolt" block onPress={onContinue} node="study-result/continue">
          Keep going
        </MxButton>
        <MxButton variant="ghost" block onPress={onLater} node="study-result/later">
          Later
        </MxButton>
      </>
    );
  }
  if (kind === 'many-wrong') {
    return (
      <>
        <MxButton variant="primary" icon="replay" block onPress={onReviewWrong} node="study-result/review-wrong">
          Review {wrong} cards
        </MxButton>
        <MxButton variant="ghost" block onPress={onLibrary} node="study-result/library">
          Back to library
        </MxButton>
      </>
    );
  }
  return (
    <>
      <MxButton variant="primary" icon="bolt" block onPress={onContinue} node="study-result/continue">
        Keep studying
      </MxButton>
      <MxButton variant="ghost" block onPress={onLibrary} node="study-result/library">
        Back to library
      </MxButton>
    </>
  );
}
