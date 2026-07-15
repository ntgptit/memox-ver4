/**
 * Export screen (WBS 9.2) — write a deck to a shareable file. Composition
 * mirrors the kit `_features/export/Export.jsx`: nested bar (back · Export
 * cards) over 4 states — config (SCOPE segmented · FORMAT radio list ·
 * SEPARATOR chips · include-review-state switch · Export CTA), exporting
 * (progress card), export-error and done (EmptyStates; done offers Share
 * file / Save to device).
 */

import { View } from 'react-native';

import {
  AppScreen,
  EmptyState,
  ListRow,
  MxButton,
  MxCard,
  MxChip,
  MxIconButton,
  MxSegmentedControl,
  MxSwitch,
  SectionLabel,
  useTheme,
} from '@/design-system';
import type { ExportScope } from '../domain';

import { EXPORT_SEPS, type ExportData, type ExportUiState } from './export-fixtures';
import { ExportingCard, FormatList } from './export-components';

export interface ExportScreenProps {
  ui: ExportUiState;
  data: ExportData;
  onBack?: () => void;
  onPickScope?: (scope: ExportScope) => void;
  onPickFormat?: (index: number) => void;
  onPickSeparator?: (index: number) => void;
  onToggleSrs?: (include: boolean) => void;
  onExport?: () => void;
  onRetry?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

export function ExportScreen({
  ui,
  data,
  onBack,
  onPickScope,
  onPickFormat,
  onPickSeparator,
  onToggleSrs,
  onExport,
  onRetry,
  onShare,
  onSave,
}: ExportScreenProps) {
  const t = useTheme();

  return (
    <AppScreen
      node="export/screen"
      variant="nested"
      title="Export cards"
      leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="export/back" />}
    >
      {ui === 'exporting' && <ExportingCard progressPct={data.progressPct} />}

      {ui === 'export-error' && (
        <EmptyState
          node="export/error"
          icon="error"
          tone="error"
          title="Export failed"
          wide
          blockAction
          text="Something went wrong creating the file. Check available storage and try again."
          action={
            <MxButton variant="primary" icon="refresh" block onPress={onRetry} node="export/retry">
              Try again
            </MxButton>
          }
        />
      )}

      {ui === 'done' && (
        <EmptyState
          node="export/done"
          icon="ios_share"
          tone="success"
          title={`Exported ${data.total} cards`}
          text="Your file is ready to share or save."
          action={
            <View style={{ gap: t.space[3], width: t.size['3xl'] }}>
              <MxButton variant="primary" icon="share" block onPress={onShare} node="export/share">
                Share file
              </MxButton>
              <MxButton variant="ghost" icon="save_alt" block onPress={onSave} node="export/save">
                Save to device
              </MxButton>
            </View>
          }
        />
      )}

      {ui === 'config' && (
        <>
          <SectionLabel>SCOPE</SectionLabel>
          <MxSegmentedControl
            value={data.scope}
            onChange={(v) => onPickScope?.(v as ExportScope)}
            block
            node="export/scope"
            segments={[
              { value: 'deck', label: 'This deck' },
              { value: 'subtree', label: 'Incl. sub-decks' },
            ]}
          />

          <SectionLabel>FORMAT</SectionLabel>
          <FormatList selectedIndex={data.formatIndex} onPick={onPickFormat} />

          <SectionLabel>SEPARATOR</SectionLabel>
          <View style={{ flexDirection: 'row', gap: t.space[2] }}>
            {EXPORT_SEPS.map((s, i) => (
              <MxChip
                key={s}
                label={s}
                selected={i === data.sepIndex}
                onPress={() => onPickSeparator?.(i)}
                node={`export/sep-${i}`}
              />
            ))}
          </View>

          <MxCard padding="sm">
            <ListRow
              icon="schedule"
              tone="success"
              title="Include review state"
              sub="Leitner box + due date"
              last
              node="export/incl-srs"
              trailing={
                <MxSwitch
                  checked={data.includeSrs}
                  onChange={onToggleSrs}
                  ariaLabel="Include review state"
                  node="export/incl-srs-switch"
                />
              }
            />
          </MxCard>

          <MxButton variant="primary" icon="download" block onPress={onExport} node="export/do-export">
            Export
          </MxButton>
        </>
      )}
    </AppScreen>
  );
}
