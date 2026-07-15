/**
 * Deck-content-choice screen (WBS 3.6, reworked as a FORM after the create-flow UX
 * review): name the deck, pick how it is organised via radio option cards ("Add
 * cards directly" is preselected as the common case), then commit with the single
 * primary CTA — "Create deck" for a new deck, "Save" when reorganising an existing
 * one. Import stays a tertiary link. A simple deck is created on this one screen.
 *
 * Presentational and prop-driven: `onSubmit` persists (name + organisation) and
 * resolves to a {@link Result}. A validation error (blank or duplicate name, field
 * `title`) renders inline under the field; other errors surface as a banner. The
 * container wires it to `createDeck` / `setDeckContentUseCase` over the deck repos.
 */

import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppScreen,
  MxButton,
  MxCard,
  MxIconButton,
  MxIconTile,
  MxTextField,
  MxLink,
  Icon,
  SectionLabel,
  useTheme,
  type Theme,
} from '@/design-system';
import type { DeckOrganisation } from '@/features/library/domain';
import { type Result, type AppError, isErr } from '@/shared';

export interface DeckContentChoiceScreenProps {
  /** Current deck name (from the loaded deck); the field is seeded with it. */
  deckName?: string;
  /** CTA wording: creating a brand-new deck vs saving an existing one. */
  mode?: 'create' | 'save';
  onBack?: () => void;
  /** Persist name + organisation. Resolves to a Result so the screen can show errors. */
  onSubmit: (input: { title: string; organisation: DeckOrganisation }) => Promise<Result<unknown, AppError>>;
  /** Tertiary: import cards from a file instead of organising by hand. */
  onImport?: () => void;
}

const OPTIONS: { organisation: DeckOrganisation; icon: string; title: string; text: string; node: string }[] = [
  {
    organisation: 'cards',
    icon: 'playing_cards',
    title: 'Add cards directly',
    text: 'Use this as a final study deck.',
    node: 'deck-content-choice/cards',
  },
  {
    organisation: 'subdecks',
    icon: 'account_tree',
    title: 'Organise with subdecks',
    text: 'Create nested topics before adding cards.',
    node: 'deck-content-choice/subdecks',
  },
];

function nameError(error: AppError | null): string | undefined {
  if (!error || error.kind !== 'validation') return undefined;
  return error.issues.find((i) => i.field === 'title')?.message ?? error.message;
}

export function DeckContentChoiceScreen({
  deckName = '',
  mode = 'create',
  onBack,
  onSubmit,
  onImport,
}: DeckContentChoiceScreenProps) {
  const t = useTheme();
  const [name, setName] = useState(deckName);
  const [organisation, setOrganisation] = useState<DeckOrganisation>('cards');
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await onSubmit({ title: name, organisation });
    if (isErr(result)) {
      setSubmitting(false);
      setError(result.error);
      return;
    }
    // Success routes away (parent navigates); leave `submitting` set so the CTA stays busy.
  };

  const bannerMessage = error && error.kind !== 'validation' ? error.message : null;
  const ctaLabel = submitting ? (mode === 'create' ? 'Creating…' : 'Saving…') : mode === 'create' ? 'Create deck' : 'Save';

  return (
    <AppScreen
      node="deck-content-choice/screen"
      variant="nested"
      title="New deck"
      leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="deck-content-choice/back" />}
    >
      {bannerMessage && (
        <View
          testID="deck-content-choice/error"
          accessibilityRole="alert"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.space[3],
            backgroundColor: t.color.surface,
            borderWidth: t.stroke.hairline,
            borderColor: t.color.error,
            borderRadius: t.radius.md,
            padding: t.space[3],
          }}
        >
          <Icon name="error" size="sm" color={t.color.error} />
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.text, flex: 1 }]}>{bannerMessage}</Text>
        </View>
      )}

      <MxTextField
        node="deck-content-choice/name"
        label="Deck name"
        placeholder="Name your deck"
        value={name}
        autoFocus
        onChangeText={setName}
        onSubmitEditing={submit}
        error={nameError(error)}
      />

      <View style={{ gap: t.space[2] }}>
        <SectionLabel>ORGANISE</SectionLabel>
        <View style={{ gap: t.space[3] }} accessibilityRole="radiogroup" accessibilityLabel="How to organise the deck">
          {OPTIONS.map((o) => (
            <OrganiseOption
              key={o.organisation}
              theme={t}
              option={o}
              selected={organisation === o.organisation}
              onPress={() => setOrganisation(o.organisation)}
            />
          ))}
        </View>
      </View>

      <MxButton
        variant="primary"
        icon={submitting ? undefined : 'add'}
        block
        disabled={submitting}
        onPress={submit}
        node="deck-content-choice/create"
      >
        {ctaLabel}
      </MxButton>

      <View style={{ alignItems: 'center' }}>
        <MxLink size="sm" icon="upload_file" trailingIcon={null} onPress={onImport} node="deck-content-choice/import">
          Import from a file
        </MxLink>
      </View>
    </AppScreen>
  );
}

function OrganiseOption({
  theme: t,
  option,
  selected,
  onPress,
}: {
  theme: Theme;
  option: (typeof OPTIONS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <MxCard
      node={option.node}
      padding="sm"
      interactive
      onPress={onPress}
      accessibilityLabel={`${option.title}. ${option.text}`}
      accessibilityState={{ selected }}
      style={
        selected
          ? { borderWidth: t.stroke.emphasis, borderColor: t.color.primary, backgroundColor: t.color.stateSelected }
          : { borderWidth: t.stroke.hairline, borderColor: t.color.divider }
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
        <MxIconTile icon={option.icon} tone="accent" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>{option.title}</Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>{option.text}</Text>
        </View>
        <Icon
          name={selected ? 'check_circle' : 'radio_button_unchecked'}
          color={selected ? t.color.primary : t.color.textTertiary}
        />
      </View>
    </MxCard>
  );
}
