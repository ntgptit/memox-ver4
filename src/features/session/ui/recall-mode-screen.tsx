/**
 * Recall-mode screen (WBS 7.1, session stage 4). Show a term, let the learner recall
 * its meaning, reveal it, then self-grade Forgot / Got it — the grade advances SRS.
 * A round-complete state closes the round.
 *
 * Presentational and prop-driven: the current card + progress come in, the reveal and
 * the two grades go out. The container runs the session (start → step → persist).
 */

import { Text, View } from 'react-native';

import { AppScreen, MxCard, MxButton, MxIconButton, Icon, useTheme, type Theme } from '@/design-system';

export type RecallPhase = 'before-reveal' | 'revealed' | 'forgot' | 'remembered' | 'complete';

export interface RecallModeScreenProps {
  phase: RecallPhase;
  term: string;
  meaning: string;
  done: number;
  total: number;
  onReveal: () => void;
  onForgot: () => void;
  onRemembered: () => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function RecallModeScreen(props: RecallModeScreenProps) {
  const t = useTheme();
  const { phase } = props;
  const revealed = phase === 'revealed' || phase === 'forgot' || phase === 'remembered';

  const bar = (
    <>
      <MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={props.onBack} node="recall-mode/back" />
    </>
  );

  if (phase === 'complete') {
    return (
      <AppScreen node="recall-mode/screen" variant="nested" title="Recall" leading={bar}>
        <ProgressHeader theme={t} done={props.total} total={props.total} />
        <MxCard node="recall-mode/complete" variant="flat">
          <View style={{ alignItems: 'center', gap: t.space[3], paddingVertical: t.space[5] }}>
            <Icon name="celebration" size="xl" color={t.color.success} />
            <Text style={[t.font.text({ size: 'lg', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
              Round complete!
            </Text>
            <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, textAlign: 'center' }]}>
              You’ve reviewed the words in this round.
            </Text>
            <MxButton variant="primary" icon="arrow_forward" onPress={props.onNext} node="recall-mode/next">
              Done
            </MxButton>
          </View>
        </MxCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen node="recall-mode/screen" variant="nested" title="Recall" leading={bar}>
      <ProgressHeader theme={t} done={props.done} total={props.total} />

      <PromptCard theme={t} term={props.term} />

      <MeaningPanel theme={t} meaning={props.meaning} revealed={revealed} />

      {phase === 'forgot' && (
        <FeedbackNote theme={t} tone="warning" icon="replay" text="You’ll see this word again this round." />
      )}
      {phase === 'remembered' && (
        <FeedbackNote theme={t} tone="success" icon="check_circle" text="Nice! Moving to the next card." />
      )}

      <View style={{ gap: t.space[3] }}>
        {phase === 'before-reveal' ? (
          <MxButton variant="primary" icon="visibility" block size="lg" onPress={props.onReveal} node="recall-mode/reveal">
            Show
          </MxButton>
        ) : (
          <View style={{ flexDirection: 'row', gap: t.space[3] }}>
            <View style={{ flex: 1 }}>
              <MxButton
                variant={phase === 'forgot' ? 'primary' : 'ghost'}
                danger={phase === 'forgot'}
                block
                onPress={props.onForgot}
                node="recall-mode/forgot"
              >
                Forgot
              </MxButton>
            </View>
            <View style={{ flex: 1 }}>
              <MxButton variant="primary" block onPress={props.onRemembered} node="recall-mode/remembered">
                Got it
              </MxButton>
            </View>
          </View>
        )}
      </View>
    </AppScreen>
  );
}

function ProgressHeader({ theme: t, done, total }: { theme: Theme; done: number; total: number }) {
  const pct = total > 0 ? Math.min(1, done / total) : 0;
  return (
    <View
      testID="recall-mode/progress"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: done }}
      style={{ gap: t.space[2] }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.textSecondary }]}>Progress</Text>
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textTertiary }]}>
          {done} / {total}
        </Text>
      </View>
      <View style={{ height: t.space[2], borderRadius: t.radius.full, backgroundColor: t.color.surfaceMuted, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: t.color.primary }} />
      </View>
    </View>
  );
}

function PromptCard({ theme: t, term }: { theme: Theme; term: string }) {
  return (
    <MxCard node="recall-mode/prompt" variant="elevated">
      <View style={{ alignItems: 'center', paddingVertical: t.space[6], gap: t.space[2] }}>
        <Text style={[t.font.text({ size: 'xs', weight: 'semibold' }), { color: t.color.textTertiary }]}>RECALL THE MEANING</Text>
        <Text style={[t.font.text({ size: '3xl', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>{term}</Text>
      </View>
    </MxCard>
  );
}

function MeaningPanel({ theme: t, meaning, revealed }: { theme: Theme; meaning: string; revealed: boolean }) {
  return (
    <View
      testID="recall-mode/meaning"
      accessibilityLabel={revealed ? `Meaning: ${meaning}` : 'Meaning hidden'}
      style={{
        minHeight: t.space[9],
        borderRadius: t.radius.md,
        borderWidth: t.stroke.hairline,
        borderColor: t.color.border,
        backgroundColor: revealed ? t.color.surface : t.color.surfaceMuted,
        alignItems: 'center',
        justifyContent: 'center',
        padding: t.space[4],
      }}
    >
      {revealed ? (
        <Text style={[t.font.text({ size: 'lg', weight: 'semibold' }), { color: t.color.text, textAlign: 'center' }]}>
          {meaning}
        </Text>
      ) : (
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textTertiary }]}>Tap “Show” to reveal</Text>
      )}
    </View>
  );
}

function FeedbackNote({
  theme: t,
  tone,
  icon,
  text,
}: {
  theme: Theme;
  tone: 'warning' | 'success';
  icon: string;
  text: string;
}) {
  const color = tone === 'success' ? t.color.success : t.color.warning;
  return (
    <View
      testID={`recall-mode/note-${tone}`}
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        borderRadius: t.radius.md,
        borderWidth: t.stroke.hairline,
        borderColor: color,
        backgroundColor: t.color.surface,
        padding: t.space[3],
      }}
    >
      <Icon name={icon} size="sm" color={color} />
      <Text style={[t.font.text({ size: 'sm' }), { color: t.color.text, flex: 1 }]}>{text}</Text>
    </View>
  );
}
