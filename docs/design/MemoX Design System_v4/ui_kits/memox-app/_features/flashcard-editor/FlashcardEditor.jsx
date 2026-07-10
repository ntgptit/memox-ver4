/* MemoX — Flashcard editor. States: create · edit · validation · duplicate · multi-meaning · audio
   Feature-local components: components/{Field,DupBanner}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxCard, MxButton, MxIconButton, MxChip, MxSwitch } = NS;
const { Field, DupBanner } = window.MemoXFlashcardEditor;

function FlashcardEditor({ state = 'create' }) {
  const [hidden, setHidden] = React.useState(false);
  const blank = state === 'create' || state === 'validation';
  const title = state === 'create' ? 'New card' : 'Edit card';
  const termErr = state === 'validation' ? 'Term is required' : null;
  const meaningErr = state === 'validation' ? 'Meaning is required' : null;
  const submitting = state === 'submitting';
  const saveDisabled = state === 'create' || submitting;

  const bar = (
    <MxAppBar node="flashcard-editor/appbar" title={title}
      leading={<MxButton variant="ghost" disabled={submitting} node="flashcard-editor/cancel">Cancel</MxButton>}
      trailing={<MxButton variant="primary" size="sm" disabled={saveDisabled} node="flashcard-editor/save">{submitting ? 'Saving…' : 'Save'}</MxButton>} />
  );

  return (
    <MxScaffold node="flashcard-editor/screen" appBar={bar}>
      {state === 'duplicate' ? <DupBanner /> : null}
      {state === 'submit-error' ? <div data-mx-node="flashcard-editor/save-error"><window.Note tone="error" icon="error" text="Couldn't save the card. Check your connection and try again." /></div> : null}
      {state === 'submit-success' ? <div data-mx-node="flashcard-editor/save-success"><window.Note tone="success" icon="check_circle" text="Card saved." /></div> : null}

      <Field label="Term (Korean)" required node="flashcard-editor/term"
        value={blank ? '' : '안녕하세요'} placeholder="Enter a word…" error={termErr} />

      <Field label="Meaning (English)" required multiline node="flashcard-editor/meaning"
        value={blank ? '' : 'Hello (formal); used when greeting elders'}
        placeholder="Enter the meaning, with examples or notes…" error={meaningErr} />

      {state === 'multi-meaning'
        ? <Field label="Secondary meaning (Vietnamese)" node="flashcard-editor/meaning-2" value="xin chào" placeholder="Enter a secondary meaning…" />
        : <MxButton variant="ghost" icon="add" block node="flashcard-editor/add-meaning">Add a secondary-language meaning</MxButton>}

      <div data-mx-node="flashcard-editor/gender" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-2)' }}>
        <div style={{ fontSize: 'var(--memox-font-size-sm)', fontWeight: 'var(--memox-font-weight-bold)', color: 'var(--memox-text-secondary)' }}>Gender (optional)</div>
        <div style={{ display: 'flex', gap: 'var(--memox-space-2)', flexWrap: 'wrap' }}>
          {['None', 'Masc', 'Fem', 'Neutral'].map((g, i) => <MxChip key={g} label={g} selected={i === 0} node={'flashcard-editor/gender-' + i} />)}
        </div>
      </div>

      <Field label="Audio" node="flashcard-editor/audio"
        value={state === 'audio' ? 'Generating from term…' : 'Auto from term'}
        trailing={<MxIconButton icon={state === 'audio' ? 'sync' : 'volume_up'} node="flashcard-editor/audio-play" />} />

      <MxCard padding="sm">
        <window.ListRow icon="visibility_off" title="Hide card" sub="Won't show during study / review" last node="flashcard-editor/hidden"
          trailing={<MxSwitch checked={hidden} onChange={setHidden} node="flashcard-editor/hidden-switch" />} />
      </MxCard>
    </MxScaffold>
  );
}

window.FlashcardEditor = FlashcardEditor;
})();
