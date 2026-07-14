/**
 * Subdeck-list screen (WBS 3.5) — state matrix + interaction tests. Renders each of
 * the 13 canonical states (contract §6) and drives search, selection, and the
 * create/actions/play sheets — the per-slice quality contract (2.6).
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';

import { SubdeckListScreen } from '../subdeck-list-screen';
import { SUBDECK_LIST_FIXTURES, SUBDECK_TRAIL_DEEP, type SubdeckListFixtureKey } from '../subdeck-list-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: SubdeckListFixtureKey, over: Partial<React.ComponentProps<typeof SubdeckListScreen>> = {}) {
  const f = SUBDECK_LIST_FIXTURES[key];
  return renderScreen(
    <SubdeckListScreen
      data={f.data}
      deckTitle={key === 'deep' ? 'Irregular verbs' : 'Korean TOPIK I'}
      trail={key === 'deep' ? SUBDECK_TRAIL_DEEP : undefined}
      initialUi={f.ui}
      {...over}
    />,
  );
}

describe('SubdeckListScreen — state matrix (contract §6)', () => {
  it('loaded: five subdecks + breadcrumb + section aggregate + FAB', () => {
    renderState('loaded');
    expect(screen.getByText('Greetings & introductions')).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/breadcrumb')).toBeTruthy();
    expect(screen.getByText(/217 cards · 23 due/)).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/create')).toBeTruthy();
  });

  it('dense: 20 rows render; long titles clamp not crash', () => {
    renderState('dense');
    expect(screen.getAllByText('Formal & Honorific Speech Registers — Advanced Workbook').length).toBe(2);
    expect(screen.getByTestId('subdeck-list/subdeck-19')).toBeTruthy();
  });

  it('deep: the collapsed breadcrumb keeps root + last two levels', () => {
    renderState('deep');
    expect(screen.getByText('Library')).toBeTruthy();
    expect(screen.getByText('…')).toBeTruthy();
    expect(screen.getByText('Verbs')).toBeTruthy();
    expect(screen.getAllByText('Irregular verbs').length).toBe(2); // appbar title + current crumb
    expect(screen.queryByText('Grammar')).toBeNull();
  });

  it('empty: create-subdeck prompt', () => {
    renderState('empty');
    expect(screen.getByText('No subdecks yet')).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/empty-create')).toBeTruthy();
  });

  it('search: matching subdecks with the match count', () => {
    renderState('search');
    expect(screen.getByText('2 subdecks match')).toBeTruthy();
    expect(screen.getByText('Greetings & introductions')).toBeTruthy();
    expect(screen.getByText('Family & relationships')).toBeTruthy();
    expect(screen.queryByText('Food & dining')).toBeNull();
  });

  it('no-results: empty prompt with clear CTA', () => {
    renderState('no-results');
    expect(screen.getByText('No subdecks for “zzz”')).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/clear')).toBeTruthy();
  });

  it('selection: 2 selected announced in the bar', () => {
    renderState('selection');
    expect(screen.getByText('2 selected')).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/sel-all')).toBeTruthy();
  });

  it('create-sheet: subdeck-only items — no Add card', () => {
    renderState('create-sheet');
    expect(screen.getByTestId('subdeck-list/create-subdeck')).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/create-import')).toBeTruthy();
    expect(screen.queryByText('Add card')).toBeNull();
  });

  it('subdeck-actions: the sheet is titled by the subdeck with the four actions', () => {
    renderState('subdeck-actions');
    expect(screen.getByTestId('subdeck-list/actions-sheet')).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/action-study')).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/action-delete')).toBeTruthy();
  });

  it('play: the shared DeckPlaySheet with the three study entries', () => {
    renderState('play');
    expect(screen.getByText('Study Greetings & introductions')).toBeTruthy();
    expect(screen.getByTestId('deck-play/session')).toBeTruthy();
    expect(screen.getByTestId('deck-play/single-mode')).toBeTruthy();
    expect(screen.getByTestId('deck-play/listen')).toBeTruthy();
  });

  it('loading: skeleton rows, no subdeck titles', () => {
    renderState('loading');
    expect(screen.queryByText('Greetings & introductions')).toBeNull();
  });

  it('offline: banner + retry, subdecks still listed', () => {
    renderState('offline');
    expect(screen.getByTestId('subdeck-list/offline-banner')).toBeTruthy();
    expect(screen.getByText('Greetings & introductions')).toBeTruthy();
  });

  it('error: recoverable prompt with retry', () => {
    renderState('error');
    expect(screen.getByText("Couldn't load subdecks")).toBeTruthy();
    expect(screen.getByTestId('subdeck-list/retry')).toBeTruthy();
  });

  it('dark: loaded renders under the dark scheme', () => {
    const f = SUBDECK_LIST_FIXTURES.loaded;
    renderScreen(<SubdeckListScreen data={f.data} deckTitle="Korean TOPIK I" initialUi={f.ui} />, 'dark');
    expect(screen.getByText('Greetings & introductions')).toBeTruthy();
  });
});

describe('SubdeckListScreen — interactions', () => {
  it('tapping a subdeck opens it', () => {
    const onOpenSubdeck = jest.fn();
    renderState('loaded', { onOpenSubdeck });
    fireEvent.press(screen.getByTestId('subdeck-list/subdeck-0'));
    expect(onOpenSubdeck).toHaveBeenCalledWith('s-greet');
  });

  it('the study bolt opens the play sheet; Study session fires onStartSession', () => {
    const onStartSession = jest.fn();
    renderState('loaded', { onStartSession });
    fireEvent.press(screen.getByTestId('subdeck-list/sub-study-1'));
    expect(screen.getByText('Study Numbers & counting')).toBeTruthy();
    fireEvent.press(screen.getByTestId('deck-play/session'));
    expect(onStartSession).toHaveBeenCalledWith('s-numbers');
  });

  it('FAB opens the create sheet; Create subdeck fires the intent', () => {
    const onCreateSubdeck = jest.fn();
    renderState('loaded', { onCreateSubdeck });
    fireEvent.press(screen.getByTestId('subdeck-list/create'));
    fireEvent.press(screen.getByTestId('subdeck-list/create-subdeck'));
    expect(onCreateSubdeck).toHaveBeenCalledTimes(1);
  });

  it('search: open → type → live filter → clear returns to browse', () => {
    renderState('loaded');
    fireEvent.press(screen.getByTestId('subdeck-list/search-open'));
    fireEvent.changeText(screen.getByLabelText('Search subdecks'), 'food');
    expect(screen.getByText('1 subdecks match')).toBeTruthy();
    fireEvent.press(screen.getByTestId('subdeck-list/search-clear'));
    expect(screen.getByTestId('subdeck-list/breadcrumb')).toBeTruthy();
  });

  it('long-press enters selection; select-all selects everything', () => {
    renderState('loaded');
    fireEvent(screen.getByTestId('subdeck-list/subdeck-0'), 'longPress');
    expect(screen.getByText('1 selected')).toBeTruthy();
    fireEvent.press(screen.getByTestId('subdeck-list/sel-all'));
    expect(screen.getByText('5 selected')).toBeTruthy();
  });

  it('actions sheet: delete fires with the active subdeck id', () => {
    const onDeleteSubdeck = jest.fn();
    renderState('subdeck-actions', { onDeleteSubdeck });
    fireEvent.press(screen.getByTestId('subdeck-list/action-delete'));
    expect(onDeleteSubdeck).toHaveBeenCalledWith('s-greet');
  });

  it('error retry fires onRetry', () => {
    const onRetry = jest.fn();
    renderState('error', { onRetry });
    fireEvent.press(screen.getByTestId('subdeck-list/retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
