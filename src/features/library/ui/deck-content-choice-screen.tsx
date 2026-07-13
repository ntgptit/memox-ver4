/**
 * Deck-content-choice screen (WBS 3.6). The name-and-organise step for a brand-new,
 * empty deck: name it inline, then pick exactly one direction — subdecks or cards.
 * A read/navigation surface with no competing primary CTA; the two choice cards are
 * the actions, and Import is a tertiary link.
 *
 * Presentational and prop-driven: `onChoose` persists (name + organisation) and
 * resolves to a {@link Result} so a blank name / save failure renders inline. The
 * container wires it to `setDeckContentUseCase` (3.1) + the deck repository (3.2).
 */

import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  AppScreen,
  MxCard,
  MxIconButton,
  MxIconTile,
  MxTextField,
  MxLink,
  Icon,
  useTheme,
  type Theme,
} from '@/design-system';
import type { DeckOrganisation } from '@/features/library/domain';
import { type Result, type AppError, isErr } from '@/shared';

export interface DeckContentChoiceScreenProps {
  /** Current deck name (from the loaded deck); the field is seeded with it. */
  deckName?: string;
  onBack?: () => void;
  /** Persist name + organisation. Resolves to a Result so the screen can show errors. */
  onChoose: (input: { title: string; organisation: DeckOrganisation }) => Promise<Result<unknown, AppError>>;
  /** Tertiary: import cards from a file instead of organising by hand. */
  onImport?: () => void;
}

const CHOICES: { organisation: DeckOrganisation; icon: string; title: string; text: string; node: string }[] = [
  {
    organisation: 'subdecks',
    icon: 'account_tree',
    title: 'Organise with subdecks',
    text: 'Create nested topics before adding cards.',
    node: 'deck-content-choice/subdecks',
  },
  {
    organisation: 'cards',
    icon: 'playing_cards',
    title: 'Add cards directly',
    text: 'Use this as a final study deck.',
    node: 'deck-content-choice/cards',
  },
];

function nameError(error: AppError | null): string | undefined {
  if (!error || error.kind !== 'validation') return undefined;
  return error.issues.find((i) => i.field === 'title')?.message;
}

export function DeckContentChoiceScreen({ deckName = '', onBack, onChoose, onImport }: DeckContentChoiceScreenProps) {
  const t = useTheme();
  const [name, setName] = useState(deckName);
  const [error, setError] = useState<AppError | null>(null);
  const [pending, setPending] = useState<DeckOrganisation | null>(null);

  const choose = async (organisation: DeckOrganisation) => {
    if (pending) return;
    setPending(organisation);
    setError(null);
    const result = await onChoose({ title: name, organisation });
    if (isErr(result)) {
      setPending(null);
      setError(result.error);
      return;
    }
    // Success routes away (parent navigates); leave `pending` set so the card stays busy.
  };

  const bannerMessage = error && error.kind !== 'validation' ? error.message : null;

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
        onChangeText={setName}
        error={nameError(error)}
      />

      <Text
        accessibilityRole="header"
        style={[t.font.text({ size: 'xl', weight: 'extrabold' }), { color: t.color.text }]}
      >
        How do you want to organise it?
      </Text>

      <View style={{ gap: t.space[3] }}>
        {CHOICES.map((c) => (
          <ChoiceCard key={c.organisation} theme={t} choice={c} busy={pending === c.organisation} onPress={() => choose(c.organisation)} />
        ))}
      </View>

      <View style={{ alignItems: 'center' }}>
        <MxLink size="sm" icon="upload_file" trailingIcon={null} onPress={onImport} node="deck-content-choice/import">
          Import from a file
        </MxLink>
      </View>
    </AppScreen>
  );
}

function ChoiceCard({
  theme: t,
  choice,
  busy,
  onPress,
}: {
  theme: Theme;
  choice: (typeof CHOICES)[number];
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <MxCard
      node={choice.node}
      padding="md"
      interactive
      onPress={onPress}
      accessibilityLabel={`${choice.title}. ${choice.text}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
        <MxIconTile icon={choice.icon} tone="accent" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>{choice.title}</Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>{choice.text}</Text>
        </View>
        {busy ? (
          <ActivityIndicator color={t.color.primary} />
        ) : (
          <Icon name="chevron_right" color={t.color.textTertiary} />
        )}
      </View>
    </MxCard>
  );
}
