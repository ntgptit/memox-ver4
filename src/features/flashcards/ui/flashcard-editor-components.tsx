/**
 * Flashcard-editor feature-local components (WBS 4.4) — RN ports of the kit's
 * `_features/flashcard-editor/components/*` plus its screen-local helpers:
 * Field (labelled text input with error/supporting/trailing), DupBanner
 * (duplicate warning with View-existing/Add-anyway), AudioRow (compact
 * pronunciation control in the Term field), Banner (submit error/success),
 * TagsField, VisibilityRow (hide-during-study switch), KeepAdding checkbox,
 * DeckContext pill and the sticky SaveBar.
 */

import { forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInput as TextInputT } from 'react-native';
import type { ReactNode } from 'react';

import { Icon, MxButton, MxChip, MxIconButton, MxSwitch, Spinner, useTheme } from '@/design-system';

/** Kit DeckContext: the sunken deck pill anchoring which deck the card saves into. */
export function DeckContext({ name }: { name: string }) {
  const t = useTheme();
  return (
    <View
      testID="flashcard-editor/deck-context"
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[2],
        paddingVertical: t.space[2],
        paddingHorizontal: t.space[3],
        borderRadius: t.radius.pill,
        backgroundColor: t.color.surfaceSunken,
      }}
    >
      <Icon name="folder" size={t.iconSize.sm} color={t.color.primary} />
      <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textTertiary }]}>Deck</Text>
      <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>{name}</Text>
    </View>
  );
}

export interface FieldProps {
  label: string;
  labelAction?: ReactNode;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  error?: string | null;
  supporting?: string;
  required?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  autoFocus?: boolean;
  onChangeText?: (v: string) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'next' | 'done';
  node?: string;
}

/**
 * Kit Field: label row (label + optional labelAction) · input surface ·
 * error/supporting text. Term & Meaning share the same base height (touch-min);
 * multiline lets the surface grow as content wraps.
 */
export const Field = forwardRef<TextInputT, FieldProps>(function Field(
  {
    label,
    labelAction,
    value,
    placeholder,
    multiline = false,
    error,
    supporting,
    required = false,
    disabled = false,
    trailing,
    autoFocus = false,
    onChangeText,
    onSubmitEditing,
    returnKeyType,
    node,
  },
  ref,
) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const hasError = error !== null && error !== undefined;

  return (
    <View testID={node} style={{ gap: t.space[2], opacity: disabled ? t.opacity.muted : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.space[2] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[1] }}>
          <Text style={[t.font.text({ size: 'sm', weight: 'bold' }), { color: t.color.textSecondary }]}>{label}</Text>
          {required && (
            <Text accessibilityElementsHidden style={[t.font.text({ size: 'sm', weight: 'bold' }), { color: t.color.error }]}>
              *
            </Text>
          )}
        </View>
        {labelAction}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: t.space[2],
          minHeight: t.layout.touchMin,
          paddingVertical: t.space[3],
          paddingHorizontal: t.space[4],
          borderRadius: t.radius.control,
          backgroundColor: disabled ? t.color.surfaceSunken : t.color.surface,
          borderWidth: hasError ? t.stroke.emphasis : t.stroke.hairline,
          borderColor: hasError ? t.color.error : focused ? t.color.focusRing : t.color.divider,
        }}
      >
        <TextInput
          ref={ref}
          testID={node ? `${node}-input` : undefined}
          accessibilityLabel={label}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={t.color.textTertiary}
          multiline={multiline}
          editable={!disabled}
          autoFocus={autoFocus}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType={returnKeyType}
          style={[
            t.font.text({ size: 'base', lineHeight: 'normal' }),
            { flex: 1, minWidth: 0, color: t.color.text, padding: 0, outlineStyle: 'none' },
          ]}
        />
        {trailing}
      </View>
      {hasError ? (
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.error }]}>{error}</Text>
      ) : supporting !== undefined ? (
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textTertiary }]}>{supporting}</Text>
      ) : null}
    </View>
  );
});

/** Kit AudioRow: compact pronunciation control in the Term field's trailing slot. */
export function AudioRow({
  status,
  onPlay,
  onRetry,
}: {
  status: 'auto' | 'ready' | 'generating' | 'error';
  onPlay?: () => void;
  onRetry?: () => void;
}) {
  const t = useTheme();
  if (status === 'generating') {
    return (
      <View
        testID="flashcard-editor/audio-row"
        accessibilityLabel="Generating pronunciation"
        style={{ width: t.layout.touchMin, height: t.layout.touchMin, alignItems: 'center', justifyContent: 'center' }}
      >
        <Spinner node="flashcard-editor/audio-spinner" />
      </View>
    );
  }
  if (status === 'error') {
    return (
      <View testID="flashcard-editor/audio-row">
        <MxIconButton icon="error" size="sm" accessibilityLabel="Retry pronunciation" onPress={onRetry} node="flashcard-editor/audio-retry" />
      </View>
    );
  }
  return (
    <View testID="flashcard-editor/audio-row">
      <MxIconButton icon="volume_up" size="sm" accessibilityLabel="Play pronunciation" onPress={onPlay} node="flashcard-editor/audio-play" />
    </View>
  );
}

