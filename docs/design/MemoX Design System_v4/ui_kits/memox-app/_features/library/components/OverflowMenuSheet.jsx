/* MemoX — Library local: OverflowMenuSheet (library overflow bottom sheet). */
(function () {

function OverflowMenuSheet() {
  return (
    <window.Sheet title="Library" node="library/overflow-sheet">
      <window.MenuItem icon="upload_file" label="Import cards" node="library/of-import" />
      <window.MenuItem icon="download" label="Export cards" node="library/of-export" />
      <window.MenuItem icon="checklist" label="Select multiple" node="library/of-select" />
      <window.MenuItem icon="settings" label="Settings" node="library/of-settings" />
    </window.Sheet>
  );
}

window.MemoXLibrary = window.MemoXLibrary || {};
window.MemoXLibrary.OverflowMenuSheet = OverflowMenuSheet;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const OverflowMenuSheet = (window.MemoXLibrary || {}).OverflowMenuSheet;
