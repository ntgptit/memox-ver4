/**
 * Flashcard-list screen (WBS 4.3) — browse, filter and manage the cards in a final
 * deck. CARDS ONLY — never a subdecks section, never Create subdeck. Composition
 * mirrors the kit `_features/flashcard-list/FlashcardList.jsx`: nested bar (back ·
 * deck title · search · More) → Breadcrumb → filter chips (All/New/Due/Mastered) →
 * CARDS section label with the study aggregate → MxList of StatusCardRow cards →
 * Add-card FAB, plus the add/card-actions sheets, delete confirm, search mode,
 * selection mode, loading/empty/offline/error. 15 states (contract §6).
 */

import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppScreen,
  Breadcrumb,
  Dialog,
  EmptyState,
  Icon,
  MenuItem,
  MxButton,
  MxCard,
  MxChip,
  MxFab,
  MxIconButton,
  MxLink,
  MxList,
  MxSearchDock,
  Scrim,
  SectionLabel,
  Sheet,
  Skeleton,
  StatusCardRow,
  useTheme,
  type BreadcrumbItem,
} from '@/design-system';
import { isErr, type AppError, type Result } from '@/shared';

import {
  FLASHCARD_FILTERS,
  FLASHCARD_TRAIL,
  flashcardSummary,
  type FlashcardListData,
  type FlashcardListUiState,
  type FlashcardView,
} from './flashcard-list-fixtures';

export interface FlashcardListScreenProps {
  data: FlashcardListData;
  /** Deck title in the nested bar ("Numbers & counting"). */
  deckTitle: string;
  trail?: readonly BreadcrumbItem[];
  onBack?: () => void;
  onAddCard?: () => void;
  onImportCards?: () => void;
  onDeckSettings?: () => void;
  onEditCard?: (id: string) => void;
  onMoveCard?: (id: string) => void;
  onHideCard?: (id: string) => void;
  /** Persist a delete; resolves to a Result so the dialog renders failure. */
  onDeleteCard?: (id: string) => Promise<Result<unknown, AppError>>;
  onRetry?: () => void;
  /** Preview/testing: start in a canonical UI state. */
  initialUi?: FlashcardListUiState;
}

type Mode = 'browse' | 'search' | 'selection';
type Overlay = 'add' | 'actions' | 'delete' | null;

/** Kit fixture queries per search state. */
const PREVIEW_QUERY: Partial<Record<FlashcardListUiState, string>> = { search: '하', 'no-results': 'zzz' };