/** Kit DupBanner: a WARNING (not an error) steering to the safe action. */
export function DupBanner({
  term,
  onViewExisting,
  onAddAnyway,
}: {
  term: string;
  onViewExisting?: () => void;
  onAddAnyway?: () => void;
}) {
  const t = useTheme();
  const fg = t.color.onWarningSoft;
  return (
    <View
      testID="flashcard-editor/dup-warning"
      accessibilityRole="alert"
      style={{
        backgroundColor: t.color.warningSoft,
        borderRadius: t.radius.control,
        paddingVertical: t.space[3],
        paddingHorizontal: t.space[4],
        gap: t.space[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space[2] }}>
        <Icon name="warning" size={t.iconSize.md} color={fg} />
        <Text style={[t.font.text({ size: 'sm', lineHeight: 'normal' }), { color: fg, flex: 1, minWidth: 0 }]}>
          A card “{term}” already exists in this deck.
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[2] }}>
        <MxButton variant="secondary" size="sm" onPress={onViewExisting} node="flashcard-editor/dup-view">
          View existing
        </MxButton>
        <MxButton variant="ghost" size="sm" onPress={onAddAnyway} node="flashcard-editor/dup-add">
          Add anyway
        </MxButton>
      </View>
    </View>
  );
}

/** Kit Banner: recoverable inline submit error/success note with optional action. */
export function Banner({
  tone,
  icon,
  text,
  action,
  node,
}: {
  tone: 'error' | 'success' | 'warning';
  icon: string;
  text: string;
  action?: ReactNode;
  node?: string;
}) {
  const t = useTheme();
  const bg = tone === 'error' ? t.color.errorSoft : tone === 'success' ? t.color.successSoft : t.color.warningSoft;
  const fg = tone === 'error' ? t.color.onErrorSoft : tone === 'success' ? t.color.onSuccessSoft : t.color.onWarningSoft;
  return (
    <View
      testID={node}
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        paddingVertical: t.space[3],
        paddingHorizontal: t.space[4],
        borderRadius: t.radius.card,
        backgroundColor: bg,
      }}
    >
      <Icon name={icon} size={t.iconSize.md} color={fg} />
      <Text style={[t.font.text({ size: 'sm', lineHeight: 'normal' }), { color: fg, flex: 1, minWidth: 0 }]}>{text}</Text>
      {action}
    </View>
  );
}

/** Kit TagsField: compact chip row on a bordered surface (placeholder when empty). */
export function TagsField({ tags, disabled }: { tags: readonly string[]; disabled?: boolean }) {
  const t = useTheme();
  return (
    <View testID="flashcard-editor/tags" style={{ gap: t.space[2], opacity: disabled ? t.opacity.muted : 1 }}>
      <Text style={[t.font.text({ size: 'sm', weight: 'bold' }), { color: t.color.textSecondary }]}>Tags</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: t.space[2],
          minHeight: t.layout.touchMin,
          paddingVertical: t.space[2],
          paddingHorizontal: t.space[4],
          borderRadius: t.radius.control,
          backgroundColor: t.color.surface,
          borderWidth: t.stroke.hairline,
          borderColor: t.color.divider,
        }}
      >
        <Icon name="sell" size={t.iconSize.sm} color={t.color.textTertiary} />
        {tags.length > 0 ? (
          tags.map((tag, i) => <MxChip key={tag} label={tag} node={`flashcard-editor/tag-${i}`} />)
        ) : (
          <Text style={[t.font.text({ size: 'base' }), { color: t.color.textTertiary }]}>
            Add tags — e.g. #TOPIK_I, #동사
          </Text>
        )}
      </View>
    </View>
  );
}

/** Kit VisibilityRow: flat sunken hide-during-study switch row (More options). */
export function VisibilityRow({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      testID="flashcard-editor/visibility"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[4],
        paddingVertical: t.space[3],
        paddingHorizontal: t.space[4],
        borderRadius: t.radius.control,
        backgroundColor: t.color.surfaceSunken,
        opacity: disabled ? t.opacity.muted : 1,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[t.font.text({ size: 'base', weight: 'semibold' }), { color: t.color.text }]}>
          Hide during study
        </Text>
        <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary, marginTop: t.space[1] }]}>
          Excluded from study and review sessions.
        </Text>
      </View>
      <MxSwitch checked={value} onChange={onChange} disabled={disabled} ariaLabel="Hide during study" node="flashcard-editor/visibility-switch" />
    </View>
  );
}

/** Kit KeepAdding: the save-behaviour checkbox above the Save button. */
export function KeepAdding({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      testID="flashcard-editor/keep-adding"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel="Create another card after saving"
      disabled={disabled}
      onPress={() => onChange?.(!value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[2],
        alignSelf: 'flex-start',
        paddingVertical: t.space[1],
        opacity: disabled ? t.opacity.muted : 1,
      }}
    >
      <Icon
        name={value ? 'check_box' : 'check_box_outline_blank'}
        size={t.iconSize.md}
        color={value ? t.color.primary : t.color.textTertiary}
      />
      <Text style={[t.font.text({ size: 'base' }), { color: t.color.textSecondary }]}>
        Create another card after saving
      </Text>
    </Pressable>
  );
}

/** Kit SaveBar: sticky bottom bar — KeepAdding + the single full-width Save CTA. */
export function SaveBar({
  label,
  disabled,
  keepAdding,
  onKeepAddingChange,
  onSave,
}: {
  label: string;
  disabled: boolean;
  keepAdding: boolean;
  onKeepAddingChange?: (v: boolean) => void;
  onSave?: () => void;
}) {
  const t = useTheme();
  return (
    <View
      testID="flashcard-editor/save-bar"
      style={{
        gap: t.space[2],
        paddingTop: t.space[3],
        paddingHorizontal: t.space[4],
        paddingBottom: t.space[4],
        borderTopWidth: t.stroke.hairline,
        borderTopColor: t.color.divider,
        backgroundColor: t.color.surface,
      }}
    >
      <KeepAdding value={keepAdding} onChange={onKeepAddingChange} disabled={disabled} />
      <MxButton variant="primary" block disabled={disabled} onPress={onSave} node="flashcard-editor/save">
        {label}
      </MxButton>
    </View>
  );
}
