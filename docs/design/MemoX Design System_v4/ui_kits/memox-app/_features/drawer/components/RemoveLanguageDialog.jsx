/* MemoX — Drawer local: RemoveLanguageDialog (remove-pair confirm overlay).
   Composes the shared window.ConfirmDialog (_shared/ConfirmDialog.jsx). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxButton } = NS;

function RemoveLanguageDialog() {
  return (
    <window.ConfirmDialog align="center" scrimNode="drawer/remove-scrim"
      icon="delete" tone="error" title="Remove 한국어 → English?"
      text="All decks and cards for this pair will be deleted. This can't be undone."
      dialogNode="drawer/remove-dialog"
      actions={<React.Fragment>
        <MxButton variant="ghost" block node="drawer/remove-cancel">Cancel</MxButton>
        <MxButton variant="primary" danger block node="drawer/remove-ok">Remove</MxButton>
      </React.Fragment>} />
  );
}

window.MemoXDrawer = window.MemoXDrawer || {};
window.MemoXDrawer.RemoveLanguageDialog = RemoveLanguageDialog;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const RemoveLanguageDialog = (window.MemoXDrawer || {}).RemoveLanguageDialog;
