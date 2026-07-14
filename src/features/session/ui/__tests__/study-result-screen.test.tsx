/**
 * Study-result screen (WBS 7.4) — state matrix + interaction tests. Renders each
 * of the 7 canonical states (contract §6) and drives the per-kind CTAs, the
 * review-mistakes link and the finalize-error retry — the per-slice quality
 * contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { StudyResultScreen } from '../study-result-screen';
import { STUDY_RESULT_FIXTURES, type StudyResultFixtureKey } from '../study-result-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: StudyResultFixtureKey, over: Partial<React.ComponentProps<typeof StudyResultScreen>> = {}) {
  const f = STUDY_RESULT_FIXTURES[key];
  return renderScreen(<StudyResultScreen data={f.data} {...over} />);
}

describe('StudyResultScreen — state matrix (contract §6)', () => {
  it('standard: hero, stat trio, review-mistakes link, streak card, CTA pair', () => {
    renderState('standard');
    expect(screen.getByText('Session complete')).toBeTruthy();
    expect(screen.getByText('You reviewed 24 cards this session.')).toBeTruthy();
    expect(screen.getByText('88%')).toBeTruthy();
    expect(screen.getByText('6:30')).toBeTruthy();
    expect(screen.getByText('Review mistakes')).toBeTruthy();
    expect(screen.getByText('12 days')).toBeTruthy();
    expect(screen.getByText('14/20 min')).toBeTruthy();
    expect(screen.getByText('Keep studying')).toBeTruthy();
    expect(screen.getByText('Back to library')).toBeTruthy();
  });

  it('goal-met: celebration copy, +1 streak, met badge, full goal', () => {
    renderState('goal-met');
    expect(screen.getByText('Daily goal reached!')).toBeTruthy();
    expect(screen.getByText('Streak +1 → 13 days in a row.')).toBeTruthy();
    expect(screen.getByText(/Daily goal completed!/)).toBeTruthy();
    expect(screen.getByText(/\+1 today/)).toBeTruthy();
    expect(screen.getByText('22/20 min')).toBeTruthy();
  });

  it('goal-missed: almost-there copy + Keep going / Later CTAs', () => {
    renderState('goal-missed');
    expect(screen.getByText('Almost there!')).toBeTruthy();
    expect(screen.getByText('6 more minutes to hit today’s goal.')).toBeTruthy();
    expect(screen.getByText('Keep going')).toBeTruthy();
    expect(screen.getByText('Later')).toBeTruthy();
  });

  it('many-wrong: shaky-words copy, review CTA with the count, NO mistakes link', () => {
    renderState('many-wrong');
    expect(screen.getByText('A few shaky words')).toBeTruthy();
    expect(screen.getByText('You missed 8 cards — review now to remember them longer.')).toBeTruthy();
    expect(screen.getByText('Review 8 cards')).toBeTruthy();
    expect(screen.queryByText('Review mistakes')).toBeNull();
  });

  it('finalizing: saving hero + skeleton stats, no CTA', () => {
    renderState('finalizing');
    expect(screen.getByText('Saving your results…')).toBeTruthy();
    expect(screen.queryByText('Keep studying')).toBeNull();
  });

  it('retry-finalize: retrying copy', () => {
    renderState('retry-finalize');
    expect(screen.getByText('Retrying…')).toBeTruthy();
  });

  it('finalize-error: recoverable empty state with Retry / Not now', () => {
    renderState('finalize-error');
    expect(screen.getByText("Couldn't save your results")).toBeTruthy();
    expect(screen.getByTestId('study-result/finalize-retry')).toBeTruthy();
    expect(screen.getByTestId('study-result/finalize-later')).toBeTruthy();
  });

  it('dark: standard renders under the dark scheme', () => {
    const f = STUDY_RESULT_FIXTURES.standard;
    renderScreen(<StudyResultScreen data={f.data} />, 'dark');
    expect(screen.getByText('Session complete')).toBeTruthy();
  });
});

describe('StudyResultScreen — interactions', () => {
  it('standard CTAs fire continue/library; the link fires review-mistakes', () => {
    const onContinue = jest.fn();
    const onLibrary = jest.fn();
    const onReviewMistakes = jest.fn();
    renderState('standard', { onContinue, onLibrary, onReviewMistakes });
    fireEvent.press(screen.getByTestId('study-result/continue'));
    fireEvent.press(screen.getByTestId('study-result/library'));
    fireEvent.press(screen.getByTestId('study-result/review-mistakes'));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onLibrary).toHaveBeenCalledTimes(1);
    expect(onReviewMistakes).toHaveBeenCalledTimes(1);
  });

  it('goal-missed fires later; many-wrong fires review-wrong', () => {
    const onLater = jest.fn();
    renderState('goal-missed', { onLater });
    fireEvent.press(screen.getByTestId('study-result/later'));
    expect(onLater).toHaveBeenCalledTimes(1);

    const onReviewWrong = jest.fn();
    renderState('many-wrong', { onReviewWrong });
    fireEvent.press(screen.getByTestId('study-result/review-wrong'));
    expect(onReviewWrong).toHaveBeenCalledTimes(1);
  });

  it('finalize-error fires retry and not-now', () => {
    const onRetryFinalize = jest.fn();
    const onFinalizeLater = jest.fn();
    renderState('finalize-error', { onRetryFinalize, onFinalizeLater });
    fireEvent.press(screen.getByTestId('study-result/finalize-retry'));
    fireEvent.press(screen.getByTestId('study-result/finalize-later'));
    expect(onRetryFinalize).toHaveBeenCalledTimes(1);
    expect(onFinalizeLater).toHaveBeenCalledTimes(1);
  });
});
