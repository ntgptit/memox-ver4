/**
 * Flashcard-editor screen (WBS 4.4) — a focused create/update form for ONE card;
 * the single primary action is the sticky bottom Save bar (keyboard-reachable).
 * Composition mirrors the kit `_features/flashcard-editor/FlashcardEditor.jsx`:
 * modal bar (Close · title) → deck-context pill → dup/submit banners → Term
 * (with the compact AudioRow) → Meaning (with add-translation) → optional
 * Translation → Tags → collapsed More options (Example pair + Hide-during-study)
 * → SaveBar. 9 states (contract §6). Language labels are DECK-DRIVEN.
 */

import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View, type TextInput } from 'react-native';

import { AppScreen, Icon, MxButton, MxIconButton, useTheme } from '@/design-system';

import {
  AudioRow,
  Banner,
  DeckContext,
  DupBanner,
  Field,
  SaveBar,
  TagsField,
  VisibilityRow,
} from './flashcard-editor-components';
import type { EditorDeckContext, EditorValues, FlashcardEditorUiState } from './flashcard-editor-fixtures';

export interface FieldErrors {
  term?: string;
  meaning?: string;
}

export interface FlashcardEditorScreenProps {
  deck: EditorDeckContext;
  values: EditorValues;
  /** Edit mode: "Edit card" title, More options pre-expanded, keep-adding ticked. */
  editing?: boolean;
  ui?: FlashcardEditorUiState;
  errors?: FieldErrors;
  onChange?: (patch: Partial<EditorValues>) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onPlayAudio?: () => void;
  onAddTranslation?: () => void;
  onRemoveTranslation?: () => void;
  onViewExisting?: () => void;
  onAddAnyway?: () => void;
  onRetrySave?: () => void;
  /** Whether the translation field is expanded (kit additional-translation). */
  showTranslation?: boolean;
  /** Whether the form has unsaved valid input (enables Save). */
  dirty?: boolean;
}

