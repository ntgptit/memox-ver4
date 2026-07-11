/* MemoX shared composite: ActionCallout — a soft-tinted inline banner (icon +
   text) with an optional trailing action. Fills the gap window.Note leaves: Note
   is icon+text only, but import (dup-warning) and mode-picker (not-enough) render
   the same tonal row with an optional button. `tone` picks the *-soft / on-*-soft
   pair. (The stacked 2-button flashcard-editor DupBanner and the gap-2 semibold
   account-sync banner are different shapes and stay local.) */
(function () {

function ActionCallout({ tone = 'warning', node, icon, text, action }) {
  return (
    <div data-mx-node={node} style={{ background: 'var(--memox-' + tone + '-soft)', color: 'var(--memox-on-' + tone + '-soft)', borderRadius: 'var(--memox-radius-control)', padding: 'var(--memox-space-3) var(--memox-space-4)', display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)' }}>
      <span className="material-symbols-rounded">{icon}</span>
      <span style={{ flex: 1, fontSize: 'var(--memox-font-size-sm)' }}>{text}</span>
      {action}
    </div>
  );
}

window.ActionCallout = ActionCallout;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const ActionCallout = window.ActionCallout;
