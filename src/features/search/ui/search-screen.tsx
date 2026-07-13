/**
 * Search screen (WBS 4.6). Find a card by word or meaning: a search app-bar over a
 * body that shows recent history (empty query), a loading skeleton, filtered result
 * rows, or a no-results message that quotes the query.
 *
 * Presentational and prop-driven — query + results + recent + filter come in, all
 * intent goes out. The container wires the debounced DB query + recent persistence.
 */

import { Text, View } from 'react-native';

import {
  AppScreen,
  MxCard,
  MxChip,
  MxBadge,
  MxLink,
  MxIconButton,
  MxSearchDock,
  Icon,
  useTheme,
  type Theme,
} from '@/design-system';
import type { CardHit, CardStatus } from '@/features/search/data';

import { SEARCH_FILTERS, type SearchFilter, type SearchView } from './search-fixtures';

export interface SearchScreenProps extends SearchView {
  onQueryChange: (q: string) => void;
  onClear: () => void;
  onFilterChange: (f: SearchFilter) => void;
  onUseRecent: (q: string) => void;
  onRemoveRecent: (q: string) => void;
  onClearRecent: () => void;
  onOpenHit: (hit: CardHit) => void;
  onBack?: () => void;
}

const STATUS_TONE: Record<CardStatus, 'warning' | 'success' | 'primary'> = {
  due: 'warning',
  mastered: 'success',
  new: 'primary',
};
const STATUS_LABEL: Record<CardStatus, string> = { due: 'Due', mastered: 'Mastered', new: 'New' };

export function SearchScreen(props: SearchScreenProps) {
  const t = useTheme();
  const { query, phase, hits, recent, filter } = props;

  const dock = (
    <MxSearchDock
      flat
      node="search/dock"
      placeholder="Search by word or meaning"
      value={query}
      onChange={props.onQueryChange}
      accessibilityLabel="Search by word or meaning"
      trailing={
        query.length > 0 ? (
          <MxIconButton icon="close" size="sm" accessibilityLabel="Clear" onPress={props.onClear} node="search/clear" />
        ) : undefined
      }
    />
  );

  const visible = filter === 'all' ? hits : hits.filter((h) => h.status === filter);

  return (
    <AppScreen
      node="search/screen"
      variant="search"
      leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={props.onBack} node="search/back" />}
      main={dock}
    >
      {phase === 'recent' && (
        <RecentList
          theme={t}
          recent={recent}
          onUse={props.onUseRecent}
          onRemove={props.onRemoveRecent}
          onClearAll={props.onClearRecent}
        />
      )}

      {phase === 'loading' && <LoadingList theme={t} />}

      {phase === 'no-results' && <NoResults theme={t} query={query} />}

      {phase === 'results' && (
        <View style={{ gap: t.space[3] }}>
          <FilterChips theme={t} filter={filter} onChange={props.onFilterChange} />
          {visible.length === 0 ? (
            <Text
              testID="search/filter-empty"
              style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, textAlign: 'center', paddingVertical: t.space[4] }]}
            >
              No {filter === 'all' ? '' : `${filter} `}cards in these results.
            </Text>
          ) : (
            visible.map((h) => <ResultRow key={h.cardId} theme={t} hit={h} onPress={() => props.onOpenHit(h)} />)
          )}
        </View>
      )}
    </AppScreen>
  );
}

function FilterChips({
  theme: t,
  filter,
  onChange,
}: {
  theme: Theme;
  filter: SearchFilter;
  onChange: (f: SearchFilter) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[2] }}>
      {SEARCH_FILTERS.map((f) => (
        <MxChip
          key={f.id}
          label={f.label}
          selected={filter === f.id}
          variant={filter === f.id ? 'accent' : 'ghost'}
          onPress={() => onChange(f.id)}
          node={`search/filter-${f.id}`}
        />
      ))}
    </View>
  );
}

