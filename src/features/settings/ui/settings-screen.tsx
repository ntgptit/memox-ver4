/**
 * Settings screens (WBS 10.1) — hierarchical IA per the kit
 * `_features/settings/Settings.jsx`: a flat root (profile card · STUDY entry ·
 * APP rows, tab destination) + a Study-settings hub whose rows each open a
 * child screen (word-display / SRS / mode / voice), plus the words-per-round
 * ValuePickerSheet. 7 states.
 */

import { Text, View } from 'react-native';

import {
  AppScreen,
  Icon,
  ListRow,
  MxCard,
  MxIconButton,
  MxSwitch,
  ProfileCard,
  Scrim,
  SectionLabel,
  SelectSheet,
  useTheme,
} from '@/design-system';

import {
  SETTINGS_ROOT,
  STUDY_HUB_ROWS,
  WORDS_PER_ROUND_OPTIONS,
  type SettingsUiState,
  type StudyScreenKey,
  type StudySettings,
} from './settings-fixtures';

export interface SettingsScreenProps {
  ui: SettingsUiState;
  settings: StudySettings;
  onBack?: () => void;
  /** Root: open a destination (study hub / theme / reminders / backup / export). */
  onOpen?: (key: string) => void;
  /** Hub: open a child study screen (or the languages feature). */
  onOpenStudy?: (key: StudyScreenKey | 'languages') => void;
  /** Child switches: persist one boolean field. */
  onToggle?: (key: keyof StudySettings, value: boolean) => void;
  /** Mode: open / close / commit the words-per-round picker. */
  onOpenPicker?: () => void;
  onClosePicker?: () => void;
  onPickWords?: (words: number) => void;
}

/** Kit `Val`: optional sm semibold value + a lg tertiary chevron. */
function Val({ v }: { v?: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[1] }}>
      {v !== undefined && v !== '' && (
        <Text style={[t.font.text({ size: 'sm', weight: 'semibold' }), { color: t.color.textTertiary }]}>{v}</Text>
      )}
      <Icon name="chevron_right" size={t.font.size.lg} color={t.color.textTertiary} />
    </View>
  );
}

/** Kit `Child`: nested back-titled bar + a single grouped card of rows. */
function Child({ title, onBack, children }: { title: string; onBack?: () => void; children: React.ReactNode }) {
  return (
    <AppScreen
      node="settings/screen"
      variant="nested"
      title={title}
      leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="settings/child-back" />}
    >
      <MxCard padding="sm">{children}</MxCard>
    </AppScreen>
  );
}

