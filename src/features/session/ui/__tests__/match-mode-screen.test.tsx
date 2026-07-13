/**
 * Match-mode screen (WBS 6.2) — state matrix + interactions. playing / selected /
 * correct / wrong / almost / complete / dark, plus tapping tiles and matched-lock.
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { MatchModeScreen, type MatchModeScreenProps } from '../match-mode-screen';
import { MATCH_FIXTURES, type MatchFixtureKey } from '../match-mode-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function props(key: MatchFixtureKey, over: Partial<MatchModeScreenProps> = {}): MatchModeScreenProps {
  return { ...MATCH_FIXTURES[key], onTap: jest.fn(), ...over };
}

describe('MatchModeScreen — states', () => {
  it('playing: both columns render five tiles each', () => {
    renderScreen(<MatchModeScreen {...props('playing')} />);
    expect(screen.getByText('time')).toBeTruthy();
    expect(screen.getByText('학교')).toBeTruthy();
    expect(screen.getByTestId('match-mode/left-0')).toBeTruthy();
    expect(screen.getByTestId('match-mode/right-4')).toBeTruthy();
  });

  it('selected: the picked tile announces selected', () => {
    renderScreen(<MatchModeScreen {...props('selected')} />);
    expect(screen.getByLabelText('love (selected)')).toBeTruthy();
  });

  it('correct: the matched pair is announced', () => {
    renderScreen(<MatchModeScreen {...props('correct')} />);
    expect(screen.getByLabelText('love (matched)')).toBeTruthy();
    expect(screen.getByLabelText('사랑 (matched)')).toBeTruthy();
  });

  it('wrong: the mismatch is announced', () => {
    renderScreen(<MatchModeScreen {...props('wrong')} />);
    expect(screen.getByLabelText('love (no match)')).toBeTruthy();
  });

  it('almost: three pairs are matched', () => {
    renderScreen(<MatchModeScreen {...props('almost')} />);
    // done reflects three matched pairs
    expect(screen.getByText('3 / 5')).toBeTruthy();
  });

  it('complete: round-complete', () => {
    renderScreen(<MatchModeScreen {...props('complete')} />);
    expect(screen.getByText('Round complete!')).toBeTruthy();
  });

  it('dark: playing renders under the dark scheme', () => {
    renderScreen(<MatchModeScreen {...props('playing')} />, 'dark');
    expect(screen.getByText('time')).toBeTruthy();
  });
});

describe('MatchModeScreen — interactions', () => {
  it('tapping a left tile fires onTap with L + cardId', () => {
    const onTap = jest.fn();
    renderScreen(<MatchModeScreen {...props('playing', { onTap })} />);
    fireEvent.press(screen.getByTestId('match-mode/left-0'));
    expect(onTap).toHaveBeenCalledWith('L', 'c1');
  });

  it('tapping a right tile fires onTap with R + cardId', () => {
    const onTap = jest.fn();
    renderScreen(<MatchModeScreen {...props('playing', { onTap })} />);
    fireEvent.press(screen.getByTestId('match-mode/right-0')); // reversed → c5
    expect(onTap).toHaveBeenCalledWith('R', 'c5');
  });

  it('a matched tile is not tappable', () => {
    const onTap = jest.fn();
    renderScreen(<MatchModeScreen {...props('almost', { onTap })} />);
    fireEvent.press(screen.getByTestId('match-mode/left-0')); // matched in the almost fixture
    expect(onTap).not.toHaveBeenCalled();
  });
});
