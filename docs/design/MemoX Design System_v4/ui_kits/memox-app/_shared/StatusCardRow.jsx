/* MemoX shared composite: StatusCardRow — term + meaning (+ optional deck line)
   with a trailing status badge. Owns the single new/due/mastered STATUS map that
   deck-detail (FlashcardRow) and search (ResultRow) previously duplicated verbatim.
   Two small render variants encode the only differences between those callers:
     - tightTerm      : deck-detail tightens the term letter-spacing
     - truncateMeaning : deck-detail ellipsis-clips the meaning to one line
   search adds a `deck` line instead. Every other pixel is shared. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxBadge } = NS;

const STATUS = {
  new: { label: 'New', tone: undefined },
  due: { label: 'Due', tone: 'error' },
  mastered: { label: 'Mastered', tone: 'success' },
};

function StatusCardRow({ term, meaning, deck, status, hidden, node, onClick, tightTerm, truncateMeaning }) {
  const s = STATUS[status];
  const termStyle = { fontWeight: 'var(--memox-font-weight-extrabold)', fontSize: 'var(--memox-font-size-md)' };
  if (tightTerm) termStyle.letterSpacing = 'var(--memox-letter-spacing-tight)';
  const meaningStyle = { fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)', marginTop: 'var(--memox-space-1)' };
  if (truncateMeaning) { meaningStyle.whiteSpace = 'nowrap'; meaningStyle.overflow = 'hidden'; meaningStyle.textOverflow = 'ellipsis'; }
  return (
    <div data-mx-node={node} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-4)', opacity: hidden ? .5 : 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-2)' }}>
          <span style={termStyle}>{term}</span>
          {hidden ? <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-font-size-base)', color: 'var(--memox-text-tertiary)' }}>visibility_off</span> : null}
        </div>
        <div style={meaningStyle}>{meaning}</div>
        {deck ? <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-tertiary)', marginTop: 'var(--memox-space-1)' }}>{deck}</div> : null}
      </div>
      <MxBadge tone={s.tone} soft>{s.label}</MxBadge>
    </div>
  );
}

window.StatusCardRow = StatusCardRow;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const StatusCardRow = window.StatusCardRow;
