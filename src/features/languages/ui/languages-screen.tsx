/**
 * Languages screen (WBS 3.3) — manage learning↔native language pairs. Presentational
 * and prop-driven: all data comes in via {@link LanguagesData}, all writes go out
 * through `onAdd`/`onRemove` (async, returning a {@link Result} so the form can show
 * validation/failure). The container (`use-languages`) wires it to the repositories.
 *
 * States (contract §6): list · one · empty · add · remove — plus the loading and
 * recoverable-error edges every data screen owns.
 */

import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  AppScreen,
  MxCard,
  MxButton,
  Icon,
  ListRow,
  EmptyState,
  SectionLabel,
  Scrim,
  Sheet,
  MenuItem,
  Dialog,
  useTheme,
  type Theme,
} from '@/design-system';
import { MxIconButton } from '@/design-system';
import { type Result, type AppError, isErr } from '@/shared';

import {
  type LanguagesData,
  type LanguagePairView,
  pairSubtitle,
  pairTitle,
} from './fixtures';

export interface LanguagesScreenProps {
  data: LanguagesData;
  onBack?: () => void;
  /** Retry after a recoverable load error. */
  onRetry?: () => void;
  /** Persist a new pair. Resolves to a Result so the form renders validation/failure. */
  onAdd: (input: { learning: string; native: string }) => Promise<Result<unknown, AppError>>;
  /** Remove a pair by id. Resolves to a Result so the dialog renders failure. */
  onRemove: (id: string) => Promise<Result<unknown, AppError>>;
  /** Preview/testing hook: start in the add sub-view. */
  initialMode?: 'list' | 'add';
}

type Mode = 'list' | 'add';

export function LanguagesScreen({
  data,
  onBack,
  onRetry,
  onAdd,
  onRemove,
  initialMode = 'list',
}: LanguagesScreenProps) {
  const t = useTheme();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pendingRemove, setPendingRemove] = useState<LanguagePairView | null>(null);

  const back = <MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="languages/back" />;

  if (mode === 'add') {
    return (
      <AddPairView
        theme={t}
        onAdd={onAdd}
        onDone={() => setMode('list')}
        leading={
          <MxIconButton
            icon="arrow_back"
            accessibilityLabel="Back to language pairs"
            onPress={() => setMode('list')}
            node="languages/add-back"
          />
        }
      />
    );
  }

  return (
    <AppScreen node="languages/screen" variant="nested" title="Language pairs" leading={back}>
      {data.status === 'loading' && <LoadingState theme={t} />}
      {data.status === 'error' && <ErrorState message={data.message} onRetry={onRetry} />}
      {data.status === 'ready' && data.pairs.length === 0 && (
        <EmptyState
          node="languages/empty"
          icon="translate"
          title="No language pairs yet"
          text="Add a learning language and the language you want its meanings in."
          action={
            <MxButton variant="primary" icon="add" onPress={() => setMode('add')} node="languages/empty-add">
              Add language pair
            </MxButton>
          }
        />
      )}
      {data.status === 'ready' && data.pairs.length > 0 && (
        <PairList theme={t} pairs={data.pairs} onAdd={() => setMode('add')} onRemove={setPendingRemove} />
      )}

      {pendingRemove && (
        <RemoveDialog
          theme={t}
          pair={pendingRemove}
          onCancel={() => setPendingRemove(null)}
          onConfirm={onRemove}
          onDone={() => setPendingRemove(null)}
        />
      )}
    </AppScreen>
  );
}

// --- data states ---------------------------------------------------------------

function LoadingState({ theme: t }: { theme: Theme }) {
  return (
    <View
      testID="languages/loading"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading language pairs"
      style={{ paddingVertical: t.space[6], alignItems: 'center', gap: t.space[3] }}
    >
      <ActivityIndicator color={t.color.primary} />
      <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>Loading language pairs…</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      node="languages/error"
      icon="cloud_off"
      tone="error"
      title="Couldn’t load"
      text={message}
      action={
        onRetry && (
          <MxButton variant="secondary" icon="refresh" onPress={onRetry} node="languages/retry">
            Try again
          </MxButton>
        )
      }
    />
  );
}

