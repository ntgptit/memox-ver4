/**
 * Deck-settings screen (WBS 4.5). Manage a deck's metadata + lifecycle: rename, move
 * to another language pair, reset progress, or delete — each via an overlay (action
 * sheet → rename dialog / move sheet / danger confirms). No content list.
 *
 * Presentational and prop-driven: the write handlers resolve to a {@link Result} so
 * validation/failure render inline; the container wires the use cases + repositories.
 */

import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import {
  AppScreen,
  MxCard,
  MxButton,
  MxIconButton,
  MxTextField,
  Icon,
  useTheme,
  type Theme,
} from '@/design-system';
import { type Result, type AppError, isErr } from '@/shared';

export interface LanguagePairOption {
  id: string;
  label: string;
}

export type DeckSettingsOverlay = 'actions' | 'rename' | 'move' | 'reset' | 'delete' | null;

export interface DeckSettingsScreenProps {
  deckTitle: string;
  languagePairs: readonly LanguagePairOption[];
  currentPairId?: string;
  onRename: (title: string) => Promise<Result<unknown, AppError>>;
  onMove: (pairId: string) => Promise<Result<unknown, AppError>>;
  onReset: () => Promise<Result<unknown, AppError>>;
  onDelete: () => Promise<Result<unknown, AppError>>;
  onExport?: () => void;
  onBack?: () => void;
  /** After a destructive success (delete), navigate away. */
  onDone?: () => void;
  /** Preview/testing: open a specific overlay initially (default: the action sheet). */
  initialOverlay?: DeckSettingsOverlay;
}

export function DeckSettingsScreen(props: DeckSettingsScreenProps) {
  const t = useTheme();
  const { deckTitle, onBack, initialOverlay = 'actions' } = props;
  const [overlay, setOverlay] = useState<DeckSettingsOverlay>(initialOverlay);

  return (
    <AppScreen
      node="deck-settings/screen"
      variant="nested"
      title={deckTitle}
      leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="deck-settings/back" />}
      actions={
        <MxIconButton
          icon="more_vert"
          accessibilityLabel="Deck actions"
          onPress={() => setOverlay('actions')}
          node="deck-settings/more"
        />
      }
    >
      <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>Manage this deck.</Text>

      {overlay === 'actions' && (
        <ActionsSheet
          theme={t}
          onDismiss={() => setOverlay(null)}
          onRename={() => setOverlay('rename')}
          onMove={() => setOverlay('move')}
          onReset={() => setOverlay('reset')}
          onDelete={() => setOverlay('delete')}
          onExport={props.onExport}
        />
      )}
      {overlay === 'rename' && (
        <RenameDialog theme={t} initial={deckTitle} onRename={props.onRename} onClose={() => setOverlay(null)} />
      )}
      {overlay === 'move' && (
        <MoveSheet
          theme={t}
          pairs={props.languagePairs}
          currentPairId={props.currentPairId}
          onMove={props.onMove}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === 'reset' && (
        <ConfirmDialog
          theme={t}
          node="deck-settings/reset-dialog"
          icon="restart_alt"
          title="Reset progress?"
          text="Reset every card in this deck back to New? Their review boxes and due dates will be cleared."
          confirmLabel="Reset"
          onConfirm={props.onReset}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === 'delete' && (
        <ConfirmDialog
          theme={t}
          node="deck-settings/delete-dialog"
          icon="delete"
          title="Delete this deck?"
          text="Deleting removes every subdeck, card and review state inside. This can’t be undone."
          confirmLabel="Delete"
          onConfirm={props.onDelete}
          onClose={() => setOverlay(null)}
          onSuccess={props.onDone}
        />
      )}
    </AppScreen>
  );
}

// --- overlay chrome ------------------------------------------------------------

function Scrim({
  theme: t,
  node,
  onDismiss,
  align,
  children,
}: {
  theme: Theme;
  node: string;
  onDismiss: () => void;
  align: 'center' | 'end';
  children: React.ReactNode;
}) {
  // Render in a Modal so the overlay covers the whole screen (portaled above the app
  // shell), independent of how tall the backdrop content is.
  return (
    <Modal transparent visible animationType="none" onRequestClose={onDismiss}>
      <View style={{ flex: 1 }}>
        <Pressable
          testID={`${node}-scrim`}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.color.scrim }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: align === 'end' ? 'flex-end' : 'center',
            alignItems: 'center',
            padding: align === 'center' ? t.space[4] : 0,
          }}
          pointerEvents="box-none"
        >
          <View onStartShouldSetResponder={() => true} accessibilityViewIsModal style={{ width: '100%' }}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function sheetStyle(t: Theme) {
  return {
    backgroundColor: t.color.surfaceRaised,
    borderTopLeftRadius: t.radius.lg,
    borderTopRightRadius: t.radius.lg,
    paddingTop: t.space[4],
    paddingBottom: t.space[6],
    paddingHorizontal: t.space[4],
    gap: t.space[1],
  } as const;
}

