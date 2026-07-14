/**
 * Study-result screen (WBS 7.4) — the terminal session summary. Composition
 * mirrors the kit `_features/study-result/StudyResult.jsx`: root "Results" bar
 * (no close — exit only via the explicit bottom actions) → ResultHero (per-kind
 * icon/tone/copy) → muted stat-card trio → "Review mistakes" link →
 * StreakGoalCard → per-kind CTA pair; plus finalizing / retry-finalize
 * skeletons and the finalize-error empty state. 7 states (contract §6).
 */

import { View } from 'react-native';

import { AppScreen, EmptyState, MxButton, MxCard, MxLink, Stat, useTheme, type MxIconTileTone } from '@/design-system';

import { Cta, FinalizingBody, ResultHero, StreakGoalCard } from './study-result-components';
import type { StudyResultData, StudyResultKind } from './study-result-fixtures';

export interface StudyResultScreenProps {
  data: StudyResultData;
  onContinue?: () => void;
  onLater?: () => void;
  onReviewWrong?: () => void;
  onReviewMistakes?: () => void;
  onLibrary?: () => void;
  onRetryFinalize?: () => void;
  onFinalizeLater?: () => void;
}

/** Kit HEAD map — per-kind hero icon/tone with copy composed from the numbers. */
function hero(kind: StudyResultKind): { icon: string; tone: MxIconTileTone } {
  switch (kind) {
    case 'goal-met':
      return { icon: 'celebration', tone: 'success' };
    case 'goal-missed':
      return { icon: 'trending_up', tone: 'warning' };
    case 'many-wrong':
      return { icon: 'refresh', tone: 'error' };
    case 'standard':
    default:
      return { icon: 'task_alt', tone: 'accent' };
  }
}

function heroCopy(kind: StudyResultKind, s: { cards: string; streakDays: number; goalLeft: number; wrong: number }) {
  switch (kind) {
    case 'goal-met':
      return { title: 'Daily goal reached!', text: `Streak +1 → ${s.streakDays} days in a row.` };
    case 'goal-missed':
      return { title: 'Almost there!', text: `${s.goalLeft} more minutes to hit today’s goal.` };
    case 'many-wrong':
      return { title: 'A few shaky words', text: `You missed ${s.wrong} cards — review now to remember them longer.` };
    case 'standard':
    default:
      return { title: 'Session complete', text: `You reviewed ${s.cards} cards this session.` };
  }
}

export function StudyResultScreen({
  data,
  onContinue,
  onLater,
  onReviewWrong,
  onReviewMistakes,
  onLibrary,
  onRetryFinalize,
  onFinalizeLater,
}: StudyResultScreenProps) {
  const t = useTheme();

  // ---- finalizing / retry-finalize -------------------------------------------------
  if (data.status === 'finalizing') {
    return (
      <AppScreen node="study-result/screen" variant="root" title="Results">
        <FinalizingBody retry={data.retry} />
      </AppScreen>
    );
  }

  // ---- finalize-error ---------------------------------------------------------------
  if (data.status === 'error') {
    return (
      <AppScreen node="study-result/screen" variant="root" title="Results">
        <EmptyState
          node="study-result/finalize-error"
          icon="cloud_off"
          tone="error"
          wide
          title="Couldn't save your results"
          text="Your session finished, but we couldn't update your schedule. Retry so this session counts."
          action={
            <View style={{ gap: t.space[3], width: t.size['3xl'] }}>
              <MxButton variant="primary" icon="refresh" block onPress={onRetryFinalize} node="study-result/finalize-retry">
                Retry
              </MxButton>
              <MxButton variant="ghost" block onPress={onFinalizeLater} node="study-result/finalize-later">
                Not now
              </MxButton>
            </View>
          }
        />
      </AppScreen>
    );
  }

  const s = data.summary;
  const h = hero(s.kind);
  const copy = heroCopy(s.kind, s);
  const met = s.kind === 'goal-met';
  // many-wrong already has a dedicated review CTA (kit showMistakes).
  const showMistakes = s.kind !== 'many-wrong';

  return (
    <AppScreen node="study-result/screen" variant="root" title="Results">
      <View style={{ gap: t.space[4] }}>
        <ResultHero icon={h.icon} tone={h.tone} title={copy.title} text={copy.text} />

        <View style={{ flexDirection: 'row', gap: t.space[3] }}>
          {(
            [
              [s.cards, 'cards'],
              [s.correctPct, 'correct'],
              [s.minutes, 'min'],
            ] as const
          ).map(([n, l], i) => (
            <MxCard key={l} variant="muted" padding="sm" node={`study-result/stat-${i}`} style={{ flex: 1, alignItems: 'center' }}>
              <Stat n={n} l={l} />
            </MxCard>
          ))}
        </View>

        {showMistakes && (
          <View style={{ alignItems: 'center', marginTop: -t.space[2] }}>
            <MxLink icon="replay" trailingIcon={null} size="sm" onPress={onReviewMistakes} node="study-result/review-mistakes">
              Review mistakes
            </MxLink>
          </View>
        )}

        <StreakGoalCard summary={s} met={met} />

        <View style={{ gap: t.space[2] }}>
          <Cta
            kind={s.kind}
            wrong={s.wrong}
            onContinue={onContinue}
            onLater={onLater}
            onReviewWrong={onReviewWrong}
            onLibrary={onLibrary}
          />
        </View>
      </View>
    </AppScreen>
  );
}
