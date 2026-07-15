/**
 * Settings controller (WBS 10.1) — loads the typed study settings, persists
 * every change (each toggle / picker commit saves the whole config), and owns
 * the words-per-round picker overlay state. Pure hook; the container wires the
 * app_setting repository.
 */

import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_STUDY_SETTINGS, type StudySettings } from '../data/study-settings';

export interface SettingsDeps {
  load: () => Promise<StudySettings>;
  save: (settings: StudySettings) => Promise<void>;
}

export interface SettingsController {
  settings: StudySettings;
  pickerOpen: boolean;
  toggle: (key: keyof StudySettings, value: boolean) => void;
  openPicker: () => void;
  closePicker: () => void;
  pickWords: (words: number) => void;
}

export function useSettings(deps: SettingsDeps | null): SettingsController {
  const [settings, setSettings] = useState<StudySettings>(DEFAULT_STUDY_SETTINGS);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (deps === null) return;
    let alive = true;
    void deps.load().then((loaded) => {
      if (alive) setSettings(loaded);
    });
    return () => {
      alive = false;
    };
  }, [deps]);

  const apply = useCallback(
    (next: StudySettings) => {
      setSettings(next);
      void deps?.save(next);
    },
    [deps],
  );

  const toggle = useCallback(
    (key: keyof StudySettings, value: boolean) => {
      apply({ ...settings, [key]: value });
    },
    [apply, settings],
  );

  const pickWords = useCallback(
    (words: number) => {
      apply({ ...settings, wordsPerRound: words });
      setPickerOpen(false);
    },
    [apply, settings],
  );

  return {
    settings,
    pickerOpen,
    toggle,
    openPicker: () => setPickerOpen(true),
    closePicker: () => setPickerOpen(false),
    pickWords,
  };
}
