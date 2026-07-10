/* FilterRow — the compact library controls row: scope · filters · sort (§11). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;

function FilterRow({ active }) {
  const { MxChip } = NS;
  return (
    <div data-mx-node="library/controls" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-2)' }}>
      <MxChip label="All decks" node="library/scope" />
      <div style={{ flex: 1 }} />
      <MxChip label={active ? 'Filters · 2' : 'Filters'} icon="tune" selected={active} node="library/filters" />
      <MxChip label="A–Z" icon="swap_vert" node="library/sort" />
    </div>
  );
}

window.MemoXLibrary = Object.assign(window.MemoXLibrary || {}, { FilterRow });
})();

export const FilterRow = (window.MemoXLibrary || {}).FilterRow;
