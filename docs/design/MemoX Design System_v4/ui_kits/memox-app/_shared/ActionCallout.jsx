/* MemoX shared composite: ActionCallout — a soft-tinted inline banner (icon +
   text) with an optional trailing action. Fills the gap window.Note leaves: Note
   is icon+text only, but import (dup-warning) and mode-picker (not-enough) render
   the same tonal row with an optional button. `tone` picks the *-soft / on-*-soft
   pair. (The stacked 2-button flashcard-editor DupBanner and the gap-2 semibold
   account-sync banner are different shapes and stay local.) */
(function () {

function ActionCallout({ tone = 'warning', node, icon, text, title, action, dismissNode }) {
  const wrap = { background: 'var(--memox-' + tone + '-soft)', color: 'var(--memox-on-' + tone + '-soft)', borderRadius: 'var(--memox-radius-control)', padding: 'var(--memox-space-3) var(--memox-space-4)', display: 'flex', gap: 'var(--memox-space-3)' };
  // ≥44×44 hit area (--memox-touch-min) even though the glyph is ~24px; negative margins keep it
  // from bloating the banner past its own padding.
  const dismiss = dismissNode
    ? <button type="button" aria-label="Dismiss" data-mx-node={dismissNode} style={{ flexShrink: 0, boxSizing: 'border-box', minWidth: 'var(--memox-touch-min)', minHeight: 'var(--memox-touch-min)', margin: 'calc(-1 * var(--memox-space-2)) calc(-1 * var(--memox-space-2)) calc(-1 * var(--memox-space-2)) 0', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><span className="material-symbols-rounded">close</span></button>
    : null;
  // No title → the original single-row layout (parity-neutral for existing callers).
  if (!title) {
    return (
      <div data-mx-node={node} style={{ ...wrap, alignItems: 'center' }}>
        <span className="material-symbols-rounded">{icon}</span>
        <span style={{ flex: 1, fontSize: 'var(--memox-font-size-sm)' }}>{text}</span>
        {action}{dismiss}
      </div>
    );
  }
  // Titled variant — a heading line above the body, optional trailing action + dismiss.
  return (
    <div data-mx-node={node} style={{ ...wrap, alignItems: 'flex-start' }}>
      <span className="material-symbols-rounded">{icon}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-1)' }}>
        <span style={{ fontWeight: 'var(--memox-font-weight-bold)', fontSize: 'var(--memox-font-size-base)' }}>{title}</span>
        <span style={{ fontSize: 'var(--memox-font-size-sm)' }}>{text}</span>
        {action ? <div style={{ marginTop: 'var(--memox-space-2)' }}>{action}</div> : null}
      </div>
      {dismiss}
    </div>
  );
}

window.ActionCallout = ActionCallout;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const ActionCallout = window.ActionCallout;
