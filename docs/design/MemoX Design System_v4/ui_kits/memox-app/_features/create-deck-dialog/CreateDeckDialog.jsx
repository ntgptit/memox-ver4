/* MemoX — Create Deck DIALOG (spec §8, §10). For users who already have a learning context
   (second deck onward). A modal Sheet over the current surface: name + language pair, optional
   description, single primary CTA "Create deck". Creates an EMPTY deck (no card/nested/Default-view).
   Root variant picks a language pair; nested variant inherits the parent's pair (read-only) and
   shows "Inside <parent>". Node prefix: create-deck-dialog/*.
   States: root-default · root-multi-pair · root-missing-pair · nested · optional-expanded ·
   validation · duplicate-root · duplicate-sibling · submitting · submit-failure · long-name ·
   keyboard-open. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxButton, MxTextField, MxLink, MxCard } = NS;
const { Scrim, Sheet, SectionLabel } = window;

const LONG_NAME = 'Advanced Korean Honorific Speech Registers and Formal Writing — TOPIK II';
const LONG_DESC = 'Vocabulary, grammar and set phrases for formal and honorific speech, covering business, academic and ceremonial registers across the full TOPIK II band.';

// bare MxTextField seated in the kit control container (MxTextField is bare)
function Field({ label, value, placeholder, error, autoFocus, node }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-2)' }}>
      <SectionLabel>{label}</SectionLabel>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 'var(--memox-touch-min)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-control)', background: 'var(--memox-surface)', border: error ? 'var(--memox-stroke-emphasis) solid var(--memox-error)' : 'var(--memox-stroke-hairline) solid var(--memox-divider)' }}>
        <MxTextField placeholder={placeholder} defaultValue={value} autoFocus={autoFocus} node={node} />
      </div>
      {error ? <div className="field-group__error" data-mx-node={node + '-error'} role="alert">{error}</div> : null}
    </div>
  );
}

function PairSelect({ value, error, node }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-2)' }}>
      <SectionLabel>Language pair *</SectionLabel>
      <div data-mx-node={node} className="card--interactive" style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-3)', minHeight: 'var(--memox-touch-min)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-control)', background: 'var(--memox-surface)', border: error ? 'var(--memox-stroke-emphasis) solid var(--memox-error)' : 'var(--memox-stroke-hairline) solid var(--memox-divider)', color: value ? 'var(--memox-text)' : 'var(--memox-text-secondary)' }}>
        <span style={{ flex: 1 }}>{value || 'Choose a language pair'}</span>
        <span className="material-symbols-rounded" style={{ color: 'var(--memox-text-secondary)' }}>expand_more</span>
      </div>
      {error ? <div className="field-group__error" data-mx-node={node + '-error'} role="alert">{error}</div> : null}
    </div>
  );
}

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

  return (
    <React.Fragment>
      {backdrop}
      <Scrim align="end" node="create-deck-dialog/scrim">
        <Sheet title="Create deck" node="create-deck-dialog/sheet">
          <div style={{ marginTop: 'calc(-1 * var(--memox-space-2))', marginBottom: 'var(--memox-space-2)', fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }} data-mx-node="create-deck-dialog/context">
            {nested ? 'Inside Korean TOPIK I' : 'Inside Library'}
          </div>

          {failure ? (
            <window.ActionCallout node="create-deck-dialog/error" tone="error" icon="error"
              text="Couldn’t create the deck. Your information is still here."
              action={<MxButton variant="primary" size="sm" node="create-deck-dialog/retry">Try again</MxButton>} />
          ) : null}

          <SectionLabel>REQUIRED</SectionLabel>
          <Field label="Deck name *" value={name} placeholder="Name your deck" error={nameError} autoFocus node="create-deck-dialog/name" />

          {nested ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-1)' }}>
              <SectionLabel>Language pair</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-2)', minHeight: 'var(--memox-touch-min)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-control)', background: 'var(--memox-surface-sunken)', color: 'var(--memox-text-secondary)' }} data-mx-node="create-deck-dialog/pair-inherited">
                <span style={{ flex: 1 }}>Korean → Vietnamese</span>
                <span style={{ fontSize: 'var(--memox-font-size-sm)' }}>Inherited</span>
              </div>
            </div>
          ) : (
            <PairSelect value={pairValue} error={pairError} node="create-deck-dialog/pair" />
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionLabel>OPTIONAL</SectionLabel>
            <MxLink size="sm" trailingIcon={null} node="create-deck-dialog/optional-toggle">{optional ? 'Hide' : 'Show'}</MxLink>
          </div>
          {optional || longText ? (
            <Field label="Description" value={longText ? LONG_DESC : 'Vocabulary and grammar for TOPIK II'} placeholder="Add a description" node="create-deck-dialog/description" />
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--memox-space-3)', marginTop: 'var(--memox-space-2)' }}>
            <MxButton variant="ghost" disabled={submitting} node="create-deck-dialog/cancel">Cancel</MxButton>
            <MxButton variant="primary" icon={submitting ? undefined : 'add'} disabled={submitting} node="create-deck-dialog/create">
              {submitting ? 'Creating…' : 'Create deck'}
            </MxButton>
          </div>
        </Sheet>
        {keyboard ? <div data-mx-node="create-deck-dialog/keyboard" style={{ height: 'var(--memox-size-3xl)', background: 'var(--memox-surface-sunken)', borderTop: 'var(--memox-stroke-hairline) solid var(--memox-divider)' }} /> : null}
      </Scrim>
    </React.Fragment>
  );
}

window.CreateDeckDialog = CreateDeckDialog;
})();

export const CreateDeckDialog = window.CreateDeckDialog;