// --- list ----------------------------------------------------------------------

function PairList({
  theme: t,
  pairs,
  onAdd,
  onRemove,
}: {
  theme: Theme;
  pairs: readonly LanguagePairView[];
  onAdd: () => void;
  onRemove: (p: LanguagePairView) => void;
}) {
  return (
    <View style={{ gap: t.space[4] }}>
      <MxCard node="languages/list" padding="sm">
        {pairs.map((p, i) => (
          <ListRow
            key={p.id}
            node={`languages/pair-${p.id}`}
            icon="translate"
            title={pairTitle(p)}
            sub={pairSubtitle(p)}
            last={i === pairs.length - 1}
            trailing={
              <MxIconButton
                icon="delete"
                variant="ghost"
                accessibilityLabel={`Remove ${pairTitle(p)}`}
                onPress={() => onRemove(p)}
                node={`languages/pair-${p.id}-del`}
              />
            }
          />
        ))}
      </MxCard>
      <MxButton variant="secondary" icon="add" block onPress={onAdd} node="languages/add">
        Add language pair
      </MxButton>
    </View>
  );
}

// --- add sub-view --------------------------------------------------------------

/** Preset pickable languages (native script + English name), per the kit's picker UX. */
const LANGUAGE_CHOICES = [
  { native: '한국어', english: 'Korean' },
  { native: '日本語', english: 'Japanese' },
  { native: '中文', english: 'Chinese' },
  { native: 'Tiếng Việt', english: 'Vietnamese' },
  { native: 'Español', english: 'Spanish' },
  { native: 'Français', english: 'French' },
  { native: 'English', english: 'English' },
] as const;

type LanguageChoice = (typeof LANGUAGE_CHOICES)[number];

/**
 * Kit `_features/languages/components/LangCard.jsx`: an interactive card row —
 * icon · bold name over its English sub · expand_more chevron — used for the
 * LEARNING and NATIVE pickers in the add form.
 */
function LangCard({
  theme: t,
  icon,
  name,
  sub,
  node,
  onPress,
}: {
  theme: Theme;
  icon: string;
  name: string;
  sub: string;
  node: string;
  onPress: () => void;
}) {
  return (
    <MxCard node={node} padding="sm" interactive onPress={onPress} accessibilityLabel={`${sub}. Change`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
        <Icon name={icon} size={t.iconSize.lg} color={t.color.textSecondary} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>{name}</Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, marginTop: t.space[1] }]}>
            {sub}
          </Text>
        </View>
        <Icon name="expand_more" size={t.iconSize.md} color={t.color.textTertiary} />
      </View>
    </MxCard>
  );
}

