/* MemoX — Card Editor. A focused create/update form for ONE flashcard; single primary
   action = Save. Shared focused app bar (Close · title · Save). Groups by priority:
   Card content → Additional translation → Pronunciation → More options.
   9 states: create · edit · validation · duplicate · additional-translation ·
   audio-generating · submitting · submit-error · submit-success.
   (Dirty-cancel uses the shared ConfirmDialog — same reference as Deck Settings.)
   Feature-local components: components/{Field,DupBanner,AudioRow}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxButton, MxIconButton, MxSwitch } = NS;
const { Field, DupBanner, AudioRow } = window.MemoXFlashcardEditor;

const DECK = 'Beginner Grammar';

function SectionLabel({ children }) {
  return <div style={{ fontSize: 'var(--memox-font-size-xs)', fontWeight: 'var(--memox-font-weight-bold)', letterSpacing: 'var(--memox-letter-spacing-wide)', textTransform: 'uppercase', color: 'var(--memox-text-tertiary)' }}>{children}</div>;
}

// Recoverable inline banner (submit error / success) — same soft-tone treatment as the
// Library offline/error banners; carries an optional action.
function Banner({ tone, icon, text, action, node }) {
  const bg = tone === 'error' ? 'var(--memox-error-soft)' : tone === 'success' ? 'var(--memox-success-soft)' : 'var(--memox-warning-soft)';
  const fg = tone === 'error' ? 'var(--memox-on-error-soft)' : tone === 'success' ? 'var(--memox-on-success-soft)' : 'var(--memox-on-warning-soft)';
  return (
    <div data-mx-node={node} role="status" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-card)', background: bg, color: fg }}>
      <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: 'var(--memox-icon-size-md)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--memox-font-size-sm)', lineHeight: 'var(--memox-line-height-normal)' }}>{text}</div>
      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
    </div>
  );
}

// Compact settings row (flat sunken surface, switch trailing) — deliberately low visual
// weight so it never competes with Term/Meaning. No icon tile, no elevation.
function VisibilityRow({ disabled }) {
  const [on, setOn] = React.useState(false);
  return (
    <div data-mx-node="flashcard-editor/visibility" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-4)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-control)', background: 'var(--memox-surface-sunken)', opacity: disabled ? 'var(--memox-opacity-muted)' : 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 'var(--memox-font-weight-semibold)', fontSize: 'var(--memox-font-size-base)' }}>Hide during study</div>
        <div style={{ marginTop: 'var(--memox-space-1)', fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>Excluded from study and review sessions.</div>
      </div>
      <MxSwitch checked={on} onChange={setOn} disabled={disabled} node="flashcard-editor/visibility-switch" ariaLabel="Hide during study" />
    </div>
  );
}

function FlashcardEditor({ state = 'create' }) {
  const blank = state === 'create' || state === 'validation';
  const invalid = state === 'validation';
  const submitting = state === 'submitting';
  const success = state === 'submit-success';
  const submitError = state === 'submit-error';
  const title = state === 'create' ? 'New card' : 'Edit card';
  const disabledForm = submitting;                                   // freeze editable controls while saving
  const saveDisabled = state === 'create' || invalid || submitting || success; // never active on blank/invalid/pristine
  const saveLabel = submitting ? 'Saving…' : success ? 'Done' : 'Save';

  const term = blank ? '' : '안녕하세요';
  const meaning = blank ? '' : 'Hello (formal)';

  // Focused app bar: Close · title · Save. Save width is reserved (>= "Saving…") so the
  // centered title never shifts across form/submit states.
  const bar = (
    <MxContextualAppBar variant="focused" node="flashcard-editor/appbar" title={title}
      leading={<MxIconButton icon="close" size="sm" node="flashcard-editor/cancel" ariaLabel="Cancel" disabled={submitting} />}
      actions={<div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 'var(--memox-size-lg)' }}>
        <MxButton variant="primary" size="sm" disabled={saveDisabled} node="flashcard-editor/save">{saveLabel}</MxButton>
      </div>} />
  );

  return (
    <MxScaffold node="flashcard-editor/screen" appBar={bar}>
      {/* Deck context — light, not a card, never outweighs the title */}
      <div data-mx-node="flashcard-editor/deck-context" style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>
        <span style={{ color: 'var(--memox-text-tertiary)' }}>Deck · </span><span style={{ fontWeight: 'var(--memox-font-weight-semibold)' }}>{DECK}</span>
      </div>

      {state === 'duplicate' ? <DupBanner /> : null}
      {submitError ? <Banner node="flashcard-editor/save-error" tone="error" icon="error_outline" text="Couldn’t save the card. Your changes are still here." action={<MxButton variant="secondary" size="sm" node="flashcard-editor/save-retry">Try again</MxButton>} /> : null}
      {success ? <Banner node="flashcard-editor/save-success" tone="success" icon="check_circle" text="Card saved." /> : null}

      {/* CARD CONTENT — the primary focus (Term + Meaning grouped tightly) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
        <Field label="Term (Korean)" required node="flashcard-editor/term"
          value={term} placeholder="Enter a term" error={invalid ? 'Enter a term.' : null} disabled={disabledForm} />
        <Field label="Meaning (English)" required multiline node="flashcard-editor/meaning"
          value={meaning} placeholder="Enter the meaning" error={invalid ? 'Enter a meaning.' : null} disabled={disabledForm} />
      </div>

      {/* ADDITIONAL TRANSLATION — text action by default; expands to a language-scoped field */}
      {state === 'additional-translation'
        ? <Field label="Translation (Vietnamese)" node="flashcard-editor/translation"
            value="Xin chào" placeholder="Enter a translation"
            trailing={<MxIconButton icon="close" size="sm" node="flashcard-editor/translation-remove" ariaLabel="Remove translation" />} />
        : <div><MxButton variant="ghost" size="sm" icon="add" disabled={disabledForm} node="flashcard-editor/add-translation">Add translation</MxButton></div>}

      {/* PRONUNCIATION — dedicated audio row, never a text field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
        <SectionLabel>Pronunciation</SectionLabel>
        <AudioRow status={state === 'audio-generating' ? 'generating' : 'auto'} />
      </div>

      {/* MORE OPTIONS — grammatical gender lives here only for languages that have it;
          the Korean fixture has none, so it is not shown. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
        <SectionLabel>More options</SectionLabel>
        <VisibilityRow disabled={disabledForm} />
      </div>
    </MxScaffold>
  );
}

window.FlashcardEditor = FlashcardEditor;
})();

export const FlashcardEditor = window.FlashcardEditor;