export function SettingsScreen({
  ui,
  settings,
  onBack,
  onOpen,
  onOpenStudy,
  onToggle,
  onOpenPicker,
  onClosePicker,
  onPickWords,
}: SettingsScreenProps) {
  if (ui === 'study-hub') {
    return (
      <AppScreen
        node="settings/screen"
        variant="nested"
        title="Study settings"
        leading={<MxIconButton icon="arrow_back" accessibilityLabel="Back" onPress={onBack} node="settings/study-back" />}
      >
        <MxCard padding="sm">
          {STUDY_HUB_ROWS.map((r, i) => (
            <ListRow
              key={r.key}
              icon={r.icon}
              title={r.title}
              sub={r.sub}
              last={i === STUDY_HUB_ROWS.length - 1}
              node={`settings/study-${r.key === 'languages' ? 'language' : r.key}`}
              onPress={() => onOpenStudy?.(r.key as StudyScreenKey | 'languages')}
              trailing={<Val />}
            />
          ))}
        </MxCard>
      </AppScreen>
    );
  }

  if (ui === 'study-worddisplay') {
    return (
      <Child title="Word display" onBack={onBack}>
        <ListRow icon="translate" title="Meaning language" sub="Native · English" node="settings/wd-meaning" trailing={<Val />} />
        <ListRow
          icon="palette"
          title="Color by gender"
          sub="Tint terms by grammatical gender"
          node="settings/wd-gender"
          trailing={
            <MxSwitch
              checked={settings.colorByGender}
              onChange={(v) => onToggle?.('colorByGender', v)}
              ariaLabel="Color by gender"
              node="settings/wd-gender-switch"
            />
          }
        />
        <ListRow
          icon="spellcheck"
          title="Show romanization"
          sub="Reading under each term"
          last
          node="settings/wd-romaja"
          trailing={
            <MxSwitch
              checked={settings.showRomanization}
              onChange={(v) => onToggle?.('showRomanization', v)}
              ariaLabel="Show romanization"
              node="settings/wd-romaja-switch"
            />
          }
        />
      </Child>
    );
  }

  if (ui === 'study-srs') {
    return (
      <Child title="Spaced repetition" onBack={onBack}>
        <ListRow
          icon="grid_view"
          title="Leitner boxes"
          sub="Number of review boxes"
          node="settings/srs-boxes"
          trailing={<Val v={String(settings.leitnerBoxes)} />}
        />
        <ListRow icon="timeline" title="Intervals (days)" sub="1 · 3 · 7 · 14 · 30 · 60 · 120" node="settings/srs-intervals" trailing={<Val />} />
        <ListRow
          icon="notifications_active"
          title="Due notifications"
          last
          node="settings/srs-notif"
          trailing={
            <MxSwitch
              checked={settings.dueNotifications}
              onChange={(v) => onToggle?.('dueNotifications', v)}
              ariaLabel="Due notifications"
              node="settings/srs-notif-switch"
            />
          }
        />
      </Child>
    );
  }

  if (ui === 'study-mode') {
    return (
      <Child title="Mode settings" onBack={onBack}>
        <ListRow
          icon="filter_5"
          title="Words per round"
          sub="Cards shown each round"
          node="settings/mode-count"
          onPress={onOpenPicker}
          trailing={<Val v={String(settings.wordsPerRound)} />}
        />
        <ListRow
          icon="shuffle"
          title="Shuffle cards"
          sub="Randomize order each round"
          node="settings/mode-shuffle"
          trailing={
            <MxSwitch
              checked={settings.shuffle}
              onChange={(v) => onToggle?.('shuffle', v)}
              ariaLabel="Shuffle cards"
              node="settings/mode-shuffle-switch"
            />
          }
        />
        <ListRow
          icon="volume_up"
          title="Autoplay audio"
          sub="Play term audio on reveal"
          last
          node="settings/mode-autoplay"
          trailing={
            <MxSwitch
              checked={settings.autoplayAudio}
              onChange={(v) => onToggle?.('autoplayAudio', v)}
              ariaLabel="Autoplay audio"
              node="settings/mode-autoplay-switch"
            />
          }
        />
      </Child>
    );
  }

  if (ui === 'study-voice') {
    return (
      <Child title="Voice" onBack={onBack}>
        <ListRow
          icon="record_voice_over"
          title="Text-to-speech"
          sub="Speak terms aloud"
          node="settings/voice-tts"
          trailing={
            <MxSwitch
              checked={settings.tts}
              onChange={(v) => onToggle?.('tts', v)}
              ariaLabel="Text-to-speech"
              node="settings/voice-tts-switch"
            />
          }
        />
        <ListRow icon="speed" title="Speech rate" sub="Normal" node="settings/voice-rate" trailing={<Val />} />
        <ListRow
          icon="mic"
          title="Speech-to-text"
          sub="Answer by speaking"
          last
          node="settings/voice-stt"
          trailing={
            <MxSwitch
              checked={settings.stt}
              onChange={(v) => onToggle?.('stt', v)}
              ariaLabel="Speech-to-text"
              node="settings/voice-stt-switch"
            />
          }
        />
      </Child>
    );
  }

  // Root (tab destination) — also the backdrop for the value-picker overlay.
  return (
    <>
      <AppScreen node="settings/screen" variant="root" title="Settings" inTabs>
        <ProfileCard node="settings/profile" name={SETTINGS_ROOT.profile.name} email={SETTINGS_ROOT.profile.email} />
        <SectionLabel>STUDY</SectionLabel>
        <MxCard padding="sm">
          <ListRow
            icon={SETTINGS_ROOT.study.icon}
            title={SETTINGS_ROOT.study.title}
            sub={SETTINGS_ROOT.study.sub}
            last
            node="settings/study"
            onPress={() => onOpen?.('study')}
            trailing={<Val />}
          />
        </MxCard>
        <SectionLabel>APP</SectionLabel>
        <MxCard padding="sm">
          {SETTINGS_ROOT.app.map((r, i) => (
            <ListRow
              key={r.key}
              icon={r.icon}
              title={r.title}
              sub={r.sub}
              last={i === SETTINGS_ROOT.app.length - 1}
              node={`settings/${r.key}`}
              onPress={() => onOpen?.(r.key)}
              trailing={<Val />}
            />
          ))}
        </MxCard>
      </AppScreen>

      {ui === 'value-picker' && (
        <ValuePickerSheet settings={settings} onClose={onClosePicker} onPick={onPickWords} />
      )}
    </>
  );
}

/** Kit ValuePickerSheet: the words-per-round picker bottom sheet. */
export function ValuePickerSheet({
  settings,
  onClose,
  onPick,
}: {
  settings: StudySettings;
  onClose?: () => void;
  onPick?: (words: number) => void;
}) {
  return (
    <Scrim onDismiss={onClose} node="settings/picker-scrim">
      <SelectSheet
        title="Words per round"
        node="settings/picker-sheet"
        options={WORDS_PER_ROUND_OPTIONS.map((v) => ({
          key: v,
          icon: Number(v) === settings.wordsPerRound ? 'check' : 'circle',
          label: `${v} words`,
          selected: Number(v) === settings.wordsPerRound,
          onPress: () => onPick?.(Number(v)),
          node: `settings/words-${v}`,
        }))}
      />
    </Scrim>
  );
}