function MenuRow({
  theme: t,
  icon,
  label,
  danger,
  onPress,
  node,
}: {
  theme: Theme;
  icon: string;
  label: string;
  danger?: boolean;
  onPress: () => void;
  node: string;
}) {
  const color = danger ? t.color.error : t.color.text;
  return (
    <Pressable
      testID={node}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        minHeight: t.layout.touchMin,
        paddingHorizontal: t.space[2],
        borderRadius: t.radius.md,
      }}
    >
      <Icon name={icon} size="sm" color={color} />
      <Text style={[t.font.text({ size: 'base' }), { color, flex: 1 }]}>{label}</Text>
    </Pressable>
  );
}

function ActionsSheet({
  theme: t,
  onDismiss,
  onRename,
  onMove,
  onReset,
  onDelete,
  onExport,
}: {
  theme: Theme;
  onDismiss: () => void;
  onRename: () => void;
  onMove: () => void;
  onReset: () => void;
  onDelete: () => void;
  onExport?: () => void;
}) {
  return (
    <Scrim theme={t} node="deck-settings/actions" onDismiss={onDismiss} align="end">
      <View style={sheetStyle(t)}>
        <Text accessibilityRole="header" style={[t.font.text({ size: 'md', weight: 'bold' }), { color: t.color.text }]}>
          Deck actions
        </Text>
        <MenuRow theme={t} icon="edit" label="Rename deck" onPress={onRename} node="deck-settings/action-rename" />
        <MenuRow theme={t} icon="drive_file_move" label="Move deck" onPress={onMove} node="deck-settings/action-move" />
        {onExport && (
          <MenuRow theme={t} icon="ios_share" label="Export deck" onPress={onExport} node="deck-settings/action-export" />
        )}
        <MenuRow theme={t} icon="restart_alt" label="Reset progress" onPress={onReset} node="deck-settings/action-reset" />
        <MenuRow theme={t} icon="delete" label="Delete deck" danger onPress={onDelete} node="deck-settings/action-delete" />
      </View>
    </Scrim>
  );
}

