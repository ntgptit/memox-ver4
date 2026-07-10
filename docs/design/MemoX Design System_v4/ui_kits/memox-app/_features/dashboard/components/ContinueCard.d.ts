export interface ContinueCardProps {
  /**
   * The due-deck descriptor rendered in the row (via DeckRow): icon + tone + name
   * + meta + due + progress. In Flutter (`ContinueDeckCard`) the deck model is
   * passed as `deck` with `icon` / `tone` taken as separate params.
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

/** Dashboard "Continue studying" row: one due deck. In Flutter this is `ContinueDeckCard`. */
export function ContinueCard(props: ContinueCardProps): JSX.Element;
