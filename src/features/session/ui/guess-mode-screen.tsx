/**
 * Guess-mode screen (WBS 6.3, session stage 3). Show a term and five meaning options;
 * the learner picks one. Feedback marks the correct option green (✓) and, on a wrong
 * pick, the chosen option red (✕) — colour AND icon, so the cue never relies on colour
 * alone. Long meanings wrap and the rows grow rather than clip.
 *
 * Presentational and prop-driven: the current card + options come in, the pick and the
 * continue go out. The container runs the session (start → step → persist).
 */

import { Pressable, Text, View } from 'react-native';

import { AppScreen, MxButton, MxIconButton, Icon, useTheme, type Theme } from '@/design-system';

import { ProgressHeader, StudyPromptCard, RoundComplete } from './study-chrome';

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

type OptionTone = 'neutral' | 'correct' | 'wrong';

function toneFor(phase: GuessPhase, i: number, correctIndex: number, pickedIndex: number | null): OptionTone {
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
      <StudyPromptCard term={props.term} eyebrow="WHAT DOES THIS MEAN?" node="guess-mode/prompt" />

      <View style={{ gap: t.space[3] }}>
        {props.options.map((text, i) => (
          <ChoiceOption
            key={i}
            theme={t}
            index={i}
            text={text}
            tone={toneFor(phase, i, props.correctIndex, props.pickedIndex)}
            disabled={revealed}
            onPress={() => props.onPick(i)}
          />
        ))}
      </View>

      {revealed && (
        <MxButton variant="primary" icon="arrow_forward" block onPress={props.onContinue} node="guess-mode/continue">
          Continue
        </MxButton>
      )}
    </AppScreen>
  );
}

function ChoiceOption({
  theme: t,
  index,
  text,
  tone,
  disabled,
  onPress,
}: {
  theme: Theme;
  index: number;
  text: string;
  tone: OptionTone;
  disabled: boolean;
  onPress: () => void;
}) {
  const border = tone === 'correct' ? t.color.success : tone === 'wrong' ? t.color.error : t.color.border;
  const icon = tone === 'correct' ? 'check_circle' : tone === 'wrong' ? 'close' : null;
  const iconColor = tone === 'correct' ? t.color.success : t.color.error;
  const stateLabel = tone === 'correct' ? ' (correct)' : tone === 'wrong' ? ' (your answer, wrong)' : '';

  return (
    <Pressable
      testID={`guess-mode/choice-${index}`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${text}${stateLabel}`}
      onPress={() => {
        if (!disabled) onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        minHeight: t.space[9],
        paddingHorizontal: t.space[4],
        paddingVertical: t.space[3],
        borderRadius: t.radius.md,
        borderWidth: tone === 'neutral' ? t.stroke.hairline : t.stroke.emphasis,
        borderColor: border,
        backgroundColor: t.color.surface,
      }}
    >
      <Text style={[t.font.text({ size: 'base' }), { color: t.color.text, flex: 1 }]}>{text}</Text>
      {icon && <Icon name={icon} size="sm" color={iconColor} />}
    </Pressable>
  );
}
