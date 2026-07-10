/* SubdeckCard — a subdeck row. A subdeck IS a deck one level down, so it renders with the
   SAME shared DeckCard anatomy as a top-level deck: an icon tile (icon + accent tone),
   title, and a "N cards · status" meta, with a quick-study trailing. Deck is the standard —
   subdecks must not diverge into a different visual (e.g. a progress ring). */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;

function SubdeckCard({ s, index, selected, meta, nodePrefix = 'library' }) {
  const { MxIconButton } = NS;
  const { Status } = window.MemoXLibrary;
  const body = meta || <React.Fragment>{s.cards} cards · <Status d={s} /></React.Fragment>;
  return (
    <window.DeckCard
      icon={s.icon || 'style'}
      tone={s.tone || 'accent'}
      selected={selected}
      title={s.name}
      titleWeight="var(--memox-font-weight-semibold)"
      meta={body}
      trailing={<MxIconButton icon="bolt" size="sm" node={nodePrefix + '/sub-study-' + index} ariaLabel={'Study ' + s.name} />}
      node={nodePrefix + '/subdeck-' + index}
    />
  );
}

window.MemoXLibrary = Object.assign(window.MemoXLibrary || {}, { SubdeckCard });
})();

export const SubdeckCard = (window.MemoXLibrary || {}).SubdeckCard;
