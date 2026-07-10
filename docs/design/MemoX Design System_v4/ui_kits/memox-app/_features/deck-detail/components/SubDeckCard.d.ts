export interface SubDeckCardProps {
  /**
   * The sub-deck descriptor rendered in the row (via DeckRow): icon + tone + name
   * + meta + due + progress. In Flutter (`SubDeckCard`) the deck model is passed
   * as `info` with `tone` taken as a separate param.
   */
  deck: {
    icon: string;
    tone: string;
    name: string;
    meta: string;
    due: number;
    progress: number;
  };
  /** Row position — the kit uses it only to build the export node id. */
  index: number;
}

/** Deck-detail sub-deck row: one nested deck in the SUB-DECKS list. */
export function SubDeckCard(props: SubDeckCardProps): JSX.Element;
