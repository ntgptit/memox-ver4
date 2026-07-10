/* MemoX — Flashcard-editor local: DupBanner (duplicate-term warning callout). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54 || {};
const { MxButton } = NS;

function DupBanner() {
  return (
    <div data-mx-node="flashcard-editor/dup-warning" style={{ background: 'var(--memox-warning-soft)', color: 'var(--memox-on-warning-soft)', borderRadius: 'var(--memox-radius-control)', padding: 'var(--memox-space-3) var(--memox-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
      <div style={{ display: 'flex', gap: 'var(--memox-space-2)', alignItems: 'flex-start' }}>
        <span className="material-symbols-rounded" style={{ fontSize: 'var(--memox-font-size-lg)' }}>warning</span>
        <span style={{ flex: 1, fontSize: 'var(--memox-font-size-sm)', lineHeight: 'var(--memox-line-height-normal)' }}>A card “안녕하세요” already exists in this deck.</span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--memox-space-2)' }}>
        <MxButton variant="ghost" size="sm" node="flashcard-editor/dup-view">View existing</MxButton>
        <MxButton variant="primary" size="sm" node="flashcard-editor/dup-add">Add anyway</MxButton>
      </div>
    </div>
  );
}

window.MemoXFlashcardEditor = window.MemoXFlashcardEditor || {};
window.MemoXFlashcardEditor.DupBanner = DupBanner;
})();

/* ESM export so the design-system compiler indexes this kit composite.
   The kit page itself loads this file via <script type="text/babel"> (with an
   `exports` shim in index.html) and reads it from the window registry above. */
export const DupBanner = (window.MemoXFlashcardEditor || {}).DupBanner;
