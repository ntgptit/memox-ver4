/**
 * Fill-mode screen (WBS 7.2, session stage 5). Show a meaning, type the term. Check
 * compares the answer; a wrong answer shows a per-character diff and the correct term,
 * with Retry / accept-as-correct. Help reveals a hint. Keyboard-aware so Check stays
 * reachable.
 *
 * Presentational and prop-driven: the meaning + typed input + phase come in, all intent
 * goes out. The container runs the session (start → check → persist).
 */

import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';

import { AppScreen, MxCard, MxButton, MxIconButton, SectionLabel, useTheme, type Theme } from '@/design-system';

import { ProgressHeader, FeedbackNote, RoundComplete } from './study-chrome';

export type FillPhase = 'waiting' | 'typing' | 'hint' | 'correct' | 'wrong' | 'complete';

export interface FillModeScreenProps {
  phase: FillPhase;
  meaning: string;
  term: string;
  input: string;
  hint?: string;
  done: number;
  total: number;
  onChangeInput: (t: string) => void;
  onCheck: () => void;
  onHint: () => void;
  onNext: () => void;
  onAccept: () => void;
  onRetry: () => void;
  onDone?: () => void;
  onBack?: () => void;
}

export function FillModeScreen(props: FillModeScreenProps) {
  const t = useTheme();
  const { phase } = props;
  const back = <MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={props.onBack} node="fill-mode/back" />;

  if (phase === 'complete') {
    return (
      <AppScreen node="fill-mode/screen" variant="nested" title="Fill" leading={back}>
        <ProgressHeader done={props.total} total={props.total} node="fill-mode/progress" />
        <RoundComplete
          node="fill-mode/complete"
          ctaNode="fill-mode/next"
          title="Round complete!"
          text="You typed the words correctly."
          onNext={props.onDone}
        />
      </AppScreen>
    );
  }

  const editable = phase === 'waiting' || phase === 'typing' || phase === 'hint';
  const canCheck = props.input.trim().length > 0;

  return (
    <AppScreen node="fill-mode/screen" variant="nested" title="Fill" leading={back}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, gap: t.space[6] }}
      >
        <ProgressHeader done={props.done} total={props.total} node="fill-mode/progress" />

        {/* Kit: the meaning fills the free height — SectionLabel MEANING over the xl term. */}
        <MxCard node="fill-mode/meaning" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space[2] }}>
          <SectionLabel uppercase style={{ margin: 0 }}>
            Meaning
          </SectionLabel>
          <Text style={[t.font.text({ size: 'xl', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
            {props.meaning}
          </Text>
        </MxCard>

        <Text style={[t.font.text({ size: 'sm', weight: 'bold' }), { color: t.color.textSecondary }]}>Type the term</Text>

        <InputBox theme={t} phase={phase} input={props.input} term={props.term} onChangeInput={props.onChangeInput} onSubmit={props.onCheck} editable={editable} />

        {phase === 'hint' && props.hint && (
          <FeedbackNote tone="warning" icon="lightbulb" text={props.hint} node="fill-mode/hint-note" />
        )}
        {phase === 'wrong' && (
          <Text testID="fill-mode/answer" style={[t.font.text({ size: 'base' }), { color: t.color.textSecondary, textAlign: 'center' }]}>
            Answer:{' '}
            <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.success }]}>{props.term}</Text>
          </Text>
        )}

        <Controls theme={t} canCheck={canCheck} {...props} />
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

function InputBox({
  theme: t,
  phase,
  input,
  term,
  onChangeInput,
  onSubmit,
  editable,
}: {
  theme: Theme;
  phase: FillPhase;
  input: string;
  term: string;
  onChangeInput: (t: string) => void;
  onSubmit: () => void;
  editable: boolean;
}) {
  // Kit InputBox: size-xl (96) min-height, radius-control, hairline DIVIDER ring that
  // tints to an emphasis success/error ring, centered xl-extrabold content.
  const border = phase === 'correct' ? t.color.success : phase === 'wrong' ? t.color.error : t.color.divider;
  const emphasised = phase === 'correct' || phase === 'wrong';

  return (
    <View
      style={{
        minHeight: t.size.xl,
        borderRadius: t.radius.control,
        borderWidth: emphasised ? t.stroke.emphasis : t.stroke.hairline,
        borderColor: border,
        backgroundColor: t.color.surface,
        justifyContent: 'center',
        padding: t.space[4],
      }}
    >
      {phase === 'wrong' ? (
        <CharCompare theme={t} typed={input} correct={term} />
      ) : phase === 'correct' ? (
        <Text
          testID="fill-mode/input"
          style={[t.font.text({ size: 'xl', weight: 'extrabold' }), { color: t.color.success, textAlign: 'center' }]}
        >
          {term}
        </Text>
      ) : (
        <TextInput
          testID="fill-mode/input"
          value={input}
          onChangeText={onChangeInput}
          onSubmitEditing={onSubmit}
          editable={editable}
          placeholder="Type the term…"
          placeholderTextColor={t.color.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          accessibilityLabel="Type the term"
          style={[t.font.text({ size: 'xl', weight: 'extrabold' }), { color: t.color.text, textAlign: 'center', padding: 0 }]}
        />
      )}
    </View>
  );
}

/** Per-character typed-vs-correct diff: each position is green if it matches, else red. */
function CharCompare({ theme: t, typed, correct }: { theme: Theme; typed: string; correct: string }) {
  const chars = Array.from(correct);
  const typedChars = Array.from(typed);
  return (
    <View
      testID="fill-mode/char-compare"
      accessibilityLabel={`You typed ${typed || 'nothing'}. Correct answer ${correct}.`}
      style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: t.space[1] }}
    >
      {chars.map((c, i) => {
        const okChar = typedChars[i] === c;
        return (
          <Text
            key={i}
            style={[t.font.text({ size: 'xl', weight: 'extrabold' }), { color: okChar ? t.color.success : t.color.error }]}
          >
            {typedChars[i] ?? '_'}
          </Text>
        );
      })}
    </View>
  );
}

function Controls({
  theme: t,
  phase,
  canCheck,
  onCheck,
  onHint,
  onNext,
  onAccept,
  onRetry,
}: {
  theme: Theme;
  phase: FillPhase;
  canCheck: boolean;
} & FillModeScreenProps) {
  if (phase === 'correct') {
    return (
      <MxButton variant="primary" icon="arrow_forward" block onPress={onNext} node="fill-mode/next">
        Next
      </MxButton>
    );
  }
  if (phase === 'wrong') {
    return (
      <View style={{ flexDirection: 'row', gap: t.space[3] }}>
        <View style={{ flex: 1 }}>
          <MxButton variant="outline" block onPress={onAccept} node="fill-mode/accept">
            Correct
          </MxButton>
        </View>
        <View style={{ flex: 1 }}>
          <MxButton variant="primary" block onPress={onRetry} node="fill-mode/retry">
            Retry
          </MxButton>
        </View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', gap: t.space[3] }}>
      <View style={{ flex: 1 }}>
        <MxButton variant="ghost" icon="lightbulb" block onPress={onHint} node="fill-mode/hint">
          Help
        </MxButton>
      </View>
      <View style={{ flex: 1 }}>
        <MxButton variant="primary" block disabled={!canCheck} onPress={onCheck} node="fill-mode/check">
          Check
        </MxButton>
      </View>
    </View>
  );
}
