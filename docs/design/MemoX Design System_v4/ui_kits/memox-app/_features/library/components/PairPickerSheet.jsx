/* MemoX — Library local: PairPickerSheet (language-pair bottom sheet). */
(function () {

function PairPickerSheet() {
  return (
    <window.Sheet title="Language pair" node="library/pair-sheet">
      <window.MenuItem icon="check" label="한국어 → English" node="library/pair-ko-en" selected />
      <window.MenuItem icon="translate" label="日本語 → English" node="library/pair-ja-en" />
      <window.MenuItem icon="add" label="Add language" node="library/pair-add" />
    </window.Sheet>
  );
}

window.MemoXLibrary = window.MemoXLibrary || {};
window.MemoXLibrary.PairPickerSheet = PairPickerSheet;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const PairPickerSheet = (window.MemoXLibrary || {}).PairPickerSheet;
