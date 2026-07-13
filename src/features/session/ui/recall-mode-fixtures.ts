/**
 * Recall-mode (WBS 7.1) — preview fixtures for the five canonical states. Shared by
 * the screen tests and the visual golden.
 */

import type { RecallPhase } from './recall-mode-screen';

export interface RecallFixture {
  phase: RecallPhase;
  term: string;
  meaning: string;
  done: number;
  total: number;
}

export const RECALL_FIXTURES: Record<RecallPhase, RecallFixture> = {
  'before-reveal': { phase: 'before-reveal', term: '친구', meaning: 'friend', done: 12, total: 20 },
  revealed: { phase: 'revealed', term: '친구', meaning: 'friend', done: 12, total: 20 },
  forgot: { phase: 'forgot', term: '친구', meaning: 'friend', done: 12, total: 20 },
  remembered: { phase: 'remembered', term: '친구', meaning: 'friend', done: 12, total: 20 },
  complete: { phase: 'complete', term: '', meaning: '', done: 20, total: 20 },
};

export type RecallFixtureKey = keyof typeof RECALL_FIXTURES;
