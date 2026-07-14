/**
 * Review-mode screen (WBS 6.1) — state matrix + interaction tests. Renders each
 * of the 6 canonical states (contract §6) and drives prev/next, the inline edit
 * lifecycle, audio and the end-panel CTAs — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { ReviewModeScreen } from '../review-mode-screen';
import { REVIEW_MODE_FIXTURES, type ReviewModeFixtureKey } from '../review-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: ReviewModeFixtureKey, over: Partial<React.ComponentProps<typeof ReviewModeScreen>> = {}) {
  const f = REVIEW_MODE_FIXTURES[key];
  return renderScreen(<ReviewModeScreen data={f.data} ui={f.ui} {...over} />);
}

describe('ReviewModeScreen — state matrix (contract §6)', () => {
  it('browsing: progress, meaning card, term prompt, swipe row', () => {
    renderState('browsing');
    expect(screen.getByText('Review')).toBeTruthy();
    expect(screen.getByText('7/20')).toBeTruthy();
    expect(screen.getByText('school')).toBeTruthy();
    expect(screen.getByText('학교')).toBeTruthy();
    expect(screen.getByText('Swipe to continue')).toBeTruthy();
    expect(screen.getByTestId('review-mode/prev')).toBeTruthy();
    expect(screen.getByTestId('review-mode/next')).toBeTruthy();
  });

  it('editing: emphasis input seeded with the meaning + Cancel/Save', () => {
    renderState('editing');
    expect(screen.getByTestId('review-mode/edit-input').props.value).toBe('school');
    expect(screen.getByTestId('review-mode/edit-cancel')).toBeTruthy();
    expect(screen.getByTestId('review-mode/edit-save')).toBeTruthy();
  });

  it('audio: the prompt card renders its playing state', () => {
    renderState('audio');
    expect(screen.getByText('학교')).toBeTruthy();
    expect(screen.getByTestId('review-mode/prompt')).toBeTruthy();
  });

  it('loading: skeletons, no card content', () => {
    renderState('loading');
    expect(screen.queryByText('학교')).toBeNull();
  });

  it('error: recoverable prompt with retry', () => {
    renderState('error');
    expect(screen.getByText("Couldn't load review")).toBeTruthy();
    expect(screen.getByTestId('review-mode/retry')).toBeTruthy();
  });

  it('end: all-reviewed panel with Study now / Back to deck', () => {
    renderState('end');
    expect(screen.getByText('All reviewed')).toBeTruthy();
    expect(screen.getByTestId('review-mode/study-now')).toBeTruthy();
    expect(screen.getByTestId('review-mode/back-deck')).toBeTruthy();
  });

  it('dark: browsing renders under the dark scheme', () => {
    const f = REVIEW_MODE_FIXTURES.browsing;
    renderScreen(<ReviewModeScreen data={f.data} ui={f.ui} />, 'dark');
    expect(screen.getByText('학교')).toBeTruthy();
  });
});

describe('ReviewModeScreen — interactions', () => {
  it('prev/next and audio fire', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();
    const onPlayAudio = jest.fn();
    renderState('browsing', { onPrev, onNext, onPlayAudio });
    fireEvent.press(screen.getByTestId('review-mode/prev'));
    fireEvent.press(screen.getByTestId('review-mode/next'));
    fireEvent.press(screen.getByTestId('review-mode/audio'));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPlayAudio).toHaveBeenCalledTimes(1);
  });

  it('edit lifecycle: start → type → save emits the draft; close cancels', () => {
    const onEditStart = jest.fn();
    renderState('browsing', { onEditStart });
    fireEvent.press(screen.getByTestId('review-mode/edit'));
    expect(onEditStart).toHaveBeenCalledTimes(1);

    const onEditSave = jest.fn();
    const onEditCancel = jest.fn();
    renderState('editing', { onEditSave, onEditCancel });
    fireEvent.changeText(screen.getByTestId('review-mode/edit-input'), 'school; academy');
    fireEvent.press(screen.getByTestId('review-mode/edit-save'));
    expect(onEditSave).toHaveBeenCalledWith('school; academy');
    fireEvent.press(screen.getByTestId('review-mode/edit'));
    expect(onEditCancel).toHaveBeenCalledTimes(1);
  });

  it('end CTAs fire', () => {
    const onStudyNow = jest.fn();
    const onBackToDeck = jest.fn();
    renderState('end', { onStudyNow, onBackToDeck });
    fireEvent.press(screen.getByTestId('review-mode/study-now'));
    fireEvent.press(screen.getByTestId('review-mode/back-deck'));
    expect(onStudyNow).toHaveBeenCalledTimes(1);
    expect(onBackToDeck).toHaveBeenCalledTimes(1);
  });
});