function AddPairView({
  theme: t,
  onAdd,
  onDone,
  leading,
}: {
  theme: Theme;
  onAdd: LanguagesScreenProps['onAdd'];
  onDone: () => void;
  leading: React.ReactNode;
}) {
  // Kit add form: two preset picker cards (LEARNING / NATIVE), not free text.
  const [learning, setLearning] = useState<LanguageChoice>(LANGUAGE_CHOICES[0]);
  const [native, setNative] = useState<LanguageChoice>(
    LANGUAGE_CHOICES.find((l) => l.english === 'English') ?? LANGUAGE_CHOICES[0],
  );
  const [picker, setPicker] = useState<'learning' | 'native' | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await onAdd({ learning: learning.native, native: native.native });
    if (isErr(result)) {
      setSubmitting(false);
      setError(result.error);
      return;
    }
    // Success returns to the list (parent switches mode); don't touch local state after.
    onDone();
  };

  // No per-field inputs any more (kit picker form) — surface validation issues in the banner.
  const bannerMessage = !error
    ? null
    : error.kind === 'validation' && error.issues.length > 0
      ? error.issues.map((i) => i.message).join(' ')
      : error.message;

  return (
    <AppScreen node="languages/add-screen" variant="nested" title="Add language pair" leading={leading}>
      {bannerMessage && (
        <View
          testID="languages/add-error"
          accessibilityRole="alert"
          style={{
            backgroundColor: t.color.errorSoft,
            borderRadius: t.radius.control,
            padding: t.space[3],
          }}
        >
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.onErrorSoft }]}>{bannerMessage}</Text>
        </View>
      )}

      <SectionLabel uppercase>Learning</SectionLabel>
      <LangCard
        theme={t}
        icon="language"
        name={learning.native}
        sub={learning.english}
        node="languages/learn-lang"
        onPress={() => setPicker('learning')}
      />

      <View style={{ alignItems: 'center' }}>
        <Icon name="arrow_downward" size="md" color={t.color.textTertiary} />
      </View>

      <SectionLabel uppercase style={{ marginTop: 0 }}>
        Native
      </SectionLabel>
      <LangCard
        theme={t}
        icon="translate"
        name={native.native}
        sub="Meaning language"
        node="languages/native-lang"
        onPress={() => setPicker('native')}
      />

      <MxButton variant="primary" icon="add" block disabled={submitting} onPress={submit} node="languages/add-confirm">
        {submitting ? 'Adding…' : 'Add language pair'}
      </MxButton>

      {picker && (
        <Scrim node="languages/pick-scrim" align="end" onDismiss={() => setPicker(null)}>
          <Sheet title={picker === 'learning' ? 'Learning language' : 'Meaning language'} node="languages/pick-sheet">
            {LANGUAGE_CHOICES.map((l) => (
              <MenuItem
                key={l.english}
                icon={picker === 'learning' ? 'language' : 'translate'}
                label={`${l.native} · ${l.english}`}
                selected={(picker === 'learning' ? learning : native).english === l.english}
                onPress={() => {
                  (picker === 'learning' ? setLearning : setNative)(l);
                  setPicker(null);
                }}
                node={`languages/pick-${l.english.toLowerCase()}`}
              />
            ))}
          </Sheet>
        </Scrim>
      )}
    </AppScreen>
  );
}

// --- remove confirmation -------------------------------------------------------

function RemoveDialog({
  theme: t,
  pair,
  onCancel,
  onConfirm,
  onDone,
}: {
  theme: Theme;
  pair: LanguagePairView;
  onCancel: () => void;
  onConfirm: LanguagesScreenProps['onRemove'];
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(null);
    const result = await onConfirm(pair.id);
    if (isErr(result)) {
      setBusy(false);
      setFailed(result.error.message);
      return;
    }
    // Success unmounts the dialog via the parent; don't touch local state after.
    onDone();
  };

  // Kit RemoveLanguageDialog: shared ConfirmDialog — centered Scrim + Dialog with the
  // error icon tile and full-width split Cancel / Remove actions.
  return (
    <Scrim node="languages/remove-scrim" align="center" onDismiss={onCancel}>
      <Dialog
        node="languages/remove-dialog"
        icon="delete"
        tone="error"
        title={`Remove ${pairTitle(pair)}?`}
        text="All decks and cards for this pair will be deleted. This can’t be undone."
        actions={[
          <MxButton key="cancel" variant="ghost" block onPress={onCancel} node="languages/remove-cancel">
            Cancel
          </MxButton>,
          <MxButton
            key="ok"
            variant="primary"
            danger
            block
            disabled={busy}
            onPress={confirm}
            node="languages/remove-confirm"
          >
            {busy ? 'Removing…' : 'Remove'}
          </MxButton>,
        ]}
      >
        {failed ? (
          <Text
            testID="languages/remove-error"
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
