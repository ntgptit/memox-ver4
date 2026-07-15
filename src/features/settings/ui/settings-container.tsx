/**
 * Settings containers (WBS 10.1) — resolve the app_setting repository and
 * persist the study settings. `SettingsRootContainer` renders the flat root
 * (tab destination); `StudySettingsContainer` renders the hub or one child
 * study screen (word-display / SRS / mode / voice) with the words-per-round
 * picker overlaid on the mode screen.
 */

import { useEffect, useState } from 'react';

import { createSettingsRepository, loadStudySettings, saveStudySettings } from '@/features/settings/data';

import { SettingsScreen, ValuePickerSheet } from './settings-screen';
import { useSettings, type SettingsDeps } from './use-settings';
import type { StudyScreenKey } from './settings-fixtures';

function useSettingsDeps(): SettingsDeps | null {
  const [deps, setDeps] = useState<SettingsDeps | null>(null);
  useEffect(() => {
    let alive = true;
    void createSettingsRepository().then((repo) => {
      if (!alive) return;
      setDeps({
        load: () => loadStudySettings(repo),
        save: (settings) => saveStudySettings(repo, settings),
      });
    });
    return () => {
      alive = false;
    };
  }, []);
  return deps;
}

export function SettingsRootContainer({ onOpen }: { onOpen?: (key: string) => void }) {
  const ctrl = useSettings(useSettingsDeps());
  return <SettingsScreen ui="loaded" settings={ctrl.settings} onOpen={onOpen} />;
}

export function StudySettingsContainer({
  screen,
  onBack,
  onOpenStudy,
}: {
  /** undefined = the hub; a key = that child screen. */
  screen?: StudyScreenKey;
  onBack?: () => void;
  onOpenStudy?: (key: StudyScreenKey | 'languages') => void;
}) {
  const ctrl = useSettings(useSettingsDeps());

  const ui =
    screen === undefined
      ? 'study-hub'
      : (`study-${screen}` as 'study-worddisplay' | 'study-srs' | 'study-mode' | 'study-voice');

  return (
    <>
      <SettingsScreen
        ui={ui}
        settings={ctrl.settings}
        onBack={onBack}
        onOpenStudy={onOpenStudy}
        onToggle={ctrl.toggle}
        onOpenPicker={ctrl.openPicker}
      />
      {ctrl.pickerOpen && (
        <ValuePickerSheet settings={ctrl.settings} onClose={ctrl.closePicker} onPick={ctrl.pickWords} />
      )}
    </>
  );
}
