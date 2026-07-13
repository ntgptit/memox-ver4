/**
 * Mode-picker screen (WBS 5.4). Choose a study mode and a card source (scope), then
 * start a session — tapping a mode starts it. A not-enough-words guard disables the
 * modes and explains the threshold; the scope card opens a bottom sheet of sources.
 *
 * Presentational and prop-driven: `scope`/`scopeCount` come in, `onScopeChange`/
 * `onStart`/`onAddWords` go out. The container wires counts from the card + SRS repos.
 */

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AppScreen,
  MxCard,
  MxIconButton,
  MxIconTile,
  MxButton,
  MxList,
  Icon,
  useTheme,
  type Theme,
} from '@/design-system';
import type { SessionStage } from '@/features/session/domain';

import {
  MODE_CHOICES,
  SCOPE_CHOICES,
  MIN_WORDS,
  WORDS_PER_ROUND,
  scopeLabel,
  type StudyScope,
  type ModeChoice,
} from './mode-picker-model';

export interface ModePickerScreenProps {
  scope: StudyScope;
  /** Words available for the active scope; null while counting. */
  scopeCount: number | null;
  onScopeChange: (scope: StudyScope) => void;
  onStart: (mode: SessionStage) => void;
  onAddWords?: () => void;
  onBack?: () => void;
  /** Preview/testing: open the scope sheet initially. */
  initialSheetOpen?: boolean;
  minWords?: number;
}

export function ModePickerScreen({
  scope,
  scopeCount,
  onScopeChange,
  onStart,
  onAddWords,
  onBack,
  initialSheetOpen = false,
  minWords = MIN_WORDS,
}: ModePickerScreenProps) {
  const t = useTheme();
  const [sheetOpen, setSheetOpen] = useState(initialSheetOpen);

  const notEnough = scopeCount !== null && scopeCount < minWords;
  const countLabel = scopeCount === null ? 'Counting…' : `${scopeCount} ${scopeCount === 1 ? 'word' : 'words'}`;

  return (
    <AppScreen
      node="mode-picker/screen"
      variant="nested"
      title="Single mode"
      leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="mode-picker/back" />}
    >
      {notEnough && (
        <View
          testID="mode-picker/not-enough"
          accessibilityRole="alert"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.space[3],
            backgroundColor: t.color.surface,
            borderWidth: t.stroke.hairline,
            borderColor: t.color.border,
            borderRadius: t.radius.md,
            padding: t.space[3],
          }}
        >
          <Icon name="info" size="sm" color={t.color.textSecondary} />
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.text, flex: 1 }]}>
            This deck needs at least {minWords} words to play.
          </Text>
          <MxButton variant="primary" size="sm" onPress={onAddWords} node="mode-picker/add-cards">
            Add words
          </MxButton>
        </View>
      )}

      <MxCard
        node="mode-picker/scope"
        padding="sm"
        interactive
        onPress={() => setSheetOpen(true)}
        accessibilityLabel={`Card source: ${scopeLabel(scope)}, ${countLabel}. Change`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
          <MxIconTile icon="tune" tone="success" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>Card source</Text>
            <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>
              {scopeLabel(scope)} · {countLabel}
            </Text>
          </View>
          <Icon name="expand_more" color={t.color.textTertiary} />
        </View>
      </MxCard>

      <MxList node="mode-picker/modes">
        {MODE_CHOICES.map((m) => (
          <ModeOption key={m.id} theme={t} mode={m} disabled={notEnough} onPress={() => onStart(m.id)} />
        ))}
      </MxList>

      <Text
        style={[t.font.text({ size: 'sm' }), { color: t.color.textTertiary, textAlign: 'center', paddingVertical: t.space[1] }]}
      >
        {WORDS_PER_ROUND} words per round · change in Settings
      </Text>

      {sheetOpen && (
        <ScopeSheet
          theme={t}
          scope={scope}
          onSelect={(s) => {
            onScopeChange(s);
            setSheetOpen(false);
          }}
          onDismiss={() => setSheetOpen(false)}
        />
      )}
    </AppScreen>
  );
}

function ModeOption({
  theme: t,
  mode,
  disabled,
  onPress,
}: {
  theme: Theme;
  mode: ModeChoice;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <MxCard
      node={`mode-picker/mode-${mode.id}`}
      padding="sm"
      interactive
      onPress={() => {
        if (!disabled) onPress();
      }}
      accessibilityLabel={`${mode.name}. ${mode.desc}${disabled ? ', unavailable — not enough words' : ''}`}
      style={disabled ? { opacity: t.opacity.half } : undefined}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
        <MxIconTile icon={mode.icon} tone="accent" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[t.font.text({ size: 'base', weight: 'bold' }), { color: t.color.text }]}>{mode.name}</Text>
          <Text style={[t.font.text({ size: 'sm' }), { color: t.color.textSecondary }]}>{mode.desc}</Text>
        </View>
        <Icon name="chevron_right" color={t.color.textTertiary} />
      </View>
    </MxCard>
  );
}

function ScopeSheet({
  theme: t,
  scope,
  onSelect,
  onDismiss,
}: {
  theme: Theme;
  scope: StudyScope;
  onSelect: (scope: StudyScope) => void;
  onDismiss: () => void;
}) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Pressable
        testID="mode-picker/scope-scrim"
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onDismiss}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.color.scrim }}
      />
      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <View
          onStartShouldSetResponder={() => true}
          accessibilityViewIsModal
          style={{
            backgroundColor: t.color.surfaceRaised,
            borderTopLeftRadius: t.radius.lg,
            borderTopRightRadius: t.radius.lg,
            paddingTop: t.space[4],
            paddingBottom: t.space[6],
            paddingHorizontal: t.space[4],
            gap: t.space[2],
          }}
        >
          <Text accessibilityRole="header" style={[t.font.text({ size: 'md', weight: 'bold' }), { color: t.color.text }]}>
            Card source
          </Text>
          {SCOPE_CHOICES.map((s) => {
            const selected = s.id === scope;
            return (
              <Pressable
                key={s.id}
                testID={`mode-picker/scope-${s.id}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, selected }}
                accessibilityLabel={s.label}
                onPress={() => onSelect(s.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.space[3],
                  minHeight: t.layout.touchMin,
                  paddingHorizontal: t.space[2],
                  borderRadius: t.radius.md,
                  backgroundColor: selected ? t.color.primarySoft : 'transparent',
                }}
              >
                <Icon name={s.icon} size="sm" color={selected ? t.color.onPrimarySoft : t.color.textSecondary} />
                <Text
                  style={[
                    t.font.text({ size: 'base', weight: selected ? 'semibold' : 'regular' }),
                    { color: selected ? t.color.onPrimarySoft : t.color.text, flex: 1 },
                  ]}
                >
                  {s.label}
                </Text>
                {selected && <Icon name="check_circle" size="sm" color={t.color.onPrimarySoft} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
