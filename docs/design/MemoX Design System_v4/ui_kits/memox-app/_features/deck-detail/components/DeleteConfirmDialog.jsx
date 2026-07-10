/* MemoX — Deck-detail local: DeleteConfirmDialog (delete-a-card confirm overlay).
   Composes the shared window.ConfirmDialog (_shared/ConfirmDialog.jsx). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxButton } = NS;

function DeleteConfirmDialog() {
  return (
    <window.ConfirmDialog align="center" scrimNode="deck-detail/delete-scrim"
      icon="delete" tone="error" title="Delete this card?"
      text="The card “안녕하세요” will be removed from this deck. This can't be undone."
      dialogNode="deck-detail/delete-dialog"
      actions={<React.Fragment>
        <MxButton variant="ghost" block node="deck-detail/delete-cancel">Cancel</MxButton>
        <MxButton variant="primary" danger block node="deck-detail/delete-ok">Delete</MxButton>
      </React.Fragment>} />
  );
}

window.MemoXDeckDetail = window.MemoXDeckDetail || {};
window.MemoXDeckDetail.DeleteConfirmDialog = DeleteConfirmDialog;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const DeleteConfirmDialog = (window.MemoXDeckDetail || {}).DeleteConfirmDialog;
