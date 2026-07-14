/**
 * Player slice (WBS 7.3) — view model + state-matrix fixtures. Mirrors the kit's
 * `_features/player/Player.jsx` VERBATIM (deck "TOPIK I — Vocabulary", card
 * 학교/school, 8-dot progress at index 3, speed ×0.75/×1/×1.5). 5 states.
 */

export type PlayerData =
  | { readonly status: 'error'; readonly message: string }
  | {
      readonly status: 'ready';
      readonly deckTitle: string;
      readonly term: string;
      readonly meaning: string;
      /** Card position for the dots row. */
      readonly index: number;
      readonly total: number;
    };

export type PlayerUiState = 'playing' | 'paused' | 'speed' | 'error' | 'end';

export const PLAYER_SPEEDS = ['0.75', '1', '1.5'] as const;
export type PlayerSpeed = (typeof PLAYER_SPEEDS)[number];

export interface PlayerFixture {
  readonly data: PlayerData;
  readonly ui: PlayerUiState;
}

const READY: PlayerData = {
  status: 'ready',
  deckTitle: 'TOPIK I — Vocabulary',
  term: '학교',
  meaning: 'school',
  index: 3,
  total: 8,
};

/** Fixtures keyed by canonical state name (contract §6 — 5 states). */
export const PLAYER_FIXTURES: Record<PlayerUiState, PlayerFixture> = {
  playing: { data: READY, ui: 'playing' },
  paused: { data: READY, ui: 'paused' },
  speed: { data: READY, ui: 'speed' },
  error: {
    data: { status: 'error', message: "Couldn't load the audio for this deck. Check your connection and try again." },
    ui: 'error',
  },
  end: { data: READY, ui: 'end' },
};

export type PlayerFixtureKey = keyof typeof PLAYER_FIXTURES;
