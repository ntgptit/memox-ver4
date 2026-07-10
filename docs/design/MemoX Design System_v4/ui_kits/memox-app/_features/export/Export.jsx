/* MemoX — Export cards. States: config · exporting · done
   Feature-local components: components/{ExportingCard,FormatList}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxIconButton, MxCard, MxButton, MxChip, MxSegmentedControl, MxSwitch } = NS;
const { ExportingCard, FormatList } = window.MemoXExport;

const SEPS = ['Tab', 'Comma', 'Semicolon'];

const SectionLabel = window.SectionLabel;

function Export({ state = 'config' }) {
  const [incl, setIncl] = React.useState(true);
  const bar = <MxAppBar title="Export cards" node="export/appbar" leading={<MxIconButton icon="arrow_back" node="export/back" />} />;

  if (state === 'exporting') {
    return (
      <MxScaffold node="export/screen" appBar={bar}>
        <ExportingCard />
      </MxScaffold>
    );
  }

  if (state === 'done') {
    return (
      <MxScaffold node="export/screen" appBar={bar}>
        <window.EmptyState node="export/done" icon="ios_share" tone="success" title="Exported 320 cards"
          text="Your file is ready to share or save."
          action={<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)', width: 'var(--memox-size-3xl)' }}>
            <MxButton variant="primary" icon="share" block node="export/share">Share file</MxButton>
            <MxButton variant="ghost" icon="save_alt" block node="export/save">Save to device</MxButton>
          </div>} />
      </MxScaffold>
    );
  }

  return (
    <MxScaffold node="export/screen" appBar={bar}>
      <SectionLabel>SCOPE</SectionLabel>
      <MxSegmentedControl value="deck" onChange={() => {}} block node="export/scope"
        segments={[{ value: 'deck', label: 'This deck' }, { value: 'subtree', label: 'Incl. sub-decks' }]} />

      <SectionLabel>FORMAT</SectionLabel>
      <FormatList />

      <SectionLabel>SEPARATOR</SectionLabel>
      <div style={{ display: 'flex', gap: 'var(--memox-space-2)' }}>
        {SEPS.map((s, i) => <MxChip key={s} label={s} selected={i === 0} node={'export/sep-' + i} />)}
      </div>

      <MxCard padding="sm">
        <window.ListRow icon="schedule" tone="success" title="Include review state" sub="Leitner box + due date" last node="export/incl-srs"
          trailing={<MxSwitch checked={incl} onChange={setIncl} node="export/incl-srs-switch" />} />
      </MxCard>

      <MxButton variant="primary" icon="download" block node="export/do-export">Export</MxButton>
    </MxScaffold>
  );
}

window.Export = Export;
})();
