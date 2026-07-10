/* SubdeckCard — a subdeck row, built on the shared DeckCard so spacing/anatomy match
   decks. Uses a progress Ring as the visual (clearly a child level) instead of an icon
   tile, a semibold title, and a "N cards · status" meta. */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;

function SubdeckCard({ s, index, selected, meta }) {
  const { MxIconButton } = NS;
  const { Status } = window.MemoXLibrary;
  const body = meta || <React.Fragment>{s.cards} cards · <Status d={s} /></React.Fragment>;
  return (
    <window.DeckCard
      ring={s.progress}
      selected={selected}
      title={s.name}
      titleWeight="var(--memox-font-weight-semibold)"
      meta={body}
      trailing={<MxIconButton icon="bolt" size="sm" node={'library/sub-study-' + index} ariaLabel={'Study ' + s.name} />}
      node={'library/subdeck-' + index}
    />
  );
}

window.MemoXLibrary = Object.assign(window.MemoXLibrary || {}, { SubdeckCard });
})();

export const SubdeckCard = (window.MemoXLibrary || {}).SubdeckCard;
