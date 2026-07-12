/* MemoX — Deck Content Choice. The naming + organise step for a brand-new deck that has
   neither subdecks nor cards yet: name it inline, then pick exactly one direction. No
   competing FAB, no search / filter / list; Import is a tertiary action. Choosing a
   direction routes the reference flow to Subdeck List or Flashcard List. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxContextualAppBar, MxCard, MxIconTile, MxLink, MxTextField } = NS;

function Choice({ icon, title, text, node }) {
  return (
    <MxCard padding="md" interactive node={node}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--memox-space-4)' }}>
        <MxIconTile icon={icon} tone="accent" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'var(--memox-font-weight-bold)', fontSize: 'var(--memox-font-size-base)' }}>{title}</div>
          <div style={{ marginTop: 'var(--memox-space-1)', fontSize: 'var(--memox-font-size-sm)', color: 'var(--memox-text-secondary)' }}>{text}</div>
        </div>
        <span className="material-symbols-rounded" style={{ color: 'var(--memox-text-tertiary)' }}>chevron_right</span>
      </div>
    </MxCard>
  );
}

function DeckContentChoice() {
  const bar = <MxContextualAppBar variant="nested" node="deck-content-choice/appbar" title="New deck" />;
  return (
    <MxScaffold node="deck-content-choice/screen" appBar={bar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-2)' }}>
        <window.SectionLabel>DECK NAME</window.SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: 'var(--memox-touch-min)', padding: 'var(--memox-space-3) var(--memox-space-4)', borderRadius: 'var(--memox-radius-control)', background: 'var(--memox-surface)', border: 'var(--memox-stroke-hairline) solid var(--memox-divider)' }}>
          <MxTextField placeholder="Name your deck" autoFocus node="deck-content-choice/name" />
        </div>
      </div>
      <h1 data-mx-node="deck-content-choice/heading" style={{ margin: 0, fontSize: 'var(--memox-font-size-xl)', fontWeight: 'var(--memox-font-weight-extrabold)' }}>How do you want to organise it?</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
        <Choice icon="account_tree" title="Organise with subdecks" text="Create nested topics before adding cards." node="deck-content-choice/subdecks" />
        <Choice icon="playing_cards" title="Add cards directly" text="Use this as a final study deck." node="deck-content-choice/cards" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <MxLink size="sm" icon="upload_file" trailingIcon={null} node="deck-content-choice/import">Import from a file</MxLink>
      </div>
    </MxScaffold>
  );
}

window.DeckContentChoice = DeckContentChoice;
})();

export const DeckContentChoice = window.DeckContentChoice;
