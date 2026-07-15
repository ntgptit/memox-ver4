/**
 * Settings controller (WBS 10.1) — loads persisted settings, every toggle and
 * picker commit saves the WHOLE config, and the picker overlay opens/closes.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { DEFAULT_STUDY_SETTINGS, type StudySettings } from '../../data/study-settings';
import { useSettings, type SettingsDeps } from '../use-settings';

function makeDeps(initial: StudySettings = DEFAULT_STUDY_SETTINGS) {
  const saved: StudySettings[] = [];
  const deps: SettingsDeps = {
    load: async () => initial,
    save: async (s) => {
      saved.push(s);
    },
  };
  return { deps, saved };
}

describe('useSettings', () => {
  it('loads the persisted settings', async () => {
    const { deps } = makeDeps({ ...DEFAULT_STUDY_SETTINGS, wordsPerRound: 20 });
    const { result } = renderHook(() => useSettings(deps));
    await waitFor(() => expect(result.current.settings.wordsPerRound).toBe(20));
  });

  it('toggle updates the field and persists the whole config', async () => {
    const { deps, saved } = makeDeps();
    const { result } = renderHook(() => useSettings(deps));
    await waitFor(() => expect(result.current.settings).toEqual(DEFAULT_STUDY_SETTINGS));
    act(() => result.current.toggle('shuffle', false));
    expect(result.current.settings.shuffle).toBe(false);
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]).toEqual({ ...DEFAULT_STUDY_SETTINGS, shuffle: false });
  });

  it('pickWords persists and closes the picker', async () => {
    const { deps, saved } = makeDeps();
    const { result } = renderHook(() => useSettings(deps));
    await waitFor(() => expect(result.current.settings).toEqual(DEFAULT_STUDY_SETTINGS));
    act(() => result.current.openPicker());
    expect(result.current.pickerOpen).toBe(true);
    act(() => result.current.pickWords(10));
    expect(result.current.pickerOpen).toBe(false);
    expect(result.current.settings.wordsPerRound).toBe(10);
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0].wordsPerRound).toBe(10);
  });

  it('null deps render the defaults without persisting', () => {
    const { result } = renderHook(() => useSettings(null));
    expect(result.current.settings).toEqual(DEFAULT_STUDY_SETTINGS);
    act(() => result.current.toggle('tts', false));
    expect(result.current.settings.tts).toBe(false);
  });
});
