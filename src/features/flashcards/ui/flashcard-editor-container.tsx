/**
 * Flashcard-editor container (WBS 4.4) — resolves the repositories, builds the
 * DECK-DRIVEN language context (deck title + its language pair's learning/native
 * names), wires create/edit persistence with duplicate handling ("Add anyway"
 * saves the domain-built card directly), and speaks the term via expo-speech.
 */

import { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

import { err, isErr, storageError, type AppError, type Result } from '@/shared';
import { randomId, systemClock } from '@/shared/runtime';
import { createLibraryRepositories } from '@/features/library/data';
import { createFlashcardRepositories } from '@/features/flashcards/data';

import { createCard, editCardUseCase, makeCard } from '../domain';
import {
  EDITOR_DECK,
  BLANK_VALUES,
  type EditorDeckContext,
  type EditorValues,
  type FlashcardEditorUiState,
} from './flashcard-editor-fixtures';
import { FlashcardEditorScreen, type FlashcardEditorScreenProps } from './flashcard-editor-screen';
import { useFlashcardEditor, type FlashcardEditorDeps, type EditorPhase } from './use-flashcard-editor';

export interface FlashcardEditorContainerProps
  extends Pick<FlashcardEditorScreenProps, 'onCancel' | 'onViewExisting'> {
  deckId: string;
  subdeckId?: string;
  /** Present in edit mode. */
  cardId?: string;
  /** After a successful save without keep-adding. */
  onSaved?: () => void;
}

interface Wiring {
  deck: EditorDeckContext;
  initial: EditorValues;
  deps: FlashcardEditorDeps;
  editing: boolean;
}

function phaseToUi(phase: EditorPhase, editing: boolean): FlashcardEditorUiState {
  switch (phase) {
    case 'duplicate':
      return 'duplicate';
    case 'audio-generating':
      return 'audio-generating';
    case 'submitting':
      return 'submitting';
    case 'submit-error':
      return 'submit-error';
    case 'submit-success':
      return 'submit-success';
    case 'idle':
    default:
      return editing ? 'edit' : 'create';
  }
}

export function FlashcardEditorContainer({
  deckId,
  subdeckId,
  cardId,
  onSaved,
  ...props
}: FlashcardEditorContainerProps) {
  const [wiring, setWiring] = useState<Wiring | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([createLibraryRepositories(), createFlashcardRepositories()]).then(async ([lib, flash]) => {
      // 12.4: entry points without a deck in context (dashboard/library quick
      // actions) resolve the library's first deck — same default as import/export.
      let targetDeckId = deckId;
      if (targetDeckId === '') {
        const decks = await lib.decks.list();
        if (!isErr(decks) && decks.value.length > 0) targetDeckId = decks.value[0].id;
      }
      // Deck-driven labels: deck title + its language pair names.
      const deckR = await lib.decks.getById(targetDeckId);
      const deckRow = isErr(deckR) ? null : deckR.value;
      const pairR = deckRow === null ? null : await lib.languagePairs.getById(deckRow.languagePairId);
      const pair = pairR === null || isErr(pairR) ? null : pairR.value;
      const deck: EditorDeckContext = {
        ...EDITOR_DECK,
        name: deckRow?.title ?? EDITOR_DECK.name,
        termLabel: pair?.learning ?? EDITOR_DECK.termLabel,
        meaningLabel: pair?.native ?? EDITOR_DECK.meaningLabel,
        altLabel: 'Other',
        altLang: '',
      };

      let initial = BLANK_VALUES;
      if (cardId !== undefined) {
        const cardR = await flash.cards.getById(cardId);
        if (!isErr(cardR)) {
          const c = cardR.value;
          initial = { ...BLANK_VALUES, term: c.term, meaning: c.meaning, tags: c.tags };
        }
      }

      const create = createCard({ cards: flash.cards, ids: randomId, clock: systemClock });
      const edit = editCardUseCase({ cards: flash.cards, clock: systemClock });

      const save = async (values: EditorValues, force: boolean): Promise<Result<unknown, AppError>> => {
        try {
          if (cardId !== undefined) {
            return await edit.execute({
              cardId,
              term: values.term,
              meaning: values.meaning,
              tags: values.tags,
              audioRef: null,
            });
          }
          if (force) {
            // Add anyway: domain-build (validation intact), skip the dup rejection.
            const built = makeCard({
              id: randomId(),
              deckId: targetDeckId,
              subdeckId: subdeckId ?? null,
              term: values.term,
              meaning: values.meaning,
              tags: values.tags,
              audioRef: null,
              createdAt: systemClock(),
            });
            if (isErr(built)) return built;
            return await flash.cards.save(built.value);
          }
          return await create.execute({
            deckId: targetDeckId,
            subdeckId: subdeckId ?? null,
            term: values.term,
            meaning: values.meaning,
            tags: values.tags,
            audioRef: null,
          });
        } catch {
          return err(storageError('Could not save the card.'));
        }
      };

      if (alive) {
        setWiring({
          deck,
          initial,
          editing: cardId !== undefined,
          deps: {
            save,
            speak: async (term, lang) => {
              Speech.speak(term, lang === '' ? undefined : { language: lang });
            },
          },
        });
      }
    });
    return () => {
      alive = false;
    };
  }, [deckId, subdeckId, cardId]);

  if (wiring === null) {
    return <FlashcardEditorScreen deck={EDITOR_DECK} values={BLANK_VALUES} ui="create" {...props} />;
  }
  return <LoadedEditor wiring={wiring} onSaved={onSaved} {...props} />;
}

function LoadedEditor({
  wiring,
  onSaved,
  ...props
}: Pick<FlashcardEditorScreenProps, 'onCancel' | 'onViewExisting'> & { wiring: Wiring; onSaved?: () => void }) {
  const ctrl = useFlashcardEditor(wiring.initial, wiring.deps);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    if (ctrl.phase === 'submit-success' && onSaved !== undefined) {
      onSaved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire the exit intent once per success
  }, [ctrl.phase]);

  return (
    <FlashcardEditorScreen
      deck={wiring.deck}
      values={ctrl.values}
      editing={wiring.editing}
      ui={phaseToUi(ctrl.phase, wiring.editing)}
      errors={ctrl.errors}
      dirty={ctrl.dirty || wiring.editing}
      onChange={ctrl.change}
      onSave={ctrl.save}
      onAddAnyway={ctrl.addAnyway}
      onRetrySave={ctrl.save}
      onPlayAudio={() => ctrl.playAudio(wiring.deck.termLang)}
      onAddTranslation={() => setShowTranslation(true)}
      onRemoveTranslation={() => setShowTranslation(false)}
      showTranslation={showTranslation}
      {...props}
    />
  );
}