function MoveSheet({
  theme: t,
  pairs,
  currentPairId,
  onMove,
  onClose,
}: {
  theme: Theme;
  pairs: readonly LanguagePairOption[];
  currentPairId?: string;
  onMove: DeckSettingsScreenProps['onMove'];
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const pick = async (id: string) => {
    if (busy || id === currentPairId) return;
    setBusy(true);
    const result = await onMove(id);
    setBusy(false);
    if (!isErr(result)) onClose();
  };
  return (
    <Scrim theme={t} node="deck-settings/move" onDismiss={onClose} align="end">
      <View style={sheetStyle(t)}>
        <Text accessibilityRole="header" style={[t.font.text({ size: 'md', weight: 'bold' }), { color: t.color.text }]}>
          Move to
        </Text>
        {pairs.map((p) => {
          const current = p.id === currentPairId;
          return (
            <Pressable
              key={p.id}
              testID={`deck-settings/move-${p.id}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: current, disabled: current }}
              accessibilityLabel={p.label}
              onPress={() => pick(p.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.space[3],
                minHeight: t.layout.touchMin,
                paddingHorizontal: t.space[2],
                borderRadius: t.radius.md,
                opacity: current ? t.opacity.half : 1,
              }}
            >
              <Icon name="translate" size="sm" color={t.color.textSecondary} />
              <Text style={[t.font.text({ size: 'base' }), { color: t.color.text, flex: 1 }]}>{p.label}</Text>
              {current ? (
                <Text style={[t.font.text({ size: 'xs' }), { color: t.color.textTertiary }]}>Current</Text>
              ) : (
                <Icon name="chevron_right" size="sm" color={t.color.textTertiary} />
              )}
            </Pressable>
          );
        })}
      </View>
    </Scrim>
  );
}

function RenameDialog({
  theme: t,
  initial,
  onRename,
  onClose,
}: {
  theme: Theme;
  initial: string;
  onRename: DeckSettingsScreenProps['onRename'];
  onClose: () => void;
}) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState<AppError | null>(null);
  const [busy, setBusy] = useState(false);

  const fieldError = error?.kind === 'validation' ? error.issues.find((i) => i.field === 'title')?.message : undefined;

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await onRename(name);
    if (isErr(result)) {
      setBusy(false);
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <Scrim theme={t} node="deck-settings/rename" onDismiss={onClose} align="center">
      <MxCard node="deck-settings/rename-dialog" variant="elevated">
        <View style={{ gap: t.space[3] }}>
          <Text accessibilityRole="header" style={[t.font.text({ size: 'lg', weight: 'bold' }), { color: t.color.text }]}>
            Rename deck
          </Text>
          <MxTextField
            node="deck-settings/rename-input"
            label="Deck name"
            value={name}
            onChangeText={setName}
            error={fieldError}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: t.space[2] }}>
            <MxButton variant="ghost" onPress={onClose} node="deck-settings/rename-cancel">
              Cancel
            </MxButton>
            <MxButton variant="primary" disabled={busy} onPress={save} node="deck-settings/rename-ok">
              {busy ? 'Saving…' : 'Save'}
            </MxButton>
          </View>
        </View>
      </MxCard>
    </Scrim>
  );
}

function ConfirmDialog({
  theme: t,
  node,
  icon,
  title,
  text,
  confirmLabel,
  onConfirm,
  onClose,
  onSuccess,
}: {
  theme: Theme;
  node: string;
  icon: string;
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => Promise<Result<unknown, AppError>>;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(null);
    const result = await onConfirm();
    if (isErr(result)) {
      setBusy(false);
      setFailed(result.error.message);
      return;
    }
    onClose();
    onSuccess?.();
  };

  return (
    <Scrim theme={t} node={node} onDismiss={onClose} align="center">
      <MxCard node={node} variant="elevated">
        <View style={{ gap: t.space[3], alignItems: 'flex-start' }}>
          <Icon name={icon} color={t.color.error} />
          <Text accessibilityRole="header" style={[t.font.text({ size: 'lg', weight: 'bold' }), { color: t.color.text }]}>
            {title}
          </Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>{text}</Text>
          {failed && (
            <View
              testID={`${node}-error`}
              accessibilityRole="alert"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.space[2],
                alignSelf: 'stretch',
                borderWidth: t.stroke.hairline,
                borderColor: t.color.error,
                borderRadius: t.radius.md,
                padding: t.space[2],
              }}
            >
              <Icon name="error" size="sm" color={t.color.error} />
              <Text style={[t.font.text({ size: 'sm' }), { color: t.color.text, flex: 1 }]}>{failed}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: t.space[2], alignSelf: 'stretch' }}>
            <MxButton variant="ghost" onPress={onClose} node={`${node}-cancel`}>
              Cancel
            </MxButton>
            <MxButton variant="primary" danger disabled={busy} onPress={confirm} node={`${node}-ok`}>
              {busy ? `${confirmLabel}…` : confirmLabel}
            </MxButton>
          </View>
        </View>
      </MxCard>
    </Scrim>
  );
}
