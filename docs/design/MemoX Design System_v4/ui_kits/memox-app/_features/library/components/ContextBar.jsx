/* MemoX — Library local: ContextBar (search + language-pair + sort row). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxIconButton } = NS;

function ContextBar() {
  return (
    <div data-mx-node="library/context" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-2)' }}>
      <MxIconButton icon="search" node="library/search-btn" />
      <button data-mx-node="library/pair" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--memox-space-2)', border: 'var(--memox-stroke-hairline) solid var(--memox-divider)', background: 'var(--memox-surface)', borderRadius: 'var(--memox-radius-pill)', padding: 'var(--memox-space-3) var(--memox-space-4)', font: 'inherit', fontWeight: 'var(--memox-font-weight-bold)', cursor: 'pointer', color: 'inherit' }}>
        한국어 <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-icon-size-sm)', color: 'var(--memox-text-tertiary)' }}>swap_horiz</span> English
        <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-icon-size-sm)', color: 'var(--memox-text-tertiary)' }}>expand_more</span>
      </button>
      <MxIconButton icon="swap_vert" node="library/sort-btn" />
    </div>
  );
}

window.MemoXLibrary = window.MemoXLibrary || {};
window.MemoXLibrary.ContextBar = ContextBar;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const ContextBar = (window.MemoXLibrary || {}).ContextBar;
