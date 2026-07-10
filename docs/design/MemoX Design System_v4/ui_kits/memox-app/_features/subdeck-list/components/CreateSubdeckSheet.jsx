/* CreateSubdeckSheet — the create sheet for the Subdeck List screen. Subdeck-only:
   Create subdeck / Import subdecks. NEVER Add card / Import cards (that belongs to the
   Flashcard List). */
(function () {
function CreateSubdeckSheet() {
  const { Scrim, Sheet, MenuItem } = window;
  return (
    <Scrim align="end" node="subdeck-list/create-scrim">
      <Sheet title="Create" node="subdeck-list/create-sheet">
        <MenuItem icon="library_add" label="Create subdeck" node="subdeck-list/create-subdeck" />
        <MenuItem icon="account_tree" label="Import subdecks" node="subdeck-list/create-import" />
      </Sheet>
    </Scrim>
  );
}

window.MemoXSubdeckList = Object.assign(window.MemoXSubdeckList || {}, { CreateSubdeckSheet });
})();

export const CreateSubdeckSheet = (window.MemoXSubdeckList || {}).CreateSubdeckSheet;
