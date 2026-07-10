/* MemoX — Flashcard-editor local: AudioRow. A dedicated pronunciation row — deliberately
   NOT a text-field: a subtle sunken surface with a status glyph, a status line, and clear
   action button(s). Status: auto (auto-generated + Play) · none (Generate) · generating
   (spinner + Play disabled) · ready (Play + Regenerate) · error (Retry). No autoplay. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;

function AudioRow({ status = 'auto' }) {
  const { MxButton, MxIconButton } = NS;
  const play = (extra) => <MxIconButton icon="play_arrow" size="sm" node="flashcard-editor/audio-play" ariaLabel="Play pronunciation" {...extra} />;
  const MAP = {
    auto: { icon: 'graphic_eq', text: 'Auto-generated from the term', actions: play() },
    none: { icon: 'graphic_eq', text: 'No pronunciation generated', actions: <MxButton variant="secondary" size="sm" icon="graphic_eq" node="flashcard-editor/audio-generate">Generate</MxButton> },
    generating: { icon: 'graphic_eq', loading: true, text: 'Generating pronunciation…', actions: play({ disabled: true }) },
    ready: { icon: 'graphic_eq', text: 'Pronunciation ready', actions: <React.Fragment>{play()}<MxIconButton icon="refresh" size="sm" node="flashcard-editor/audio-regen" ariaLabel="Regenerate pronunciation" /></React.Fragment> },
    error: { icon: 'error', tone: 'error', text: 'Couldn’t generate pronunciation', actions: <MxButton variant="secondary" size="sm" icon="refresh" node="flashcard-editor/audio-retry">Retry</MxButton> },
  };
  const s = MAP[status] || MAP.auto;
  const fg = s.tone === 'error' ? 'var(--memox-error)' : 'var(--memox-text-secondary)';
  return (
    <div data-mx-node="flashcard-editor/audio-row" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-control)', background: 'var(--memox-surface-sunken)' }}>
      {s.loading
        ? <span className="spinner" role="status" aria-label="Generating" />
        : <span className="material-symbols-rounded" aria-hidden="true" style={{ color: fg, fontSize: 'var(--memox-icon-size-md)', flexShrink: 0 }}>{s.icon}</span>}
      <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--memox-font-size-sm)', color: fg }}>{s.text}</div>
      <div style={{ display: 'flex', gap: 'var(--memox-space-1)', flexShrink: 0 }}>{s.actions}</div>
    </div>
  );
}

window.MemoXFlashcardEditor = window.MemoXFlashcardEditor || {};
window.MemoXFlashcardEditor.AudioRow = AudioRow;
})();

export const AudioRow = (window.MemoXFlashcardEditor || {}).AudioRow;