export function FlashcardListScreen({
  data,
  deckTitle,
  trail = FLASHCARD_TRAIL,
  onBack,
  onAddCard,
  onImportCards,
  onDeckSettings,
  onEditCard,
  onMoveCard,
  onHideCard,
  onDeleteCard,
  onRetry,
  initialUi = 'loaded',
}: FlashcardListScreenProps) {
  const t = useTheme();
  const [mode, setMode] = useState<Mode>(
    initialUi === 'search' || initialUi === 'no-results' ? 'search' : initialUi === 'selection' ? 'selection' : 'browse',
  );
  const [query, setQuery] = useState(PREVIEW_QUERY[initialUi] ?? '');
  const [overlay, setOverlay] = useState<Overlay>(
    initialUi === 'add-sheet' ? 'add' : initialUi === 'card-actions' ? 'actions' : initialUi === 'delete-confirm' ? 'delete' : null,
  );
  // Kit filter fixture: 'filter-applied' = the Due chip (index 2).
  const [filter, setFilter] = useState<number>(initialUi === 'filter-applied' ? 2 : 0);
  const [activeId, setActiveId] = useState<string | null>(
    data.status === 'ready' && (initialUi === 'card-actions' || initialUi === 'delete-confirm')
      ? (data.cards[0]?.id ?? null)
      : null,
  );
  // Kit selection fixture: rows 0 and 2 selected.
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        initialUi === 'selection' && data.status === 'ready'
          ? data.cards.filter((_, i) => [0, 2].includes(i)).map((c) => c.id)
          : [],
      ),
  );

  const cards = useMemo(() => (data.status === 'ready' ? data.cards : []), [data]);
  const active = cards.find((c) => c.id === activeId) ?? null;

  const filtered = useMemo(() => {
    if (filter === 0) return cards;
    const status = (['all', 'new', 'due', 'mastered'] as const)[filter];
    return cards.filter((c) => c.status === status);
  }, [cards, filter]);

  const hits = useMemo(() => {
    const needle = query.trim();
    if (needle === '') return cards;
    return cards.filter((c) => c.term.includes(needle) || c.meaning.toLowerCase().includes(needle.toLowerCase()));
  }, [cards, query]);

  const back = <MxIconButton icon="arrow_back" size="sm" accessibilityLabel="Back" onPress={onBack} node="flashcard-list/back" />;
  const nestedActions = (
    <>
      <MxIconButton icon="search" size="sm" accessibilityLabel="Search cards" onPress={() => setMode('search')} node="flashcard-list/search-open" />
      <MxIconButton icon="more_vert" size="sm" accessibilityLabel="Deck settings" onPress={onDeckSettings} node="flashcard-list/more" />
    </>
  );
  const fab = <MxFab icon="add" accessibilityLabel="Add card" onPress={() => setOverlay('add')} node="flashcard-list/add" />;

  const filterRow = (
    <View testID="flashcard-list/filters" style={{ flexDirection: 'row', gap: t.space[2], paddingBottom: t.space[1] }}>
      {FLASHCARD_FILTERS.map((f, i) => (
        <MxChip key={f} label={f} selected={i === filter} onPress={() => setFilter(i)} node={`flashcard-list/filter-${i}`} />
      ))}
    </View>
  );
  const cardHead = (arr: readonly FlashcardView[]) => (
    <SectionLabel>
      CARDS{' '}
      <Text style={[t.font.text({ size: 'sm', weight: 'medium', letterSpacing: 'normal' }), { color: t.color.textTertiary }]}>
        · {flashcardSummary(arr)}
      </Text>
    </SectionLabel>
  );
  const cardRow = (c: FlashcardView, i: number) => (
    <MxCard
      key={c.id}
      padding="sm"
      interactive
      onPress={() => {
        setActiveId(c.id);
        setOverlay('actions');
      }}
      accessibilityLabel={c.term}
      node={`flashcard-list/card-${i}`}
    >
      <StatusCardRow term={c.term} meaning={c.meaning} status={c.status} hidden={c.hidden} tightTerm clampMeaning />
    </MxCard>
  );
  const cardList = (arr: readonly FlashcardView[]) => <MxList>{arr.map(cardRow)}</MxList>;

  // ---- loading ------------------------------------------------------------------
  if (data.status === 'loading') {
    return (
      <AppScreen node="flashcard-list/screen" variant="nested" title={deckTitle} leading={back} actions={nestedActions} fab={fab}>
        <Skeleton h={44} r={999} />
        <MxList>
          {[0, 1, 2, 3, 4].map((i) => (
            <MxCard key={i} padding="sm">
              <View style={{ flexDirection: 'row', gap: t.space[4], alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Skeleton w="45%" h={16} />
                  <Skeleton w="65%" h={10} style={{ marginTop: t.space[2] }} />
                </View>
                <Skeleton w={56} h={22} r={999} />
              </View>
            </MxCard>
          ))}
        </MxList>
      </AppScreen>
    );
  }

  // ---- error ----------------------------------------------------------------------
  if (data.status === 'error') {
    return (
      <AppScreen node="flashcard-list/screen" variant="nested" title={deckTitle} leading={back} actions={nestedActions}>
        <EmptyState
          node="flashcard-list/error"
          icon="cloud_off"
          tone="error"
          title="Couldn't load cards"
          text={data.message}
          action={
            <MxButton variant="primary" icon="refresh" onPress={onRetry} node="flashcard-list/retry">
              Retry
            </MxButton>
          }
        />
      </AppScreen>
    );
  }

  // ---- search / no-results ------------------------------------------------------
  if (mode === 'search') {
    const noResults = hits.length === 0 || (initialUi === 'no-results' && query === PREVIEW_QUERY['no-results']);
    return (
      <AppScreen
        node="flashcard-list/screen"
        variant="search"
        main={
          <MxSearchDock value={query} placeholder="Search cards" onChange={setQuery} accessibilityLabel="Search cards" node="flashcard-list/search-dock" />
        }
        actions={
          <MxIconButton
            icon="close"
            size="sm"
            accessibilityLabel="Clear search"
            onPress={() => {
              setMode('browse');
              setQuery('');
            }}
            node="flashcard-list/search-clear"
          />
        }
      >
        {filterRow}
        {noResults ? (
          <EmptyState node="flashcard-list/no-results" icon="search_off" tone="warning" title="No cards found" text={`Nothing matched “${query}”. Try another term.`} />
        ) : (
          <>
            <SectionLabel uppercase>Cards</SectionLabel>
            {cardList(hits)}
          </>
        )}
      </AppScreen>
    );
  }

  // ---- selection ------------------------------------------------------------------
  if (mode === 'selection') {
    const toggle = (id: string) =>
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    return (
      <AppScreen
        node="flashcard-list/screen"
        variant="selection"
        count={selectedIds.size}
        actions={
          <>
            <MxIconButton
              icon="select_all"
              size="sm"
              accessibilityLabel="Select all"
              onPress={() => setSelectedIds(new Set(cards.map((c) => c.id)))}
              node="flashcard-list/sel-all"
            />
            <MxIconButton icon="more_vert" size="sm" accessibilityLabel="More actions" onPress={() => setMode('browse')} node="flashcard-list/sel-more" />
          </>
        }
      >
        <SectionLabel uppercase>Cards</SectionLabel>
        <MxList>
          {cards.map((c, i) => {
            const sel = selectedIds.has(c.id);
            return (
              <MxCard
                key={c.id}
                padding="sm"
                interactive
                variant={sel ? 'primary-soft' : 'elevated'}
                onPress={() => toggle(c.id)}
                accessibilityLabel={c.term}
                node={`flashcard-list/sel-card-${i}`}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space[4] }}>
                  <Icon
                    name={sel ? 'check_circle' : 'radio_button_unchecked'}
                    size={t.iconSize.lg}
                    color={sel ? t.color.accent : t.color.textTertiary}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <StatusCardRow term={c.term} meaning={c.meaning} status={c.status} hidden={c.hidden} tightTerm clampMeaning />
                  </View>
                </View>
              </MxCard>
            );
          })}
        </MxList>
      </AppScreen>
    );
  }

  // ---- empty ---------------------------------------------------------------------
  if (cards.length === 0) {
    return (
      <AppScreen node="flashcard-list/screen" variant="nested" title={deckTitle} leading={back} actions={nestedActions} fab={fab}>
        <EmptyState
          node="flashcard-list/empty"
          icon="playing_cards"
          title="No cards yet"
          text="Add your first card or import a set to start studying this deck."
          action={
            <View style={{ gap: t.space[3], width: t.size['3xl'] }}>
              <MxButton variant="primary" icon="note_add" block onPress={onAddCard} node="flashcard-list/empty-add">
                Add card
              </MxButton>
              <MxButton variant="secondary" icon="upload_file" block onPress={onImportCards} node="flashcard-list/empty-import">
                Import cards
              </MxButton>
            </View>
          }
        />
      </AppScreen>
    );
  }

  // ---- browse (loaded/dense/min/long/offline/filter-applied + overlays) --------------
  const showFilterSummary = filter !== 0;
  return (
    <AppScreen node="flashcard-list/screen" variant="nested" title={deckTitle} leading={back} actions={nestedActions} fab={fab}>
      {crumbsAndBanner()}
      {filterRow}
      {showFilterSummary ? (
        <>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
            {filtered.length} {FLASHCARD_FILTERS[filter].toLowerCase()} cards
          </Text>
          <SectionLabel uppercase>Cards</SectionLabel>
        </>
      ) : (
        cardHead(filtered)
      )}
      {cardList(filtered)}

      {overlay === 'add' && (
        <Scrim node="flashcard-list/add-scrim" align="end" onDismiss={() => setOverlay(null)}>
          <Sheet title="Add" node="flashcard-list/add-sheet">
            <MenuItem icon="note_add" label="Add card" onPress={onAddCard} node="flashcard-list/add-card" />
            <MenuItem icon="upload_file" label="Import cards" onPress={onImportCards} node="flashcard-list/add-import" />
          </Sheet>
        </Scrim>
      )}

      {overlay === 'actions' && active && (
        <Scrim node="flashcard-list/actions-scrim" align="end" onDismiss={() => setOverlay(null)}>
          <Sheet title={active.term} node="flashcard-list/actions-sheet">
            <MenuItem icon="edit" label="Edit card" onPress={() => onEditCard?.(active.id)} node="flashcard-list/action-edit" />
            <MenuItem icon="drive_file_move" label="Move card" onPress={() => onMoveCard?.(active.id)} node="flashcard-list/action-move" />
            <MenuItem icon="visibility_off" label="Hide card" onPress={() => onHideCard?.(active.id)} node="flashcard-list/action-hide" />
            <MenuItem icon="delete" label="Delete card" danger onPress={() => setOverlay('delete')} node="flashcard-list/action-delete" />
          </Sheet>
        </Scrim>
      )}

      {overlay === 'delete' && active && (
        <DeleteConfirm card={active} onDelete={onDeleteCard} onClose={() => setOverlay(null)} />
      )}
    </AppScreen>
  );

  function crumbsAndBanner() {
    return (
      <>
        <Breadcrumb items={trail} node="flashcard-list/breadcrumb" />
        {data.status === 'ready' && data.offline && (
          <View
            testID="flashcard-list/offline-banner"
            accessibilityRole="alert"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[3],
              paddingVertical: t.space[3],
              paddingHorizontal: t.space[4],
              borderRadius: t.radius.card,
              backgroundColor: t.color.warningSoft,
            }}
          >
            <Icon name="cloud_off" size={t.iconSize.md} color={t.color.onWarningSoft} />
            <Text style={[t.font.text({ size: 'sm' }), { color: t.color.onWarningSoft, flex: 1 }]}>
              Offline · showing saved cards. Last synced 2 hours ago.
            </Text>
            <MxLink size="sm" trailingIcon={null} onPress={onRetry} node="flashcard-list/offline-retry">
              Retry
            </MxLink>
          </View>
        )}
      </>
    );
  }
}

