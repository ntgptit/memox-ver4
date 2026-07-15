/**
 * Flashcard-list screen (WBS 4.3) — state matrix + interaction tests. Renders each
 * of the 15 canonical states (contract §6) and drives search, filters, selection,
 * the add/card-actions sheets and the delete lifecycle — the per-slice quality
 * contract (2.6).
 */

import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, type ThemeMode } from '@/design-system';
import { err, ok, storageError } from '@/shared';

import { FlashcardListScreen } from '../flashcard-list-screen';
import { FLASHCARD_LIST_FIXTURES, type FlashcardListFixtureKey } from '../flashcard-list-fixtures';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderScreen(ui: ReactElement, mode?: ThemeMode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider initialMode={mode}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

function renderState(key: FlashcardListFixtureKey, over: Partial<React.ComponentProps<typeof FlashcardListScreen>> = {}) {
  const f = FLASHCARD_LIST_FIXTURES[key];
  return renderScreen(<FlashcardListScreen data={f.data} deckTitle="Numbers & counting" initialUi={f.ui} {...over} />);
}

describe('FlashcardListScreen — state matrix (contract §6)', () => {
  it('loaded: six cards + breadcrumb + filters + aggregate + FAB', () => {
    renderState('loaded');
    expect(screen.getByText('안녕하세요')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/breadcrumb')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/filters')).toBeTruthy();
    expect(screen.getByText(/2 due · 2 mastered/)).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/add')).toBeTruthy();
  });

  it('loaded: the hidden card is marked and long meanings expose Show more', () => {
    renderState('loaded');
    expect(screen.getByTestId('flashcard-list/card-5')).toBeTruthy(); // 어렵다, hidden
    expect(screen.getAllByText('Show more').length).toBeGreaterThan(0);
  });

  it('dense: the first window renders and the tail stays virtualized (11.5)', () => {
    renderState('dense');
    expect(screen.getByTestId('flashcard-list/card-0')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/card-11')).toBeTruthy();
    // Row 16 is beyond the initial window — the virtualized body must NOT
    // eagerly mount every card of a large deck.
    expect(screen.queryByTestId('flashcard-list/card-15')).toBeNull();
  });

  it('minimum-data: a single short card renders with the aggregate', () => {
    renderState('minimum-data');
    expect(screen.getByText('감사합니다')).toBeTruthy();
    expect(screen.getByText(/0 due · 1 mastered/)).toBeTruthy();
  });

  it('long-text: the extreme term renders without crashing', () => {
    renderState('long-text');
    expect(screen.getByText('전화번호부에 등록되지 않은 사람')).toBeTruthy();
  });

  it('empty: add-your-first-card prompt with add + import CTAs', () => {
    renderState('empty');
    expect(screen.getByText('No cards yet')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/empty-add')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/empty-import')).toBeTruthy();
  });

  it('search: matching cards listed', () => {
    renderState('search');
    expect(screen.getByText('안녕하세요')).toBeTruthy(); // contains 하
    expect(screen.getByText('공부하다')).toBeTruthy();
    expect(screen.queryByText('사랑')).toBeNull();
  });

  it('no-results: empty prompt naming the query', () => {
    renderState('no-results');
    expect(screen.getByText('No cards found')).toBeTruthy();
    expect(screen.getByText('Nothing matched “zzz”. Try another term.')).toBeTruthy();
  });

  it('filter-applied: Due chip active, only due cards with the count', () => {
    renderState('filter-applied');
    expect(screen.getByText('2 due cards')).toBeTruthy();
    expect(screen.getByText('안녕하세요')).toBeTruthy();
    expect(screen.queryByText('감사합니다')).toBeNull();
  });

  it('selection: 2 selected announced in the bar', () => {
    renderState('selection');
    expect(screen.getByText('2 selected')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/sel-card-0')).toBeTruthy();
  });

  it('add-sheet: card-only items — no Create subdeck', () => {
    renderState('add-sheet');
    expect(screen.getByTestId('flashcard-list/add-card')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/add-import')).toBeTruthy();
    expect(screen.queryByText('Create subdeck')).toBeNull();
  });

  it('card-actions: the sheet is titled by the card term with the four actions', () => {
    renderState('card-actions');
    expect(screen.getByTestId('flashcard-list/actions-sheet')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/action-edit')).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/action-delete')).toBeTruthy();
  });

  it('delete-confirm: the dialog names the card', () => {
    renderState('delete-confirm');
    expect(screen.getByText('Delete this card?')).toBeTruthy();
    expect(screen.getByText(/will be removed from this deck/)).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/delete-ok')).toBeTruthy();
  });

  it('loading: skeletons, no card terms', () => {
    renderState('loading');
    expect(screen.queryByText('안녕하세요')).toBeNull();
  });

  it('offline: banner + retry, cards still listed', () => {
    renderState('offline');
    expect(screen.getByTestId('flashcard-list/offline-banner')).toBeTruthy();
    expect(screen.getByText('안녕하세요')).toBeTruthy();
  });

  it('error: recoverable prompt with retry', () => {
    renderState('error');
    expect(screen.getByText("Couldn't load cards")).toBeTruthy();
    expect(screen.getByTestId('flashcard-list/retry')).toBeTruthy();
  });

  it('dark: loaded renders under the dark scheme', () => {
    const f = FLASHCARD_LIST_FIXTURES.loaded;
    renderScreen(<FlashcardListScreen data={f.data} deckTitle="Numbers & counting" initialUi={f.ui} />, 'dark');
    expect(screen.getByText('안녕하세요')).toBeTruthy();
  });
});

describe('FlashcardListScreen — interactions', () => {
  it('tapping a card opens its actions sheet; Edit fires with the id', () => {
    const onEditCard = jest.fn();
    renderState('loaded', { onEditCard });
    fireEvent.press(screen.getByTestId('flashcard-list/card-1'));
    fireEvent.press(screen.getByTestId('flashcard-list/action-edit'));
    expect(onEditCard).toHaveBeenCalledWith('c-thanks');
  });

  it('FAB opens the add sheet; Add card fires the intent', () => {
    const onAddCard = jest.fn();
    renderState('loaded', { onAddCard });
    fireEvent.press(screen.getByTestId('flashcard-list/add'));
    fireEvent.press(screen.getByTestId('flashcard-list/add-card'));
    expect(onAddCard).toHaveBeenCalledTimes(1);
  });

  it('filter chips filter live', () => {
    renderState('loaded');
    fireEvent.press(screen.getByTestId('flashcard-list/filter-3')); // Mastered
    expect(screen.getByText('2 mastered cards')).toBeTruthy();
    expect(screen.queryByText('안녕하세요')).toBeNull();
    fireEvent.press(screen.getByTestId('flashcard-list/filter-0'));
    expect(screen.getByText('안녕하세요')).toBeTruthy();
  });

  it('search: open → type → results → clear returns to browse', () => {
    renderState('loaded');
    fireEvent.press(screen.getByTestId('flashcard-list/search-open'));
    fireEvent.changeText(screen.getByLabelText('Search cards'), '사랑');
    expect(screen.getByText('사랑')).toBeTruthy();
    expect(screen.queryByText('맛있다')).toBeNull();
    fireEvent.press(screen.getByTestId('flashcard-list/search-clear'));
    expect(screen.getByTestId('flashcard-list/breadcrumb')).toBeTruthy();
  });

  it('Show more expands the clamped meaning in place', () => {
    renderState('loaded');
    fireEvent.press(screen.getAllByText('Show more')[0]);
    expect(screen.getByText('Show less')).toBeTruthy();
  });

  it('delete lifecycle: success closes; failure stays with the message', async () => {
    const onDeleteCard = jest.fn(async () => ok(undefined));
    renderState('delete-confirm', { onDeleteCard });
    await act(async () => {
      fireEvent.press(screen.getByTestId('flashcard-list/delete-ok'));
    });
    expect(onDeleteCard).toHaveBeenCalledWith('c-hello');
    await waitFor(() => expect(screen.queryByText('Delete this card?')).toBeNull());

    const failing = async () => err(storageError('Could not delete the card.'));
    renderState('delete-confirm', { onDeleteCard: failing });
    await act(async () => {
      fireEvent.press(screen.getByTestId('flashcard-list/delete-ok'));
    });
    await waitFor(() => expect(screen.getByTestId('flashcard-list/delete-error')).toBeTruthy());
  });
});
