/**
 * Import screen (WBS 9.1) — import cards from a file or pasted text. Composition
 * mirrors the kit `_features/import/Import.jsx`: nested bar (back · Import cards)
 * over 7 states — source (CHOOSE SOURCE cards + dashed paste box), mapping
 * (separator chips + column mapping + table + Continue), preview / dup-warning
 * (optional callout + PREVIEW table + Import CTA), importing (progress card),
 * import-error and done (EmptyStates).
 */

import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import {
  ActionCallout,
  AppScreen,
  EmptyState,
  ListRow,
  MxButton,
  MxCard,
  MxChip,
  MxIconButton,
  MxList,
  ProgressBar,
  SectionLabel,
  useTheme,
} from '@/design-system';

import { IMPORT_PASTE_PLACEHOLDER, IMPORT_SEPS, IMPORT_SOURCES, type ImportData, type ImportUiState } from './import-fixtures';
import { SourceCard, Table } from './import-components';

export interface ImportScreenProps {
  ui: ImportUiState;
  data: ImportData;
  onBack?: () => void;
  /** Source state: pick one of the three sources (index into IMPORT_SOURCES). */
  onPickSource?: (index: number) => void;
  onChangePasted?: (text: string) => void;
  onPickSeparator?: (index: number) => void;
  /** Swap the A→Term / B→Meaning column mapping. */
  onSwapMapping?: () => void;
  /** Mapping → preview/dup-warning. */
  onContinue?: () => void;
  /** Preview/dup-warning → run the import. */
  onImport?: () => void;
  onRetry?: () => void;
  onGoDeck?: () => void;
}

export function ImportScreen({
  ui,
  data,
  onBack,
  onPickSource,
  onChangePasted,
  onPickSeparator,
  onSwapMapping,
  onContinue,
  onImport,
  onRetry,
  onGoDeck,
}: ImportScreenProps) {
  const t = useTheme();
  const [pasteFocused, setPasteFocused] = useState(false);

  return (
    <AppScreen
      node="import/screen"
      variant="nested"
      title="Import cards"
      leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="import/back" />}
    >
      {ui === 'importing' && (
        <MxCard node="import/importing">
          <View style={{ gap: t.space[3] }}>
            <Text style={[t.font.text({ size: 'md', weight: 'bold' }), { color: t.color.text }]}>Importing…</Text>
            <ProgressBar value={data.progressPct} accessibilityLabel="Import progress" node="import/importing-bar" />
            <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
              {data.progressDone} / {data.total} cards · don’t close this screen
            </Text>
          </View>
        </MxCard>
      )}

      {ui === 'import-error' && (
        <EmptyState
          node="import/error"
          icon="error"
          tone="error"
          title="Import failed"
          text={data.errorText}
          action={
            <MxButton variant="primary" icon="refresh" onPress={onRetry} node="import/retry">
              Try again
            </MxButton>
          }
        />
      )}

      {ui === 'done' && (
        <EmptyState
          node="import/done"
          icon="task_alt"
          tone="success"
          title={`Imported ${data.total} cards`}
          text={`The new cards were added to “${data.deckName}”.`}
          action={
            <MxButton variant="primary" icon="arrow_forward" onPress={onGoDeck} node="import/go-deck">
              Back to deck
            </MxButton>
          }
        />
      )}

      {ui === 'source' && (
        <>
          <SectionLabel>CHOOSE SOURCE</SectionLabel>
          <MxList node="import/sources">
            {IMPORT_SOURCES.map((s, i) => (
              <SourceCard key={s.name} source={s} index={i} onPress={() => onPickSource?.(i)} />
            ))}
          </MxList>
          <TextInput
            testID="import/paste"
            accessibilityLabel="Paste your data"
            multiline
            value={data.pasted}
            onChangeText={onChangePasted}
            onFocus={() => setPasteFocused(true)}
            onBlur={() => setPasteFocused(false)}
            placeholder={IMPORT_PASTE_PLACEHOLDER}
            placeholderTextColor={t.color.textTertiary}
            style={[
              t.font.text({ size: 'base' }),
              {
                borderWidth: t.stroke.hairline,
                borderStyle: 'dashed',
                borderColor: pasteFocused ? t.color.focusRing : t.color.divider,
                borderRadius: t.radius.control,
                minHeight: t.size.xl,
                padding: t.space[4],
                color: t.color.text,
                textAlignVertical: 'top',
                outlineStyle: 'none',
              },
            ]}
          />
        </>
      )}

      {ui === 'mapping' && (
        <>
          <SectionLabel>SEPARATOR</SectionLabel>
          <View style={{ flexDirection: 'row', gap: t.space[2] }}>
            {IMPORT_SEPS.map((s, i) => (
              <MxChip key={s} label={s} selected={i === data.sepIndex} onPress={() => onPickSeparator?.(i)} node={`import/sep-${i}`} />
            ))}
          </View>
          <SectionLabel>COLUMN MAPPING</SectionLabel>
          <MxCard padding="sm">
            <ListRow
              icon="text_fields"
              title="Column A → Term"
              sub="안녕하세요, 감사합니다…"
              node="import/map-term"
              trailing={
                <MxIconButton icon="expand_more" size="sm" accessibilityLabel="Pick term column" onPress={onSwapMapping} node="import/map-term-pick" />
              }
            />
            <ListRow
              icon="translate"
              title="Column B → Meaning"
              sub="Hello, Thank you…"
              last
              node="import/map-meaning"
              trailing={
                <MxIconButton icon="expand_more" size="sm" accessibilityLabel="Pick meaning column" onPress={onSwapMapping} node="import/map-meaning-pick" />
              }
            />
          </MxCard>
          <Table rows={data.tableRows} node="import/table" />
          <MxButton variant="primary" block onPress={onContinue} node="import/to-preview">
            Continue
          </MxButton>
        </>
      )}

      {(ui === 'preview' || ui === 'dup-warning') && (
        <>
          {ui === 'dup-warning' && (
            <ActionCallout
              node="import/dup-warning"
              icon="warning"
              text={`${data.dups} cards already exist — import anyway?`}
            />
          )}
          <SectionLabel>PREVIEW · {data.total} CARDS</SectionLabel>
          <Table rows={data.tableRows} node="import/table" />
          <MxButton variant="primary" icon="download" block onPress={onImport} node="import/do-import">
            Import {data.total} cards
          </MxButton>
        </>
      )}
    </AppScreen>
  );
}
