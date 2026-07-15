/**
 * Deck-settings screen (WBS 4.5). Manage a deck's metadata + lifecycle: rename, move
 * to another language pair, reset progress, or delete — each via an overlay (action
 * sheet → rename dialog / move sheet / danger confirms). No content list.
 *
 * Presentational and prop-driven: the write handlers resolve to a {@link Result} so
 * validation/failure render inline; the container wires the use cases + repositories.
 */

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AppScreen,
  MxButton,
  MxIconButton,
  MxIconTile,
  Icon,
  Scrim,
  Sheet,
  MenuItem,
  Dialog,
  DialogInput,
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
          deckTitle={deckTitle}
          onDismiss={() => setOverlay(null)}
          onRename={() => setOverlay('rename')}
          onMove={() => setOverlay('move')}
          onReset={() => setOverlay('reset')}
          onDelete={() => setOverlay('delete')}
          onExport={props.onExport}
        />
      )}
      {overlay === 'rename' && (
        <RenameDialog initial={deckTitle} onRename={props.onRename} onClose={() => setOverlay(null)} />
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

// --- overlay chrome (composed from the shared Scrim/Sheet/MenuItem/Dialog) ------

function ActionsSheet({
  deckTitle,
  onDismiss,
  onRename,
  onMove,
  onReset,
  onDelete,
  onExport,
}: {
  deckTitle: string;
  onDismiss: () => void;
  onRename: () => void;
  onMove: () => void;
  onReset: () => void;
  onDelete: () => void;
  onExport?: () => void;
}) {
  // Kit DeckActionsSheet titles the sheet with the DECK NAME, not a generic label.
  return (
    <Scrim node="deck-settings/actions-scrim" onDismiss={onDismiss} align="end">
      <Sheet title={deckTitle} node="deck-settings/actions-sheet">
        <MenuItem icon="edit" label="Rename deck" onPress={onRename} node="deck-settings/action-rename" />
        <MenuItem icon="drive_file_move" label="Move deck" onPress={onMove} node="deck-settings/action-move" />
        {onExport && (
          <MenuItem
            icon="ios_share"
            label="Export deck"
            // Close the sheet BEFORE navigating (audit: a sheet left open blocks
            // the pushed screen on web and lingers behind it on native).
            onPress={() => {
              onDismiss();
              onExport();
            }}
            node="deck-settings/action-export"
          />
        )}
        <MenuItem icon="restart_alt" label="Reset progress" onPress={onReset} node="deck-settings/action-reset" />
        <MenuItem icon="delete" label="Delete deck" danger onPress={onDelete} node="deck-settings/action-delete" />
      </Sheet>
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
  // Kit DeckMoveSheet: pick a destination row (radio), then confirm with the
  // primary block "Move" button (`deck-settings/move-apply`) — not move-on-tap.
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const apply = async () => {
    if (busy || !selected) return;
    setBusy(true);
    const result = await onMove(selected);
    setBusy(false);
    if (!isErr(result)) onClose();
  };
  return (
    <Scrim node="deck-settings/move-scrim" onDismiss={onClose} align="end">
      <Sheet title="Move to" node="deck-settings/move-sheet">
        {pairs.map((p, i) => {
          const current = p.id === currentPairId;
          const picked = p.id === selected;
          const last = i === pairs.length - 1;
          return (
            <Pressable
              key={p.id}
              testID={`deck-settings/move-${p.id}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: current || picked, disabled: current }}
              accessibilityLabel={current ? `${p.label} (current)` : p.label}
              onPress={() => {
                if (!current) setSelected(p.id);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.space[4],
                paddingBottom: last ? 0 : t.space[4],
                marginBottom: last ? 0 : t.space[4],
                borderBottomWidth: last ? 0 : t.stroke.hairline,
                borderBottomColor: t.color.divider,
                opacity: current ? t.opacity.muted : 1,
              }}
            >
              <MxIconTile icon="translate" />
              <Text
                numberOfLines={1}
                style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text, flex: 1 }]}
              >
                {p.label}
              </Text>
              {!current && (
                <Icon
                  name={picked ? 'radio_button_checked' : 'radio_button_unchecked'}
                  size={t.iconSize.md}
                  color={picked ? t.color.primary : t.color.textTertiary}
                />
              )}
            </Pressable>
          );
        })}
        <View style={{ marginTop: t.space[2] }}>
          <MxButton variant="primary" block disabled={busy || !selected} onPress={apply} node="deck-settings/move-apply">
            {busy ? 'Moving…' : 'Move'}
          </MxButton>
        </View>
      </Sheet>
    </Scrim>
  );
}

function RenameDialog({
  initial,
  onRename,
  onClose,
}: {
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
    <Scrim node="deck-settings/rename-scrim" onDismiss={onClose} align="center">
      <Dialog
        node="deck-settings/rename-dialog"
        icon="edit"
        title="Rename deck"
        actionsLayout="end"
        body={
          <DialogInput
            node="deck-settings/rename-input"
            label="Deck name"
            value={name}
            onChangeText={setName}
            error={fieldError}
          />
        }
        actions={[
          <MxButton key="cancel" variant="ghost" onPress={onClose} node="deck-settings/rename-cancel">
            Cancel
          </MxButton>,
          <MxButton key="ok" variant="primary" disabled={busy} onPress={save} node="deck-settings/rename-ok">
            {busy ? 'Saving…' : 'Save'}
          </MxButton>,
        ]}
      />
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
    <Scrim node={`${node}-scrim`} onDismiss={onClose} align="center">
      <Dialog
        node={node}
        icon={icon}
        tone="error"
        title={title}
        text={text}
        actions={[
          <MxButton key="cancel" variant="ghost" block onPress={onClose} node={`${node}-cancel`}>
            Cancel
          </MxButton>,
          <MxButton
            key="ok"
            variant="primary"
            danger
            block
            disabled={busy}
            onPress={confirm}
            node={`${node}-ok`}
          >
            {busy ? `${confirmLabel}…` : confirmLabel}
          </MxButton>,
        ]}
      >
        {failed ? (
          <View
            testID={`${node}-error`}
            accessibilityRole="alert"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[2],
              alignSelf: 'stretch',
              backgroundColor: t.color.errorSoft,
              borderRadius: t.radius.md,
              padding: t.space[3],
            }}
          >
            <Icon name="error" size="sm" color={t.color.onErrorSoft} />
            <Text style={[t.font.text({ size: 'sm' }), { color: t.color.onErrorSoft, flex: 1 }]}>{failed}</Text>
          </View>
        ) : null}
      </Dialog>
    </Scrim>
  );
}
