/**
 * Mode-picker (WBS 5.4) — preview fixtures for the three canonical states plus the
 * loading edge. Shared by the screen tests and the visual golden.
 */

import type { StudyScope } from './mode-picker-model';

export interface ModePickerFixture {
  scope: StudyScope;
  scopeCount: number | null;
  initialSheetOpen?: boolean;
}

export type ModePickerFixtureKey = 'default' | 'scopeDropdown' | 'notEnough' | 'loading';

export const MODE_PICKER_FIXTURES: Record<ModePickerFixtureKey, ModePickerFixture> = {
  default: { scope: 'srs', scopeCount: 24 },
  scopeDropdown: { scope: 'srs', scopeCount: 24, initialSheetOpen: true },
  notEnough: { scope: 'unlearned', scopeCount: 2 },
  loading: { scope: 'srs', scopeCount: null },
};
