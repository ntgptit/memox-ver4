export interface GameOptionProps {
  /**
   * The game descriptor: id + icon (Material Symbols name) + name + description.
   * Flutter's `GameOption` decomposes this into typed `icon` / `name` /
   * `description` params (recorded as flutter-idiom exceptions).
   */
  g: { id: string; icon: string; name: string; desc: string };
  /** Dim + disable the row (not enough words). Flutter disables via null onPressed. */
  disabled?: boolean;
}

/** Game-picker choice row: a tinted icon tile, the game name + description, a chevron. */
export function GameOption(props: GameOptionProps): JSX.Element;
