/**
 * Deck-detail delete-a-card confirm overlay — composes the shared ConfirmDialog.
 *
 * The kit renders this as a **static fixture** (hardcoded copy + node ids) and
 * exposes **no props**. In Flutter it is the top-level helper
 * `showDeleteCardDialog(context, term:) → Future<bool>` — a function, not a widget
 * class — so there is no constructor to diff (recorded as a flutter-helper
 * exception).
 */
export interface DeleteConfirmDialogProps {}

export function DeleteConfirmDialog(): JSX.Element;
