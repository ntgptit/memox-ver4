/* MemoX — Search. States: empty-recent · results · filtered · no-results · loading
   Feature-local components: components/{ResultRow,Chips}.jsx */
(function () {
const NS = window.MemoXDesignSystem_2ffa54;
const { MxScaffold, MxAppBar, MxIconButton, MxSearchDock, MxCard, MxList } = NS;
const { ResultRow, Chips } = window.MemoXSearch;

const RESULTS = [
  { term: '공부하다', meaning: 'to study', deck: 'TOPIK I — Vocabulary', status: 'due' },
  { term: '좋아하다', meaning: 'to like', deck: 'Common Verbs', status: 'mastered' },
  { term: '하다', meaning: 'to do (auxiliary)', deck: 'TOPIK I — Vocabulary', status: 'new', hidden: true },
];
const RECENT = ['안녕하세요', '학교', '감사합니다'];

function Search({ state = 'empty-recent' }) {
  const val = state === 'empty-recent' ? '' : (state === 'no-results' ? 'xyz' : '하');
  const bar = (
    <MxAppBar node="search/appbar"
      leading={<MxIconButton icon="arrow_back" node="search/back" />}
      title={<MxSearchDock value={val || undefined} placeholder="Search by word or meaning" node="search/dock"
        trailing={val ? <MxIconButton icon="close" size="sm" node="search/clear" /> : null} />} />
  );

  if (state === 'empty-recent') {
    return (
      <MxScaffold node="search/screen" appBar={bar}>
        <window.SectionLabel>RECENT</window.SectionLabel>
        <MxCard padding="sm">
          {RECENT.map((r, i) => (
            <window.ListRow key={r} icon="history" title={r} last={i === RECENT.length - 1} node={'search/recent-' + i}
              trailing={<MxIconButton icon="north_west" size="sm" node={'search/recent-fill-' + i} />} />
          ))}
        </MxCard>
      </MxScaffold>
    );
  }

  if (state === 'loading') {
    const S = window.Skeleton;
    return (
      <MxScaffold node="search/screen" appBar={bar}>
        <Chips active={0} />
        <MxList node="search/loading">{[0, 1, 2].map((i) => (
          <MxCard key={i} padding="sm"><S w="40%" h={16} /><S w="62%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /><S w="50%" h={10} style={{ marginTop: 'var(--memox-space-2)' }} /></MxCard>
        ))}</MxList>
      </MxScaffold>
    );
  }

  if (state === 'no-results') {
    return (
      <MxScaffold node="search/screen" appBar={bar}>
        <Chips active={0} />
        <window.EmptyState node="search/no-results" icon="search_off" tone="warning" title="No matches"
          text={'Nothing matched “xyz”. Try another term or check the spelling.'} />
      </MxScaffold>
    );
  }

  const filtered = state === 'filtered';
  const rows = filtered ? RESULTS.filter((r) => r.status === 'due') : RESULTS;
  return (
    <MxScaffold node="search/screen" appBar={bar}>
      <Chips active={filtered ? 2 : 0} />
      <MxList node="search/results">{rows.map((r, i) => (
        <MxCard key={i} padding="sm" interactive node={'search/result-' + i}><ResultRow {...r} /></MxCard>
      ))}</MxList>
    </MxScaffold>
  );
}

window.Search = Search;
})();
