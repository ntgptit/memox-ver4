/**
 * Guess-mode screen (WBS 6.3, session stage 3). Show a term and five meaning options;
 * the learner picks one. Feedback marks the correct option green (✓) and, on a wrong
 * pick, the chosen option red (✕) — colour AND icon, so the cue never relies on colour
 * alone. Long meanings wrap and the rows grow rather than clip.
 *
 * Presentational and prop-driven: the current card + options come in, the pick and the
 * continue go out. The container runs the session (start → step → persist).
 */

import { View } from 'react-native';

import { AppScreen, MxIconButton, useTheme } from '@/design-system';

import { ProgressHeader, StudyPromptCard, RoundComplete, ChoiceOption, type ChoiceTone } from './study-chrome';

export type GuessPhase = 'waiting' | 'correct' | 'wrong' | 'complete';

export interface GuessModeScreenProps {
  phase: GuessPhase;
  term: string;
  options: readonly string[];
  correctIndex: number;
  pickedIndex: number | null;
  done: number;
  total: number;
  onPick: (i: number) => void;
  onContinue: () => void;
  onDone?: () => void;
  onBack?: () => void;
}

function toneFor(phase: GuessPhase, i: number, correctIndex: number, pickedIndex: number | null): ChoiceTone {
  if (phase !== 'correct' && phase !== 'wrong') return 'neutral';
  if (i === correctIndex) return 'correct';
  if (i === pickedIndex) return 'wrong';
  return 'neutral';
}

export function GuessModeScreen(props: GuessModeScreenProps) {
  const t = useTheme();
  const { phase } = props;
  const revealed = phase === 'correct' || phase === 'wrong';

  const back = <MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={props.onBack} node="guess-mode/back" />;

  if (phase === 'complete') {
    return (
      <AppScreen node="guess-mode/screen" variant="nested" title="Guess" leading={back}>
        <ProgressHeader done={props.total} total={props.total} node="guess-mode/progress" />
        <RoundComplete
          node="guess-mode/complete"
          ctaNode="guess-mode/next"
          title="Round complete!"
          text={`You answered ${props.done}/${props.total} correctly.`}
          onNext={props.onDone}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen node="guess-mode/screen" variant="nested" title="Guess" leading={back}>
      <ProgressHeader done={props.done} total={props.total} node="guess-mode/progress" />
      <StudyPromptCard term={props.term} nodePrefix="guess-mode" />

      {/* Kit: the five options fill the remaining body height as equal rows — short
          options grow to share the space, long meanings keep their content height. After
          the reveal there is no Continue button; tapping any option advances. */}
      <View style={{ flex: 1, gap: t.space[3] }}>
        {props.options.map((text, i) => {
          const tone = toneFor(phase, i, props.correctIndex, props.pickedIndex);
          const stateLabel = tone === 'correct' ? ' (correct)' : tone === 'wrong' ? ' (your answer, wrong)' : '';
          return (
            <ChoiceOption
              key={i}
              node={`guess-mode/choice-${i}`}
              text={text}
              tone={tone}
              accessibilityLabel={`${text}${stateLabel}${revealed ? '. Tap to continue' : ''}`}
              accessibilityState={{ selected: i === props.pickedIndex }}
              onPress={() => (revealed ? props.onContinue() : props.onPick(i))}
              style={{ flexGrow: 1, flexBasis: 'auto' }}
            />
          );
        })}
      </View>
    </AppScreen>
  );
}
