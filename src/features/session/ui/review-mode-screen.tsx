/**
 * Review-mode screen (WBS 6.1, session stage 1). Browse the round card-by-card:
 * meaning on top (inline-editable), the term prompt below with pronunciation,
 * prev/next navigation. Composition mirrors the kit
 * `_features/review-mode/ReviewMode.jsx`: nested bar (back · Review · text-size
 * · options) → ProgressHeader → MeaningCard → shared StudyPromptCard (fill,
 * non-editable, `playing` in the audio state) → the swipe-to-continue row that
 * reclaims the reserved nav band. Plus loading / error / end. 6 states.
 */

import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AppScreen, EmptyState, MenuItem, MxButton, MxCard, MxIconButton, Scrim, SectionLabel, Sheet, Skeleton, useTheme } from '@/design-system';

import { ProgressHeader, StudyPromptCard } from './study-chrome';
import type { ReviewModeData, ReviewModeUiState } from './review-mode-fixtures';

export interface ReviewModeScreenProps {
  data: ReviewModeData;
  /** Canonical UI state; `end` renders the all-reviewed panel. */
  ui?: ReviewModeUiState;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onEditStart?: () => void;
  onEditCancel?: () => void;
  /** Persist the edited meaning. */
  onEditSave?: (meaning: string) => void;
  onPlayAudio?: () => void;
  onRetry?: () => void;
  onStudyNow?: () => void;
  onBackToDeck?: () => void;
}

export function ReviewModeScreen({
  data,
  ui = 'browsing',
  onBack,
  onPrev,
  onNext,
  onEditStart,
  onEditCancel,
  onEditSave,
  onPlayAudio,
  onRetry,
  onStudyNow,
  onBackToDeck,
}: ReviewModeScreenProps) {
  const t = useTheme();
  // 12.11 A10: text-size cycles S → M → L (scale 1 → 1.15 → 1.3), applied to the
  // review card copy. Default 1 keeps the golden identical.
  const [textScale, setTextScale] = useState(1);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const cycleTextSize = () => setTextScale((s) => (s === 1 ? 1.15 : s === 1.15 ? 1.3 : 1));

  const bar = {
    variant: 'nested' as const,
    title: 'Review',
    leading: <MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="review-mode/back" />,
    actions: (
      <>
        <MxIconButton icon="format_size" accessibilityLabel="Text size" onPress={cycleTextSize} node="review-mode/text-size" />
        <MxIconButton icon="more_vert" accessibilityLabel="Options" onPress={() => setOptionsOpen(true)} node="review-mode/options" />
      </>
    ),
  };

  const optionsSheet = optionsOpen ? (
    <Scrim align="end" onDismiss={() => setOptionsOpen(false)} node="review-mode/options-scrim">
      <Sheet title="Review options" node="review-mode/options-sheet">
        <MenuItem
          icon="bolt"
          label="Study now"
          onPress={() => {
            setOptionsOpen(false);
            onStudyNow?.();
          }}
          node="review-mode/opt-study"
        />
        <MenuItem
          icon="logout"
          label="Back to deck"
          onPress={() => {
            setOptionsOpen(false);
            onBackToDeck?.();
          }}
          node="review-mode/opt-back"
        />
      </Sheet>
    </Scrim>
  ) : null;

  // ---- loading ------------------------------------------------------------------
  if (data.status === 'loading') {
    return (
      <AppScreen node="review-mode/screen" {...bar}>
        <Skeleton h={12} r={999} />
        <Skeleton h={220} r={20} style={{ marginTop: t.space[4] }} />
        <Skeleton h={260} r={20} style={{ marginTop: t.space[4] }} />
      </AppScreen>
    );
  }

  // ---- error ----------------------------------------------------------------------
  if (data.status === 'error') {
    return (
      <AppScreen node="review-mode/screen" {...bar}>
        <EmptyState
          node="review-mode/error"
          icon="cloud_off"
          tone="error"
          title="Couldn't load review"
          text={data.message}
          action={
            <MxButton variant="primary" icon="refresh" onPress={onRetry} node="review-mode/retry">
              Try again
            </MxButton>
          }
        />
      </AppScreen>
    );
  }

  // ---- end ------------------------------------------------------------------------
  if (ui === 'end') {
    return (
      <AppScreen node="review-mode/screen" {...bar}>
        <EmptyState
          node="review-mode/end"
          icon="done_all"
          tone="success"
          title="All reviewed"
          text="You've gone through every card in this deck."
          action={
            <View style={{ gap: t.space[3], width: t.size['3xl'] }}>
              <MxButton variant="primary" icon="school" block onPress={onStudyNow} node="review-mode/study-now">
                Study now
              </MxButton>
              <MxButton variant="ghost" icon="arrow_back" block onPress={onBackToDeck} node="review-mode/back-deck">
                Back to deck
              </MxButton>
            </View>
          }
        />
      </AppScreen>
    );
  }

  return (
    <>
    <AppScreen node="review-mode/screen" {...bar}>
      <ProgressHeader done={data.done} total={data.total} node="review-mode/progress" />

      <MeaningCard
        meaning={data.meaning}
        editing={ui === 'editing'}
        textScale={textScale}
        onEditStart={onEditStart}
        onEditCancel={onEditCancel}
        onEditSave={onEditSave}
      />

      <StudyPromptCard term={data.term} nodePrefix="review-mode" fill editable={false} playing={ui === 'audio'} onAudio={onPlayAudio} />

      {/* Kit: the swipe row reclaims the body's reserved bottom-nav padding. */}
      <View
        style={{
          marginBottom: -t.layout.bottomNavHeight,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: t.space[4],
        }}
      >
        <MxIconButton icon="chevron_left" accessibilityLabel="Previous card" onPress={onPrev} node="review-mode/prev" />
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textTertiary }]}>Swipe to continue</Text>
        <MxIconButton icon="chevron_right" accessibilityLabel="Next card" onPress={onNext} node="review-mode/next" />
      </View>
    </AppScreen>
      {optionsSheet}
    </>
  );
}

