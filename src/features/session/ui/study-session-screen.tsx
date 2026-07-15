/**
 * Study-session shell screen (WBS 5.5) — the 5-stage NewLearn orchestrator's
 * chrome + stage bodies. Composition mirrors the kit
 * `_features/study-session/StudySession.jsx`: nested bar (close · session-wide
 * ProgressHeader in the title slot · options) → centered primary stage label →
 * the stage body (Review/Match/Guess/Recall/Fill from the mode slices' shared
 * pieces, or the due-review pair) → Exit / AnswerSaveError overlays and the
 * full-screen ResumeErrorState. 10 states (contract §6).
 */

import { useState } from 'react';
import { Text, View } from 'react-native';

import { AppScreen, MenuItem, MxButton, MxCard, MxIconButton, Note, Scrim, Sheet, useTheme } from '@/design-system';

import { ProgressHeader } from './study-chrome';
import {
  AnswerSaveErrorDialog,
  ExitDialog,
  ResumeErrorState,
  StageFill,
  StageGuess,
  StageMatch,
  StageRecall,
  StageReview,
} from './study-session-components';
import { RECALL_TERM, STAGE_CONTENT, STUDY_SESSION_META, type StageContent, type StudySessionUiState } from './study-session-fixtures';

export interface StudySessionScreenProps {
  ui: StudySessionUiState;
  /** Stage label + session-wide progress; defaults to the kit META fixture. */
  label?: string;
  done?: number;
  total?: number;
  /** Stage-body content; defaults to the kit fixture card. */
  content?: StageContent;
  fillValue?: string;
  onFillChange?: (v: string) => void;
  onNext?: () => void;
  onPickOption?: (option: string) => void;
  onPickTile?: (text: string) => void;
  onReveal?: () => void;
  onHint?: () => void;
  onCheck?: () => void;
  onDueRelearn?: () => void;
  onDueNext?: () => void;
  onClose?: () => void;
  onExitStay?: () => void;
  onExitLeave?: () => void;
  onSaveErrorBack?: () => void;
  onSaveErrorRetry?: () => void;
  onRestart?: () => void;
  onBackToDeck?: () => void;
}

export function StudySessionScreen({
  ui,
  label,
  done,
  total,
  content = STAGE_CONTENT,
  fillValue,
  onFillChange,
  onNext,
  onPickOption,
  onPickTile,
  onReveal,
  onHint,
  onCheck,
  onDueRelearn,
  onDueNext,
  onClose,
  onExitStay,
  onExitLeave,
  onSaveErrorBack,
  onSaveErrorRetry,
  onRestart,
  onBackToDeck,
}: StudySessionScreenProps) {
  const t = useTheme();
  const [optionsOpen, setOptionsOpen] = useState(false);

  if (ui === 'resume-error') {
    return <ResumeErrorState onClose={onClose} onRestart={onRestart} onBackToDeck={onBackToDeck} />;
  }

  const meta = STUDY_SESSION_META[ui];
  const m = { label: label ?? meta.label, done: done ?? meta.done, total: total ?? meta.total };

  const body = (() => {
    switch (ui) {
      case 'stage2-match':
        return <StageMatch content={content} onPick={onPickTile} />;
      case 'stage3-guess':
      case 'relearn':
        return <StageGuess content={content} relearn={ui === 'relearn'} onPick={onPickOption} />;
      case 'stage4-recall':
        return <StageRecall term={RECALL_TERM} onReveal={onReveal} />;
      case 'stage5-fill':
      case 'answer-save-error':
        return <StageFill content={content} value={fillValue} onChange={onFillChange} onHint={onHint} onCheck={onCheck} />;
      case 'due-review':
        return (
          <>
            <Note icon="schedule" tone="warning" text="Reviewing due cards — results update the Leitner box." />
            <MxCard
              node="study-session/card"
              style={{ alignItems: 'center', gap: t.space[3], minHeight: t.size['3xl'], justifyContent: 'center' }}
            >
              <Text style={[t.font.text({ size: '3xl', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
                {content.term}
              </Text>
              <Text style={[t.font.text({ size: 'xl', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
                {content.meaning}
              </Text>
            </MxCard>
            <View style={{ flexDirection: 'row', gap: t.space[3] }}>
              <View style={{ flex: 1 }}>
                <MxButton variant="ghost" icon="replay" block onPress={onDueRelearn} node="study-session/due-relearn">
                  Relearn
                </MxButton>
              </View>
              <View style={{ flex: 1 }}>
                <MxButton variant="primary" icon="arrow_forward" block onPress={onDueNext} node="study-session/due-next">
                  Next
                </MxButton>
              </View>
            </View>
          </>
        );
      case 'stage1-review':
      case 'exit':
      default:
        return <StageReview content={content} onNext={onNext} />;
    }
  })();

  return (
    <>
      <AppScreen
        node="study-session/screen"
        variant="nested"
        leading={<MxIconButton icon="close" accessibilityLabel="Close session" onPress={onClose} node="study-session/close" />}
        main={<ProgressHeader done={m.done} total={m.total} node="study-session/progress" />}
        actions={
          <MxIconButton
            icon="more_vert"
            accessibilityLabel="Options"
            onPress={() => setOptionsOpen(true)}
            node="study-session/options"
          />
        }
      >
        <Text
          testID="study-session/stage-label"
          style={[t.font.text({ size: 'sm', weight: 'bold' }), { color: t.color.primary, textAlign: 'center' }]}
        >
          {m.label}
        </Text>
        {body}
      </AppScreen>

      {ui === 'exit' && <ExitDialog onStay={onExitStay} onLeave={onExitLeave} />}
      {ui === 'answer-save-error' && <AnswerSaveErrorDialog onBack={onSaveErrorBack} onRetry={onSaveErrorRetry} />}
      {optionsOpen && (
        <Scrim align="end" onDismiss={() => setOptionsOpen(false)} node="study-session/options-scrim">
          <Sheet title="Session options" node="study-session/options-sheet">
            <MenuItem
              icon="restart_alt"
              label="Restart session"
              onPress={() => {
                setOptionsOpen(false);
                onRestart?.();
              }}
              node="study-session/opt-restart"
            />
            <MenuItem
              icon="logout"
              label="End session"
              danger
              onPress={() => {
                setOptionsOpen(false);
                onClose?.();
              }}
              node="study-session/opt-end"
            />
          </Sheet>
        </Scrim>
      )}
    </>
  );
}
