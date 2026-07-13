/**
 * Deck-settings controller (WBS 4.5) — loads the deck + language pairs and wires the
 * lifecycle actions: rename / move (3.1 use cases), reset progress (transactional
 * 4.5 data op), delete (3.1). Deps injected so tests drive it with in-memory fakes.
 */

import { useEffect, useState } from 'react';

import {
  renameDeckUseCase,
  moveDeckUseCase,
  deleteDeck,
  type DeckRepository,
} from '@/features/library/domain';
import type { LanguagePairRepository } from '@/features/languages/domain';
import type { CardRepository } from '@/features/flashcards/domain';
import { resetDeckProgress } from '@/features/session/data';
import type { SqlDatabase } from '@/db/sql';
import { isErr, err, unexpectedError, type Result, type AppError, type Clock } from '@/shared';

import type { LanguagePairOption } from './deck-settings-screen';

export interface DeckSettingsDeps {
  decks: DeckRepository;
  languagePairs: LanguagePairRepository;
  cards: CardRepository;
  db: SqlDatabase;
  clock: Clock;
}

export interface DeckSettingsController {
  deckTitle: string;
  currentPairId: string | undefined;
  languagePairs: readonly LanguagePairOption[];
  rename: (title: string) => Promise<Result<unknown, AppError>>;
  move: (pairId: string) => Promise<Result<unknown, AppError>>;
  reset: () => Promise<Result<unknown, AppError>>;
  remove: () => Promise<Result<unknown, AppError>>;
}

export function useDeckSettings(deckId: string, deps: DeckSettingsDeps | null): DeckSettingsController {
  const [deckTitle, setDeckTitle] = useState('');
  const [currentPairId, setCurrentPairId] = useState<string | undefined>(undefined);
  const [languagePairs, setLanguagePairs] = useState<readonly LanguagePairOption[]>([]);

  useEffect(() => {
    if (!deps) return;
    let alive = true;
    void deps.decks.getById(deckId).then((res) => {
      if (alive && !isErr(res)) {
        setDeckTitle(res.value.title);
        setCurrentPairId(res.value.languagePairId);
      }
    });
    void deps.languagePairs.list().then((res) => {
      if (alive && !isErr(res)) {
        setLanguagePairs(res.value.map((p) => ({ id: p.id, label: `${p.learning} → ${p.native}` })));
      }
    });
    return () => {
      alive = false;
    };
  }, [deps, deckId]);

  const rename: DeckSettingsController['rename'] = async (title) => {
    if (!deps) return err(unexpectedError('Not ready yet.'));
    const res = await renameDeckUseCase({ decks: deps.decks, clock: deps.clock }).execute({ deckId, title });
    if (!isErr(res)) setDeckTitle(res.value.title);
    return res;
  };

  const move: DeckSettingsController['move'] = async (pairId) => {
    if (!deps) return err(unexpectedError('Not ready yet.'));
    const res = await moveDeckUseCase({ decks: deps.decks, clock: deps.clock }).execute({
      deckId,
      languagePairId: pairId,
    });
    if (!isErr(res)) setCurrentPairId(pairId);
    return res;
  };

  const reset: DeckSettingsController['reset'] = async () => {
    if (!deps) return err(unexpectedError('Not ready yet.'));
    const cards = await deps.cards.listByDeck(deckId);
    if (isErr(cards)) return cards;
    return resetDeckProgress(
      deps.db,
      cards.value.map((c) => c.id),
    );
  };

  const remove: DeckSettingsController['remove'] = async () => {
    if (!deps) return err(unexpectedError('Not ready yet.'));
    return deleteDeck({ decks: deps.decks }).execute(deckId);
  };

  return { deckTitle, currentPairId, languagePairs, rename, move, reset, remove };
}
