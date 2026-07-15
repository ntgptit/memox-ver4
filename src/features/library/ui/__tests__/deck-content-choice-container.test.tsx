/**
 * Deck-content-choice container (WBS 12.1) — the `/deck/new/content` sentinel
 * CREATES a deck: with a language pair present, choosing content persists a new
 * deck (onChosen gets the CREATED id); with none, the flow routes to add-pair
 * instead of erroring; an existing deck keeps the set-content path.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/design-system';
import type { Deck } from '@/features/library/domain';

import { DeckContentChoiceContainer } from '../deck-content-choice-container';

const mockDecks = new Map<string, Deck>();
let mockPairs: { id: string }[] = [];

jest.mock('@/features/library/data', () => {
  const { ok, err, notFoundError } = jest.requireActual('@/shared');
  return {
  createLibraryRepositories: async () => ({
    decks: {
      subscribe: () => () => {},
      getById: async (id: string) => (mockDecks.has(id) ? ok(mockDecks.get(id)) : err(notFoundError('Deck'))),
      list: async () => ok([...mockDecks.values()]),
      save: async (d: Deck) => {
        mockDecks.set(d.id, d);
        return ok(d);
      },
      remove: async () => ok(undefined),
    },
    subdecks: {},
    languagePairs: {
      subscribe: () => () => {},
      getById: async () => err(notFoundError('LanguagePair')),
      list: async () => ok(mockPairs),
      save: async () => err(notFoundError('LanguagePair')),
      remove: async () => ok(undefined),
    },
  }),
  };
});

const metrics = { frame: { x: 0, y: 0, width: 390, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };

function renderNew(props: { onChosen?: jest.Mock; onNeedLanguagePair?: jest.Mock } = {}) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>
        <DeckContentChoiceContainer deckId="new" {...props} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

async function nameAndChoose(title: string) {
  await waitFor(() => expect(screen.getByTestId('deck-content-choice/cards')).toBeTruthy());
  fireEvent.changeText(screen.getByTestId('deck-content-choice/name'), title);
  fireEvent.press(screen.getByTestId('deck-content-choice/cards'));
}

beforeEach(() => {
  mockDecks.clear();
  mockPairs = [];
});

describe('DeckContentChoiceContainer — new-deck flow (12.1)', () => {
  it('with a language pair, choosing content CREATES the deck and reports its real id', async () => {
    mockPairs = [{ id: 'lp1' }];
    const onChosen = jest.fn();
    renderNew({ onChosen });
    await nameAndChoose('TOPIK I — Vocabulary');
    await waitFor(() => expect(onChosen).toHaveBeenCalled());
    const [organisation, createdId] = onChosen.mock.calls[0];
    expect(organisation).toBe('cards');
    expect(createdId).not.toBe('new');
    expect(mockDecks.get(createdId)?.title).toBe('TOPIK I — Vocabulary');
    expect(mockDecks.get(createdId)?.languagePairId).toBe('lp1');
  });

  it('with NO language pair, routes to add-pair and creates nothing', async () => {
    const onChosen = jest.fn();
    const onNeedLanguagePair = jest.fn();
    renderNew({ onChosen, onNeedLanguagePair });
    await nameAndChoose('TOPIK I — Vocabulary');
    await waitFor(() => expect(onNeedLanguagePair).toHaveBeenCalled());
    expect(onChosen).not.toHaveBeenCalled();
    expect(mockDecks.size).toBe(0);
  });
});
