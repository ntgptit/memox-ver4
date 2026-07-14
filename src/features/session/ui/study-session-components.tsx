/**
 * Study-session feature-local components (WBS 5.5) — RN ports of the kit's
 * `_features/study-session/components/*`: PromptCard, the five stage bodies
 * (Review/Match/Guess/Recall/Fill — kit shell variants that mount the shared
 * study-chrome pieces from the 6.x/7.x slices), the Exit and AnswerSaveError
 * confirm overlays and the full-screen ResumeErrorState.
 */

import { Pressable, Text, TextInput, View } from 'react-native';

import {
  AppScreen,
  Dialog,
  EmptyState,
  MxButton,
  MxCard,
  MxIconButton,
  Note,
  Scrim,
  useTheme,
} from '@/design-system';

import { ChoiceOption } from './study-chrome';
import type { StageContent } from './study-session-fixtures';

/** Kit PromptCard: centered term + optional sub-label (Guess/Recall/Fill). */
export function PromptCard({ term, sub }: { term: string; sub?: string }) {
  const t = useTheme();
  return (
    <MxCard style={{ alignItems: 'center', gap: t.space[3], padding: t.space[6] }}>
      <Text
        style={[
          t.font.text({ size: '3xl', weight: 'bold', letterSpacing: 'tight' }),
          { color: t.color.text, textAlign: 'center' },
        ]}
      >
        {term}
      </Text>
      {sub !== undefined && (
        <Text style={[t.font.text({ size: 'base' }), { color: t.color.textSecondary, textAlign: 'center' }]}>{sub}</Text>
      )}
    </MxCard>
  );
}

/** Kit StageReview: full card (term · divider · meaning · note) + Next. */
export function StageReview({ content, onNext }: { content: StageContent; onNext?: () => void }) {
  const t = useTheme();
  return (
    <>
      <MxCard
        node="study-session/card"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space[4], minHeight: t.size['5xl'] }}
      >
        <Text style={[t.font.text({ size: '3xl', weight: 'bold', letterSpacing: 'tight' }), { color: t.color.text, textAlign: 'center' }]}>
          {content.term}
        </Text>
        <View style={{ width: t.size.md, height: t.size['3xs'], backgroundColor: t.color.divider, borderRadius: t.radius.xs }} />
        <Text style={[t.font.text({ size: 'xl', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
          {content.meaning}
        </Text>
        <Text style={[t.font.text({ size: 'base' }), { color: t.color.textSecondary, textAlign: 'center' }]}>{content.note}</Text>
      </MxCard>
      <MxButton variant="primary" icon="arrow_forward" block size="lg" onPress={onNext} node="study-session/next">
        Next
      </MxButton>
    </>
  );
}

/** Kit StageMatch: two columns of tiles. */
export function StageMatch({ content, onPick }: { content: StageContent; onPick?: (text: string) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: t.space[3] }}>
      <View style={{ flex: 1, gap: t.space[3] }}>
        {content.left.map((x, i) => (
          <MatchTile key={x} text={x} onPress={() => onPick?.(x)} node={`study-session/match-l${i}`} />
        ))}
      </View>
      <View style={{ flex: 1, gap: t.space[3] }}>
        {content.right.map((x, i) => (
          <MatchTile key={x} text={x} onPress={() => onPick?.(x)} node={`study-session/match-r${i}`} />
        ))}
      </View>
    </View>
  );
}

/** Kit Tile geometry: hairline border, control radius, 16/8 padding, bold base. */
function MatchTile({ text, onPress, node }: { text: string; onPress?: () => void; node?: string }) {
  const t = useTheme();
  return (
    <Pressable
      testID={node}
      accessibilityRole="button"
      accessibilityLabel={text}
      onPress={onPress}
      style={{
        borderWidth: t.stroke.hairline,
        borderColor: t.color.divider,
        backgroundColor: t.color.surface,
        borderRadius: t.radius.control,
        paddingVertical: t.space[4],
        paddingHorizontal: t.space[2],
        alignItems: 'center',
      }}
    >
      <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
        {text}
      </Text>
    </Pressable>
  );
}

/** Kit StageGuess: prompt + choice options (+ relearn warning note). */
export function StageGuess({
  content,
  relearn = false,
  onPick,
}: {
  content: StageContent;
  relearn?: boolean;
  onPick?: (option: string) => void;
}) {
  const t = useTheme();
  return (
    <>
      {relearn && <Note icon="replay" tone="warning" text="Review this word — not counted toward progress." />}
      <PromptCard term={content.term} />
      <View style={{ gap: t.space[3] }}>
        {content.options.map((o, i) => (
          <ChoiceOption key={o} text={o} onPress={() => onPick?.(o)} node={`study-session/option-${i}`} />
        ))}
      </View>
    </>
  );
}

