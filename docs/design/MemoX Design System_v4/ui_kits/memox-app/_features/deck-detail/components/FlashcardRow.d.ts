import type { ReactNode } from 'react';

export interface FlashcardRowProps {
  /** Term / headword. */
  term: ReactNode;
  /** Meaning / translation. */
  meaning: ReactNode;
  /** Optional deck line. */
  deck?: ReactNode;
  /** Learning status — drives the trailing badge. */
  status: 'new' | 'due' | 'mastered';
  /** Dim the row and show a hidden glyph. */
  hidden?: boolean;
  onClick?: () => void;
}

/**
 * Deck-detail flashcard row: forwards the shared StatusCardRow props (with the
 * term tightened + meaning ellipsis-clipped). In Flutter these fields are composed
 * into a single `card` model — recorded as flutter-idiom exceptions.
 */
export function FlashcardRow(props: FlashcardRowProps): JSX.Element;
