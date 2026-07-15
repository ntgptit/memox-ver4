import { useLocalSearchParams, useRouter } from 'expo-router';

import { StudySettingsContainer, type StudyScreenKey } from '@/features/settings/ui';

const SCREEN_KEYS: readonly StudyScreenKey[] = ['worddisplay', 'srs', 'mode', 'voice'];

/**
 * Study-settings child screens (WBS 10.1 / 12.2) — Word display / Spaced
 * repetition / Mode settings / Voice at their own pathnames so hub rows can
 * push them (audit defect 2). The param is `[section]`, NOT `[screen]` —
 * `screen` is a RESERVED React Navigation param name (nested-navigator
 * targeting) and is consumed before it reaches the route. An unknown (or
 * not-yet-parsed) key renders the hub — no Redirect: params are briefly
 * undefined on first render and a Redirect here bounces the navigation away.
 */
export default function StudySettingsChildRoute() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();

  const child = SCREEN_KEYS.find((k) => k === section);
  return <StudySettingsContainer screen={child} onBack={() => router.back()} />;
}
