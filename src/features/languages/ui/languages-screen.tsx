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
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  AppScreen,
  MxCard,
  MxButton,
  MxTextField,
  Icon,
  ListRow,
  EmptyState,
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
      {data.status === 'error' && <ErrorState theme={t} message={data.message} onRetry={onRetry} />}
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

function fieldError(error: AppError | null, field: string): string | undefined {
  if (!error || error.kind !== 'validation') return undefined;
  return error.issues.find((i) => i.field === field)?.message;
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
  const [learning, setLearning] = useState('');
  const [native, setNative] = useState('');
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await onAdd({ learning, native });
    if (isErr(result)) {
      setSubmitting(false);
      setError(result.error);
      return;
    }
    // Success returns to the list (parent switches mode); don't touch local state after.
    onDone();
  };

  const bannerMessage = error && error.kind !== 'validation' ? error.message : null;

  return (
    <AppScreen node="languages/add-screen" variant="nested" title="Add language pair" leading={leading}>
      <View style={{ gap: t.space[4] }}>
        {bannerMessage && (
          <View
            testID="languages/add-error"
            accessibilityRole="alert"
            style={{
              backgroundColor: t.color.errorSoft,
              borderRadius: t.radius.md,
              padding: t.space[3],
            }}
          >
            <Text style={[t.font.text({ size: 'sm' }), { color: t.color.onErrorSoft }]}>{bannerMessage}</Text>
          </View>
        )}

        <MxTextField
          node="languages/learn-field"
          label="Language to learn"
          placeholder="e.g. Korean"
          value={learning}
          onChangeText={setLearning}
          error={fieldError(error, 'learning')}
        />

        <View style={{ alignItems: 'center' }}>
          <Icon name="arrow_downward" size="md" color={t.color.textTertiary} />
        </View>

        <MxTextField
          node="languages/native-field"
          label="Meaning language"
          placeholder="e.g. English"
          value={native}
          onChangeText={setNative}
          error={fieldError(error, 'native')}
        />

        <MxButton
          variant="primary"
          icon="add"
          block
          disabled={submitting}
          onPress={submit}
          node="languages/add-confirm"
        >
          {submitting ? 'Adding…' : 'Add language pair'}
        </MxButton>
      </View>
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

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Pressable
        testID="languages/remove-scrim"
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onCancel}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.color.scrim }}
      />
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.space[4] }}
        pointerEvents="box-none"
      >
        <View onStartShouldSetResponder={() => true} accessibilityViewIsModal style={{ width: '100%' }}>
          <MxCard node="languages/remove-dialog" variant="elevated">
            <View style={{ gap: t.space[3] }}>
              <Text
                accessibilityRole="header"
                style={[t.font.text({ size: 'lg', weight: 'bold' }), { color: t.color.text }]}
              >
                Remove language pair?
              </Text>
              <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
                {pairTitle(pair)} and its cards will be removed. This can’t be undone.
              </Text>
              {failed && (
                <Text
                  testID="languages/remove-error"
                  accessibilityRole="alert"
                  style={[t.font.text({ size: 'sm' }), { color: t.color.error }]}
                >
                  {failed}
                </Text>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: t.space[2] }}>
                <MxButton variant="ghost" onPress={onCancel} node="languages/remove-cancel">
                  Cancel
                </MxButton>
                <MxButton variant="primary" danger disabled={busy} onPress={confirm} node="languages/remove-confirm">
                  {busy ? 'Removing…' : 'Remove'}
                </MxButton>
              </View>
            </View>
          </MxCard>
        </View>
      </View>
    </View>
  );
}