// --- delete confirmation -----------------------------------------------------------

function DeleteConfirm({
  card,
  onDelete,
  onClose,
}: {
  card: FlashcardView;
  onDelete?: (id: string) => Promise<Result<unknown, AppError>>;
  onClose: () => void;
}) {
  const t = useTheme();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(null);
    const result = (await onDelete?.(card.id)) ?? null;
    if (result && isErr(result)) {
      setBusy(false);
      setFailed(result.error.message);
      return;
    }
    onClose();
  };

  return (
    <Scrim node="flashcard-list/delete-scrim" align="center" onDismiss={onClose}>
      <Dialog
        node="flashcard-list/delete-dialog"
        icon="delete"
        tone="error"
        title="Delete this card?"
        text={`The card “${card.term}” will be removed from this deck. This can't be undone.`}
        actions={[
          <MxButton key="cancel" variant="ghost" block onPress={onClose} node="flashcard-list/delete-cancel">
            Cancel
          </MxButton>,
          <MxButton key="ok" variant="primary" danger block disabled={busy} onPress={confirm} node="flashcard-list/delete-ok">
            {busy ? 'Deleting…' : 'Delete'}
          </MxButton>,
        ]}
      >
        {failed ? (
          <Text
            testID="flashcard-list/delete-error"
            accessibilityRole="alert"
            style={[t.font.text({ size: 'sm' }), { color: t.color.error, textAlign: 'center' }]}
          >
            {failed}
          </Text>
        ) : null}
      </Dialog>
    </Scrim>
  );
}
