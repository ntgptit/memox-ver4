/**
 * Deck-detail deck-level actions bottom sheet.
 *
 * The kit renders this as a **static fixture** (hardcoded Rename / Move / Reset /
 * Delete items) and exposes **no props**. The Flutter `DeckMenu` wires `onMove` /
 * `onReset` / `onDelete` (Rename is an inline text dialog with no v1 use case) —
 * recorded as fixture-parameterized exceptions. `onReset` opens the
 * `reset-confirm` dialog and runs the reset-deck-progress use case.
 */
export interface DeckMenuProps {}

export function DeckMenu(): JSX.Element;