/**
 * Kit `_features/review-mode/components/MeaningCard.jsx`: MEANING label + inline
 * edit affordance; editing swaps the meaning for an emphasis-bordered input with
 * Cancel/Save.
 */
function MeaningCard({
  meaning,
  editing,
  textScale = 1,
  onEditStart,
  onEditCancel,
  onEditSave,
}: {
  meaning: string;
  editing: boolean;
  textScale?: number;
  onEditStart?: () => void;
  onEditCancel?: () => void;
  onEditSave?: (meaning: string) => void;
}) {
  const t = useTheme();
  const [draft, setDraft] = useState(meaning);
  // Re-seed the draft whenever the card (or edit session) changes — the
  // adjust-state-during-render idiom, not an effect.
  const [seed, setSeed] = useState({ meaning, editing });
  if (seed.meaning !== meaning || seed.editing !== editing) {
    setSeed({ meaning, editing });
    setDraft(meaning);
  }

  return (
    <MxCard node="review-mode/meaning" style={{ flex: 1, gap: t.space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SectionLabel uppercase style={{ flex: 1, marginTop: 0, marginLeft: 0 }}>
          Meaning
        </SectionLabel>
        <MxIconButton
          icon={editing ? 'close' : 'edit'}
          size="sm"
          accessibilityLabel={editing ? 'Cancel edit' : 'Edit meaning'}
          onPress={editing ? onEditCancel : onEditStart}
          node="review-mode/edit"
        />
      </View>
      {editing ? (
        <>
          <TextInput
            testID="review-mode/edit-input"
            accessibilityLabel="Meaning"
            value={draft}
            onChangeText={setDraft}
            autoFocus
            style={[
              t.font.text({ size: 'md', weight: 'bold' }),
              {
                color: t.color.text,
                borderWidth: t.stroke.emphasis,
                borderColor: t.color.primary,
                borderRadius: t.radius.control,
                paddingVertical: t.space[3],
                paddingHorizontal: t.space[4],
                outlineStyle: 'none',
              },
            ]}
          />
          <View style={{ flexDirection: 'row', gap: t.space[2], justifyContent: 'flex-end' }}>
            <MxButton variant="ghost" size="sm" onPress={onEditCancel} node="review-mode/edit-cancel">
              Cancel
            </MxButton>
            <MxButton variant="primary" size="sm" onPress={() => onEditSave?.(draft)} node="review-mode/edit-save">
              Save
            </MxButton>
          </View>
        </>
      ) : (
        <Text
          style={[
            t.font.text({ size: 'xl', weight: 'bold' }),
            { color: t.color.text },
            textScale !== 1 && { fontSize: t.font.size.xl * textScale, lineHeight: t.font.size.xl * textScale * 1.3 },
          ]}
        >
          {meaning}
        </Text>
      )}
    </MxCard>
  );
}
