/* MemoX — Game-typing local: InputBox (answer field; tone tints the border). */
(function () {

function InputBox({ content, tone, placeholder }) {
  const border = tone === 'correct' ? 'var(--memox-stroke-emphasis) solid var(--memox-success)' : tone === 'wrong' ? 'var(--memox-stroke-emphasis) solid var(--memox-error)' : 'var(--memox-stroke-hairline) solid var(--memox-divider)';
  return (
    <div data-mx-node="game-typing/input" style={{ border, borderRadius: 'var(--memox-radius-control)', background: 'var(--memox-surface)', padding: 'var(--memox-space-4)', minHeight: 'var(--memox-size-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 'var(--memox-font-size-xl)', fontWeight: 'var(--memox-font-weight-extrabold)', lineHeight: 'var(--memox-line-height-tight)', overflowWrap: 'anywhere' }}>
      {content != null ? content : <span style={{ color: 'var(--memox-text-tertiary)', fontSize: 'var(--memox-font-size-base)', fontWeight: 'var(--memox-font-weight-semibold)' }}>{placeholder}</span>}
    </div>
  );
}

window.MemoXGameTyping = window.MemoXGameTyping || {};
window.MemoXGameTyping.InputBox = InputBox;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const InputBox = (window.MemoXGameTyping || {}).InputBox;
