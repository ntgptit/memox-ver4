/**
 * Recall-mode screen (WBS 7.1, session stage 4). Show a term, let the learner recall
 * its meaning, reveal it, then self-grade Forgot / Got it — the grade advances SRS.
 * A round-complete state closes the round.
 *
 * Composition mirrors the kit `_features/recall-mode/RecallMode.jsx`: progress row,
 * a fill StudyPromptCard, the flex MeaningPanel, tonal feedback notes, and the
 * bottom-anchored Show / Forgot·Got-it actions.
 *
 * Presentational and prop-driven: the current card + progress come in, the reveal and
 * the two grades go out. The container runs the session (start → step → persist).
 */

import { Text, View } from 'react-native';

import { AppScreen, MxCard, MxButton, MxIconButton, Icon, useTheme, type Theme } from '@/design-system';

import { ProgressHeader, StudyPromptCard, FeedbackNote, RoundComplete } from './study-chrome';

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

  const back = <MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={props.onBack} node="recall-mode/back" />;

  if (phase === 'complete') {
    return (
      <AppScreen node="recall-mode/screen" variant="nested" title="Recall" leading={back}>
        <ProgressHeader done={props.total} total={props.total} node="recall-mode/progress" />
        <RoundComplete
          node="recall-mode/complete"
          ctaNode="recall-mode/next"
          title="Round complete!"
          text="You’ve reviewed the words in this round."
          onNext={props.onNext}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen node="recall-mode/screen" variant="nested" title="Recall" leading={back}>
      <ProgressHeader done={props.done} total={props.total} node="recall-mode/progress" />

      <StudyPromptCard term={props.term} nodePrefix="recall-mode" fill />

      <MeaningPanel theme={t} meaning={props.meaning} revealed={revealed} />

      {phase === 'forgot' && (
        <FeedbackNote node="recall-mode/note-warning" tone="warning" icon="replay" text="You’ll see this word again this round." />
      )}
      {phase === 'remembered' && (
        <FeedbackNote node="recall-mode/note-success" tone="success" icon="check_circle" text="Nice! Moving to the next card." />
      )}

      {/* Kit: the action row reclaims the body's reserved bottom-nav padding. */}
      <View style={{ marginBottom: -t.layout.bottomNavHeight }}>
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

/**
 * Kit `_features/recall-mode/components/MeaningPanel.jsx`: a flex card — hidden shows
 * the "Recall the meaning, then tap Show" hint row; revealed shows a divider bar over
 * the meaning.
 */
function MeaningPanel({ theme: t, meaning, revealed }: { theme: Theme; meaning: string; revealed: boolean }) {
  return (
    <MxCard
      node="recall-mode/meaning"
      accessibilityLabel={revealed ? `Meaning: ${meaning}` : 'Meaning hidden'}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space[2], minHeight: t.size['2xl'] }}
    >
      {revealed ? (
        <>
          <View
            style={{ width: t.size.md, height: t.size['3xs'], backgroundColor: t.color.divider, borderRadius: t.radius.xs }}
          />
          <Text style={[t.font.text({ size: 'xl', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
            {meaning}
          </Text>
        </>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
          <Icon name="visibility" size="sm" color={t.color.textTertiary} />
          <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.textTertiary }]}>
            Recall the meaning, then tap “Show”
          </Text>
        </View>
      )}
    </MxCard>
  );
}
