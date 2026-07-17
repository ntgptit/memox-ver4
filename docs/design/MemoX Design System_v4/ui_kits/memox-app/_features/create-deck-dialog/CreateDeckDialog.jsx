/* MemoX — Create Deck DIALOG (spec §8, §10). For users who already have a learning context
   (second deck onward). A CENTERED modal dialog (window.FormDialog — caps at the frame and scrolls
   its own body, never a bottom sheet): name + language pair, optional description, single primary
   CTA "Create deck". Creates an EMPTY deck (no card/nested/Default-view). Root picks a language
   pair; nested inherits the parent's pair (read-only) and shows "Inside <parent>".
   Node prefix: create-deck-dialog/*.
   States: root-default · root-multi-pair · root-missing-pair · nested · optional-expanded ·
   validation · duplicate-root · duplicate-sibling · submitting · submit-failure · long-name ·
   keyboard-open. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxButton, MxCard } = NS;
const { FormDialog } = window;

const LONG_NAME = 'Advanced Korean Honorific Speech Registers and Formal Writing — TOPIK II';
const LONG_DESC = 'Vocabulary, grammar and set phrases for formal and honorific speech, covering business, academic and ceremonial registers across the full TOPIK II band.';

// A dialog field: label + a single sunken box holding the value/placeholder (static in the kit),
// long text truncates with an ellipsis. Optional error line + trailing affordance (select chevron).
function DField({ label, value, placeholder, error, trailing, muted, node }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-2)' }}>
      <div style={{ fontSize: 'var(--memox-font-size-sm)', fontWeight: 'var(--memox-font-weight-semibold)', color: 'var(--memox-text-secondary)' }}>{label}</div>
      <div data-mx-node={node} style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)', boxSizing: 'border-box', minHeight: 'var(--memox-touch-min)', padding: 'var(--memox-space-2) var(--memox-space-4)', borderRadius: 'var(--memox-radius-control)', background: 'var(--memox-surface-sunken)', border: error ? 'var(--memox-stroke-emphasis) solid var(--memox-error)' : 'var(--memox-stroke-hairline) solid var(--memox-divider)' }}>
        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: value ? (muted ? 'var(--memox-text-secondary)' : 'var(--memox-text)') : 'var(--memox-text-tertiary)' }}>{value || placeholder}</span>
        {trailing}
      </div>
      {error ? <div className="field-group__error" data-mx-node={node + '-error'} role="alert">{error}</div> : null}
    </div>
  );
}

const chevron = <span className="material-symbols-rounded" style={{ color: 'var(--memox-text-secondary)' }}>expand_more</span>;

function CreateDeckDialog({ state = 'root-default' }) {
  const nested = state === 'nested' || state === 'duplicate-sibling';
  const optional = state === 'optional-expanded';
  const submitting = state === 'submitting';
  const failure = state === 'submit-failure';
  const longText = state === 'long-name';
  const keyboard = state === 'keyboard-open';

  const nameError =
    state === 'validation' ? 'Give your deck a name.'
    : state === 'duplicate-root' ? 'A deck with this name already exists in your Library.'
    : state === 'duplicate-sibling' ? 'A deck with this name already exists here.'
    : null;
  const pairError = state === 'root-missing-pair' ? 'Choose a language pair.' : null;
  const pairValue = state === 'root-missing-pair' ? '' : 'Korean → Vietnamese';
  const name = state === 'validation' ? '' : nested ? 'Grammar' : longText ? LONG_NAME : 'Korean TOPIK II';

  // Dimmed context behind the dialog (root: Library; nested: parent deck).
  const backBar = <MxContextualAppBar variant={nested ? 'nested' : 'root'} node="create-deck-dialog/back-appbar" title={nested ? 'Korean TOPIK I' : 'Library'} />;
  const backdrop = (
    <MxScaffold node="create-deck-dialog/screen" appBar={backBar}>
      {[0, 1, 2].map((i) => <MxCard key={i} padding="sm"><div style={{ height: 'var(--memox-space-8)' }} /></MxCard>)}
    </MxScaffold>
  );

  const actions = (
    <React.Fragment>
      <MxButton variant="ghost" disabled={submitting} node="create-deck-dialog/cancel">Cancel</MxButton>
      <MxButton variant="primary" icon={submitting ? undefined : 'add'} disabled={submitting} node="create-deck-dialog/create">
        {submitting ? 'Creating…' : 'Create deck'}
      </MxButton>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {backdrop}
      <FormDialog title="Create deck" subtitle={nested ? 'Inside Korean TOPIK I' : 'Inside Library'}
        node="create-deck-dialog/dialog" scrimNode="create-deck-dialog/scrim" keyboard={keyboard} actions={actions}>
        {failure ? (
          <window.ActionCallout node="create-deck-dialog/error" tone="error" icon="error"
            text="Couldn’t create the deck. Your information is still here."
            action={<MxButton variant="primary" size="sm" node="create-deck-dialog/retry">Try again</MxButton>} />
        ) : null}

        <DField label="Deck name *" value={name} placeholder="Name your deck" error={nameError} node="create-deck-dialog/name" />

        {nested
          ? <DField label="Language pair" value="Korean → Vietnamese" muted trailing={<span style={{ fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>Inherited</span>} node="create-deck-dialog/pair-inherited" />
          : <DField label="Language pair *" value={pairValue} placeholder="Choose a language pair" error={pairError} trailing={chevron} node="create-deck-dialog/pair" />}

        {optional || longText
          ? <DField label="Description" value={longText ? LONG_DESC : 'Vocabulary and grammar for TOPIK II'} node="create-deck-dialog/description" />
          : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 'var(--memox-font-size-sm)', fontWeight: 'var(--memox-font-weight-semibold)', color: 'var(--memox-text-secondary)' }}>Add a description</div>
              <NS.MxLink size="sm" trailingIcon={null} node="create-deck-dialog/optional-toggle">Add</NS.MxLink>
            </div>
          )}
      </FormDialog>
    </React.Fragment>
  );
}

window.CreateDeckDialog = CreateDeckDialog;
})();

export const CreateDeckDialog = window.CreateDeckDialog;