export function FlashcardEditorScreen({
  deck,
  values,
  editing = false,
  ui = editing ? 'edit' : 'create',
  errors,
  onChange,
  onSave,
  onCancel,
  onPlayAudio,
  onAddTranslation,
  onRemoveTranslation,
  onViewExisting,
  onAddAnyway,
  onRetrySave,
  showTranslation,
  dirty = editing,
}: FlashcardEditorScreenProps) {
  const t = useTheme();
  const invalid = ui === 'validation' || errors !== undefined;
  const submitting = ui === 'submitting';
  const success = ui === 'submit-success';
  const submitError = ui === 'submit-error';
  const title = editing ? 'Edit card' : 'New card';
  const disabledForm = submitting;
  // Never active on blank/invalid/pristine — and frozen while saving/saved.
  const saveDisabled = !dirty || invalid || submitting || success;
  const saveLabel = submitting ? 'Saving…' : success ? 'Done' : 'Save';
  const translationOpen = showTranslation ?? ui === 'additional-translation';

  // Kit: More options and the keep-adding tick pre-set ONLY in the edit state.
  const [moreOpen, setMoreOpen] = useState(ui === 'edit');
  const [keepAdding, setKeepAdding] = useState(ui === 'edit');
  const meaningRef = useRef<TextInput>(null);

  const termError = errors?.term ?? (ui === 'validation' ? 'Enter a term.' : null);
  const meaningError = errors?.meaning ?? (ui === 'validation' ? 'Enter a meaning.' : null);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppScreen
        node="flashcard-editor/screen"
        variant="modal"
        title={title}
        leading={
          <MxIconButton icon="close" size="sm" accessibilityLabel="Cancel" disabled={submitting} onPress={onCancel} node="flashcard-editor/cancel" />
        }
        footer={
          <SaveBar
            label={saveLabel}
            disabled={saveDisabled}
            keepAdding={keepAdding}
            onKeepAddingChange={setKeepAdding}
            onSave={onSave}
          />
        }
      >
        <DeckContext name={deck.name} />

        {ui === 'duplicate' && (
          <DupBanner term={values.term} onViewExisting={onViewExisting} onAddAnyway={onAddAnyway} />
        )}
        {submitError && (
          <Banner
            node="flashcard-editor/save-error"
            tone="error"
            icon="error_outline"
            text="Couldn’t save the card. Your changes are still here."
            action={
              <MxButton variant="secondary" size="sm" onPress={onRetrySave} node="flashcard-editor/save-retry">
                Try again
              </MxButton>
            }
          />
        )}
        {success && <Banner node="flashcard-editor/save-success" tone="success" icon="check_circle" text="Card saved." />}

        {/* CARD CONTENT — Term & Meaning share the same base height. */}
        <View style={{ gap: t.space[3] }}>
          <Field
            label={`Term · ${deck.termLabel}`}
            required
            node="flashcard-editor/term"
            value={values.term}
            placeholder="Enter a term"
            autoFocus={ui === 'create'}
            returnKeyType="next"
            onChangeText={(v) => onChange?.({ term: v })}
            onSubmitEditing={() => meaningRef.current?.focus()}
            error={termError}
            disabled={disabledForm}
            trailing={<AudioRow status={ui === 'audio-generating' ? 'generating' : 'auto'} onPlay={onPlayAudio} />}
          />

          <Field
            ref={meaningRef}
            label={`Meaning · ${deck.meaningLabel}`}
            required
            multiline
            node="flashcard-editor/meaning"
            value={values.meaning}
            placeholder="Enter the meaning"
            onChangeText={(v) => onChange?.({ meaning: v })}
            labelAction={
              <MxIconButton
                icon="add"
                size="sm"
                accessibilityLabel={`Add ${deck.altLabel} translation`}
                disabled={disabledForm}
                onPress={onAddTranslation}
                node="flashcard-editor/add-translation"
              />
            }
            error={meaningError}
            disabled={disabledForm}
          />

          {translationOpen && (
            <Field
              label={`Translation · ${deck.altLabel}`}
              node="flashcard-editor/translation"
              value={values.translation}
              placeholder="Enter a translation"
              onChangeText={(v) => onChange?.({ translation: v })}
              labelAction={
                <MxIconButton
                  icon="close"
                  size="sm"
                  accessibilityLabel="Remove translation"
                  onPress={onRemoveTranslation}
                  node="flashcard-editor/translation-remove"
                />
              }
            />
          )}
        </View>

        <TagsField tags={values.tags} disabled={disabledForm} />

        {/* MORE OPTIONS — collapsed by default so the base form stays Term → Meaning. */}
        <View style={{ gap: t.space[3] }}>
          <Pressable
            testID="flashcard-editor/more-toggle"
            accessibilityRole="button"
            accessibilityLabel="More options"
            accessibilityState={{ expanded: moreOpen }}
            onPress={() => setMoreOpen((v) => !v)}
            style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: t.space[1], paddingVertical: t.space[2] }}
          >
            <Icon name={moreOpen ? 'expand_less' : 'expand_more'} size={t.iconSize.sm} color={t.color.textSecondary} />
            <Text style={[t.font.text({ size: 'sm', weight: 'bold' }), { color: t.color.textSecondary }]}>
              More options
            </Text>
          </Pressable>
          {moreOpen && (
            <View style={{ gap: t.space[3] }}>
              <Field
                label="Example"
                multiline
                node="flashcard-editor/example"
                value={values.example}
                placeholder="Add an example sentence"
                onChangeText={(v) => onChange?.({ example: v })}
                disabled={disabledForm}
              />
              <Field
                label="Example translation"
                multiline
                node="flashcard-editor/example-translation"
                value={values.exampleTranslation}
                placeholder="Translate the example"
                onChangeText={(v) => onChange?.({ exampleTranslation: v })}
                disabled={disabledForm}
              />
              <VisibilityRow value={values.hidden} onChange={(v) => onChange?.({ hidden: v })} disabled={disabledForm} />
            </View>
          )}
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}
