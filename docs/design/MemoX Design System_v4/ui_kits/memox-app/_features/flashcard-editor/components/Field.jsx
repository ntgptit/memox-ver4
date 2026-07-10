/* MemoX — Flashcard-editor local: Field. A labeled text field used ONLY for real user
   input (Term, Meaning, Translation, notes). Anatomy: label · input surface · supporting
   or error text. Visual states: default · filled · focused (accent border) · error (error
   border + message) · disabled (sunken, dimmed). NOT for audio/settings/status rows. */
(function () {
function Field({ label, value, placeholder, multiline, error, supporting, required, disabled, focused, node, trailing }) {
  const emphasis = focused || error;
  const borderColor = error ? 'var(--memox-error)' : focused ? 'var(--memox-accent)' : 'var(--memox-divider)';
  return (
    <div data-mx-node={node} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-2)', opacity: disabled ? 'var(--memox-opacity-muted)' : 1 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-1)', fontSize: 'var(--memox-font-size-sm)', fontWeight: 'var(--memox-font-weight-bold)', color: 'var(--memox-text-secondary)' }}>
        {label}{required ? <span style={{ color: 'var(--memox-error)' }} aria-hidden="true">*</span> : null}
      </label>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--memox-space-2)', minHeight: multiline ? 'var(--memox-size-md)' : 'var(--memox-touch-min)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-control)', background: disabled ? 'var(--memox-surface-sunken)' : 'var(--memox-surface)', border: (emphasis ? 'var(--memox-stroke-emphasis)' : 'var(--memox-stroke-hairline)') + ' solid ' + borderColor }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--memox-font-size-base)', color: value ? 'var(--memox-text)' : 'var(--memox-text-tertiary)', lineHeight: 'var(--memox-line-height-normal)', whiteSpace: multiline ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', overflowWrap: 'anywhere' }}>{value || placeholder}</span>
        {trailing}
      </div>
      {error
        ? <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-error)' }}>{error}</div>
        : supporting
          ? <div style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-tertiary)' }}>{supporting}</div>
          : null}
    </div>
  );
}

window.MemoXFlashcardEditor = window.MemoXFlashcardEditor || {};
window.MemoXFlashcardEditor.Field = Field;
})();

export const Field = (window.MemoXFlashcardEditor || {}).Field;
