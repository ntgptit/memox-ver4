/**
 * Study-session shell screen (WBS 5.5) — state matrix + interaction tests.
 * Renders each of the 10 canonical states (contract §6) and drives the stage
 * intents, exit and save-error recovery — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { StudySessionScreen } from '../study-session-screen';
import { STUDY_SESSION_STATES, type StudySessionUiState } from '../study-session-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(ui: StudySessionUiState, over: Partial<React.ComponentProps<typeof StudySessionScreen>> = {}) {
  return renderScreen(<StudySessionScreen ui={ui} {...over} />);
}

describe('StudySessionScreen — state matrix (contract §6)', () => {
  it('stage1-review: label, progress 4/25, full card, Next', () => {
    renderState('stage1-review');
    expect(screen.getByText('Stage 1 · Review')).toBeTruthy();
    expect(screen.getByText('4/25')).toBeTruthy();
    expect(screen.getByText('학교')).toBeTruthy();
    expect(screen.getByText('school')).toBeTruthy();
    expect(screen.getByText('noun · a place of learning')).toBeTruthy();
    expect(screen.getByTestId('study-session/next')).toBeTruthy();
  });

  it('stage2-match: two tile columns', () => {
    renderState('stage2-match');
    expect(screen.getByText('Stage 2 · Match')).toBeTruthy();
    expect(screen.getByTestId('study-session/match-l0')).toBeTruthy();
    expect(screen.getByTestId('study-session/match-r2')).toBeTruthy();
    expect(screen.getByText('사랑')).toBeTruthy();
  });

  it('stage3-guess: prompt + three options, no relearn note', () => {
    renderState('stage3-guess');
    expect(screen.getByText('Stage 3 · Guess')).toBeTruthy();
    expect(screen.getByTestId('study-session/option-0')).toBeTruthy();
    expect(screen.getByText('hospital')).toBeTruthy();
    expect(screen.queryByText(/not counted toward progress/)).toBeNull();
  });

  it('relearn: guess body + the not-counted warning note', () => {
    renderState('relearn');
    expect(screen.getByText(/not counted toward progress/)).toBeTruthy();
    expect(screen.getByTestId('study-session/option-0')).toBeTruthy();
  });

  it('stage4-recall: 친구 prompt + Show', () => {
    renderState('stage4-recall');
    expect(screen.getByText('친구')).toBeTruthy();
    expect(screen.getByText('Recall the meaning, then tap “Show”')).toBeTruthy();
    expect(screen.getByTestId('study-session/reveal')).toBeTruthy();
  });

  it('stage5-fill: meaning prompt + input + Help/Check', () => {
    renderState('stage5-fill');
    expect(screen.getByText('MEANING')).toBeTruthy();
    expect(screen.getByTestId('study-session/fill-input')).toBeTruthy();
    expect(screen.getByTestId('study-session/hint')).toBeTruthy();
    expect(screen.getByTestId('study-session/check')).toBeTruthy();
  });

  it('due-review: Leitner note, pair card, Relearn/Next', () => {
    renderState('due-review');
    expect(screen.getByText('Review · due cards')).toBeTruthy();
    expect(screen.getByText('10/20')).toBeTruthy();
    expect(screen.getByText(/Leitner box/)).toBeTruthy();
    expect(screen.getByTestId('study-session/due-relearn')).toBeTruthy();
    expect(screen.getByTestId('study-session/due-next')).toBeTruthy();
  });

  it('exit: the danger leave dialog overlays stage 1', () => {
    renderState('exit');
    expect(screen.getByText('Leave the session?')).toBeTruthy();
    expect(screen.getByTestId('study-session/exit-cancel')).toBeTruthy();
    expect(screen.getByTestId('study-session/exit-ok')).toBeTruthy();
  });

  it('answer-save-error: the retry dialog overlays stage 5', () => {
    renderState('answer-save-error');
    expect(screen.getByText("Couldn't save your answer")).toBeTruthy();
    expect(screen.getByTestId('study-session/save-error-retry')).toBeTruthy();
    expect(screen.getByTestId('study-session/save-error-back')).toBeTruthy();
  });

  it('resume-error: full-screen recovery with Restart / Back to deck', () => {
    renderState('resume-error');
    expect(screen.getByText("Couldn't resume your session")).toBeTruthy();
    expect(screen.getByTestId('study-session/resume-retry')).toBeTruthy();
    expect(screen.getByTestId('study-session/resume-back')).toBeTruthy();
  });

  it('every canonical state renders', () => {
    for (const ui of STUDY_SESSION_STATES) {
      const r = renderState(ui);
      r.unmount();
    }
  });

  it('dark: stage1 renders under the dark scheme', () => {
    renderScreen(<StudySessionScreen ui="stage1-review" />, 'dark');
    expect(screen.getByText('학교')).toBeTruthy();
  });
});

describe('StudySessionScreen — interactions', () => {
  it('stage intents fire (next, option, tile, reveal, check, due pair)', () => {
    const onNext = jest.fn();
    renderState('stage1-review', { onNext });
    fireEvent.press(screen.getByTestId('study-session/next'));
    expect(onNext).toHaveBeenCalledTimes(1);

    const onPickOption = jest.fn();
    renderState('stage3-guess', { onPickOption });
    fireEvent.press(screen.getByTestId('study-session/option-1'));
    expect(onPickOption).toHaveBeenCalledWith('hospital');

    const onPickTile = jest.fn();
    renderState('stage2-match', { onPickTile });
    fireEvent.press(screen.getByTestId('study-session/match-l0'));
    expect(onPickTile).toHaveBeenCalledWith('school');

    const onReveal = jest.fn();
    renderState('stage4-recall', { onReveal });
    fireEvent.press(screen.getByTestId('study-session/reveal'));
    expect(onReveal).toHaveBeenCalledTimes(1);

    const onCheck = jest.fn();
    const onFillChange = jest.fn();
    renderState('stage5-fill', { onCheck, onFillChange });
    fireEvent.changeText(screen.getByTestId('study-session/fill-input'), '학교');
    fireEvent.press(screen.getByTestId('study-session/check'));
    expect(onFillChange).toHaveBeenCalledWith('학교');
    expect(onCheck).toHaveBeenCalledTimes(1);

    const onDueNext = jest.fn();
    const onDueRelearn = jest.fn();
    renderState('due-review', { onDueNext, onDueRelearn });
    fireEvent.press(screen.getByTestId('study-session/due-next'));
    fireEvent.press(screen.getByTestId('study-session/due-relearn'));
    expect(onDueNext).toHaveBeenCalledTimes(1);
    expect(onDueRelearn).toHaveBeenCalledTimes(1);
  });

  it('exit + save-error + resume-error intents fire', () => {
    const onExitStay = jest.fn();
    const onExitLeave = jest.fn();
    renderState('exit', { onExitStay, onExitLeave });
    fireEvent.press(screen.getByTestId('study-session/exit-cancel'));
    fireEvent.press(screen.getByTestId('study-session/exit-ok'));
    expect(onExitStay).toHaveBeenCalledTimes(1);
    expect(onExitLeave).toHaveBeenCalledTimes(1);

    const onSaveErrorBack = jest.fn();
    const onSaveErrorRetry = jest.fn();
    renderState('answer-save-error', { onSaveErrorBack, onSaveErrorRetry });
    fireEvent.press(screen.getByTestId('study-session/save-error-back'));
    fireEvent.press(screen.getByTestId('study-session/save-error-retry'));
    expect(onSaveErrorBack).toHaveBeenCalledTimes(1);
    expect(onSaveErrorRetry).toHaveBeenCalledTimes(1);

    const onRestart = jest.fn();
    renderState('resume-error', { onRestart });
    fireEvent.press(screen.getByTestId('study-session/resume-retry'));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
