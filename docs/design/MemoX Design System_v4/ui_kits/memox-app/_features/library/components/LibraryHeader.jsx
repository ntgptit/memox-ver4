/* MemoX — Library local: LibraryHeader (app bar, shared by every state). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxAppBar, MxIconButton } = NS;

function LibraryHeader() {
  return (
    <MxAppBar title="Library" node="library/appbar"
      leading={<MxIconButton icon="menu" node="library/menu-open" />}
      trailing={<MxIconButton icon="more_vert" node="library/overflow" />} />
  );
}

window.MemoXLibrary = window.MemoXLibrary || {};
window.MemoXLibrary.LibraryHeader = LibraryHeader;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const LibraryHeader = (window.MemoXLibrary || {}).LibraryHeader;