/** Kit StageRecall: prompt + hidden-meaning hint card + Show. */
export function StageRecall({ term, onReveal }: { term: string; onReveal?: () => void }) {
  const t = useTheme();
  return (
    <>
      <PromptCard term={term} />
      <MxCard style={{ alignItems: 'center', minHeight: t.size.xl, justifyContent: 'center' }}>
        <Text style={[t.font.text({ size: 'base' }), { color: t.color.textTertiary }]}>
          Recall the meaning, then tap “Show”
        </Text>
      </MxCard>
      <MxButton variant="primary" icon="visibility" block size="lg" onPress={onReveal} node="study-session/reveal">
        Show
      </MxButton>
    </>
  );
}

/** Kit StageFill: meaning prompt + type surface + Help/Check pair. */
export function StageFill({
  content,
  value = '',
  onChange,
  onHint,
  onCheck,
}: {
  content: StageContent;
  value?: string;
  onChange?: (v: string) => void;
  onHint?: () => void;
  onCheck?: () => void;
}) {
  const t = useTheme();
  return (
    <>
      <PromptCard term={content.meaning} sub="MEANING" />
      <View
        style={{
          borderWidth: t.stroke.hairline,
          borderColor: t.color.divider,
          backgroundColor: t.color.surface,
          borderRadius: t.radius.control,
          padding: t.space[4],
          minHeight: t.size.md,
          justifyContent: 'center',
        }}
      >
        <TextInput
          testID="study-session/fill-input"
          accessibilityLabel="Type the answer"
          value={value}
          onChangeText={onChange}
          placeholder="Type the Korean word…"
          placeholderTextColor={t.color.textTertiary}
          style={[t.font.text({ size: 'base', weight: 'semibold' }), { color: t.color.text, padding: 0 }]}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: t.space[3] }}>
        <View style={{ flex: 1 }}>
          <MxButton variant="ghost" icon="lightbulb" block onPress={onHint} node="study-session/hint">
            Help
          </MxButton>
        </View>
        <View style={{ flex: 1 }}>
          <MxButton variant="primary" block onPress={onCheck} node="study-session/check">
            Check
          </MxButton>
        </View>
      </View>
    </>
  );
}

/** Kit ExitDialog: leave-session confirm (danger). */
export function ExitDialog({ onStay, onLeave }: { onStay?: () => void; onLeave?: () => void }) {
  return (
    <Scrim align="center" onDismiss={onStay} node="study-session/exit-scrim">
      <Dialog
        icon="logout"
        tone="error"
        title="Leave the session?"
        text="Cards that haven't finished all 5 stages will stay New."
        node="study-session/exit-dialog"
        actions={[
          <MxButton key="stay" variant="ghost" block onPress={onStay} node="study-session/exit-cancel">
            Stay
          </MxButton>,
          <MxButton key="leave" variant="primary" danger block onPress={onLeave} node="study-session/exit-ok">
            Leave
          </MxButton>,
        ]}
      />
    </Scrim>
  );
}

/** Kit AnswerSaveErrorDialog: failed recordAnswer recovery. */
export function AnswerSaveErrorDialog({ onBack, onRetry }: { onBack?: () => void; onRetry?: () => void }) {
  return (
    <Scrim align="center" onDismiss={onBack} node="study-session/save-error-scrim">
      <Dialog
        icon="sync_problem"
        tone="error"
        title="Couldn't save your answer"
        text="Your result for this card wasn't saved. Retry so your review schedule stays correct."
        node="study-session/save-error-dialog"
        actions={[
          <MxButton key="back" variant="ghost" block onPress={onBack} node="study-session/save-error-back">
            Back
          </MxButton>,
          <MxButton key="retry" variant="primary" icon="refresh" block onPress={onRetry} node="study-session/save-error-retry">
            Retry
          </MxButton>,
        ]}
      />
    </Scrim>
  );
}

/** Kit ResumeErrorState: full screen (own bar — no progress in this state). */
export function ResumeErrorState({
  onClose,
  onRestart,
  onBackToDeck,
}: {
  onClose?: () => void;
  onRestart?: () => void;
  onBackToDeck?: () => void;
}) {
  const t = useTheme();
  return (
    <AppScreen
      node="study-session/screen"
      variant="nested"
      title="Resume session"
      leading={<MxIconButton icon="close" size="sm" accessibilityLabel="Close" onPress={onClose} node="study-session/close" />}
    >
      <EmptyState
        node="study-session/resume-error"
        icon="play_disabled"
        tone="error"
        title="Couldn't resume your session"
        text="We couldn't restore where you left off. Restart this session or go back to the deck."
        action={
          <View style={{ gap: t.space[3], width: t.size['3xl'] }}>
            <MxButton variant="primary" icon="refresh" block onPress={onRestart} node="study-session/resume-retry">
              Restart session
            </MxButton>
            <MxButton variant="ghost" block onPress={onBackToDeck} node="study-session/resume-back">
              Back to deck
            </MxButton>
          </View>
        }
      />
    </AppScreen>
  );
}
