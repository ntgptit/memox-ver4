/* DeckList — the ONE vertical list wrapper for deck/subdeck cards. Owns the standard
   inter-card gap (space-3 = 12px, matching Dashboard "Recent decks") so every list —
   Library, Dashboard, search results, deck detail — spaces items identically. Use this
   instead of dropping cards straight into the scroll body (whose section gap is larger). */
(function () {
function DeckList({ children, node }) {
  return (
    <div data-mx-node={node} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--memox-space-3)' }}>
      {children}
    </div>
  );
}
window.DeckList = DeckList;
})();

export const DeckList = window.DeckList;