function ResultRow({ theme: t, hit, onPress }: { theme: Theme; hit: CardHit; onPress: () => void }) {
  return (
    <MxCard
      node={`search/result-${hit.cardId}`}
      padding="sm"
      interactive
      onPress={onPress}
      accessibilityLabel={`${hit.term}, ${hit.meaning}, in ${hit.deckTitle}, ${STATUS_LABEL[hit.status]}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>
            {hit.term}
          </Text>
          <Text numberOfLines={1} style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
            {hit.meaning}
          </Text>
          <Text numberOfLines={1} style={[t.font.text({ size: 'xs' }), { color: t.color.textTertiary }]}>
            {hit.deckTitle}
          </Text>
        </View>
        {/* Solid (not soft) badge: the soft on-tint fails AA in dark (see task). */}
        <MxBadge tone={STATUS_TONE[hit.status]} node={`search/result-${hit.cardId}-status`}>
          {STATUS_LABEL[hit.status]}
        </MxBadge>
      </View>
    </MxCard>
  );
}

function RecentList({
  theme: t,
  recent,
  onUse,
  onRemove,
  onClearAll,
}: {
  theme: Theme;
  recent: readonly string[];
  onUse: (q: string) => void;
  onRemove: (q: string) => void;
  onClearAll: () => void;
}) {
  if (recent.length === 0) {
    return (
      <View style={{ alignItems: 'center', gap: t.space[2], paddingVertical: t.space[6] }}>
        <Icon name="search" size="xl" color={t.color.textTertiary} />
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, textAlign: 'center' }]}>
          Search your cards by word or meaning.
        </Text>
      </View>
    );
  }
  return (
    <View style={{ gap: t.space[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[t.font.text({ size: 'xs', weight: 'semibold' }), { color: t.color.textTertiary, flex: 1 }]}>
          RECENT
        </Text>
        <MxLink size="sm" trailingIcon={null} onPress={onClearAll} node="search/recent-clear">
          Clear all
        </MxLink>
      </View>
      <MxCard node="search/recent" padding="sm" variant="muted">
        {recent.map((q, i) => (
          <View
            key={q}
            testID={`search/recent-${i}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[3],
              paddingVertical: t.space[2],
              borderBottomWidth: i === recent.length - 1 ? 0 : t.stroke.hairline,
              borderBottomColor: t.color.divider,
            }}
          >
            <Icon name="history" size="sm" color={t.color.textTertiary} />
            <Text numberOfLines={1} style={[t.font.text({ size: 'base' }), { color: t.color.text, flex: 1 }]}>
              {q}
            </Text>
            <MxIconButton
              icon="north_west"
              size="sm"
              accessibilityLabel={`Search ${q}`}
              onPress={() => onUse(q)}
              node={`search/recent-${i}-use`}
            />
            <MxIconButton
              icon="close"
              size="sm"
              accessibilityLabel={`Remove ${q} from history`}
              onPress={() => onRemove(q)}
              node={`search/recent-${i}-remove`}
            />
          </View>
        ))}
      </MxCard>
    </View>
  );
}

function LoadingList({ theme: t }: { theme: Theme }) {
  return (
    <View
      testID="search/loading"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Searching"
      style={{ gap: t.space[3] }}
    >
      {[0, 1, 2].map((i) => (
        <MxCard key={i} node={`search/skeleton-${i}`} padding="sm">
          <View style={{ gap: t.space[2] }}>
            <View style={{ height: t.space[3], width: '40%', borderRadius: t.radius.sm, backgroundColor: t.color.surfaceMuted }} />
            <View style={{ height: t.space[2], width: '62%', borderRadius: t.radius.sm, backgroundColor: t.color.surfaceMuted }} />
          </View>
        </MxCard>
      ))}
    </View>
  );
}

function NoResults({ theme: t, query }: { theme: Theme; query: string }) {
  return (
    <MxCard node="search/no-results" variant="flat">
      <View style={{ alignItems: 'center', gap: t.space[3], paddingVertical: t.space[5] }}>
        <Icon name="search_off" size="xl" color={t.color.textTertiary} />
        <Text style={[t.font.text({ size: 'md', weight: 'bold' }), { color: t.color.text, textAlign: 'center' }]}>
          No matches
        </Text>
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, textAlign: 'center' }]}>
          Nothing matched “{query}”. Try another term or check the spelling.
        </Text>
      </View>
    </MxCard>
  );
}
