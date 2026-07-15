#!/usr/bin/env node
// tool/app_golden/shoot.mjs — WBS 11.4 visual-regression harness for the RN app.
//
// Golden approach (DEP-GOLDEN): render the Expo *web* build (a faithful web render of
// the RN screens) in headless chromium at the mobile design frame, screenshot each
// canonical state, and pixel-diff it against a committed baseline. Feature slices add
// their own states to TARGETS as they land; this ships the shell baseline sample.
//
// Usage:
//   node tool/app_golden/shoot.mjs [distDir]            # verify vs baselines (gate)
//   node tool/app_golden/shoot.mjs [distDir] --update   # (re)write baselines
//
// Output:
//   tool/app_golden/out/<name>.png    — the fresh capture
//   tool/app_golden/diff/<name>.png   — the pixel diff (only when a mismatch is found)
//   tool/app_golden/baseline/<name>.png — the committed reference (naming:
//                                          <screen>--<state>--<theme>.png)
// Exit: 0 if every state matches its baseline (within threshold); 1 on any mismatch.

import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const HERE = dirname(fileURLToPath(import.meta.url));
const UPDATE = process.argv.includes('--update');
const DIST = normalize(join(process.cwd(), process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'web-build-golden'));
const OUT = join(HERE, 'out');
const DIFF = join(HERE, 'diff');
const BASE = join(HERE, 'baseline');

const PORT = 5188;
const FRAME = { width: 390, height: 780 }; // the canonical design frame
const THRESHOLD = 0.1; // per-pixel colour tolerance
const MAX_DIFF_RATIO = 0.01; // ≤1% of pixels may differ

// Canonical states. <screen>--<state>--<theme>. Feature slices append their own.
// The languages route (WBS 3.3) renders a deterministic, DB-free fixture preview when
// given a `state` (and optional `theme`) query param — see src/app/settings/languages.tsx.
const TARGETS = [
  // Dashboard (WBS 5.3) — fixture preview via /?state=… (src/app/(tabs)/index.tsx).
  { name: 'dashboard--loaded--light', path: '/?state=loaded', waitFor: 'text=Continue studying' },
  { name: 'dashboard--not-studied--light', path: '/?state=not-studied', waitFor: 'text=You haven\'t studied today' },
  { name: 'dashboard--goal-met--light', path: '/?state=goal-met', waitFor: 'text=Daily goal reached' },
  { name: 'dashboard--streak-reset--light', path: '/?state=streak-reset', waitFor: 'text=Streak reset' },
  { name: 'dashboard--caught-up--light', path: '/?state=caught-up', waitFor: 'text=all caught up' },
  { name: 'dashboard--empty--light', path: '/?state=empty', waitFor: 'text=Start your first deck' },
  { name: 'dashboard--loading--light', path: '/?state=loading', waitFor: 'text=Good evening' },
  { name: 'dashboard--create-sheet--light', path: '/?state=create-sheet', waitFor: 'text=Add card' },
  { name: 'dashboard--loaded--dark', path: '/?state=loaded&theme=dark', waitFor: 'text=Continue studying' },
  // Subdeck list (WBS 3.5) — fixture preview via /deck/preview?state=… (src/app/deck/[deckId]/index.tsx).
  { name: 'subdeck-list--loaded--light', path: '/deck/preview?state=loaded', waitFor: 'text=Greetings & introductions' },
  { name: 'subdeck-list--dense--light', path: '/deck/preview?state=dense', waitFor: 'text=Formal & Honorific' },
  { name: 'subdeck-list--deep--light', path: '/deck/preview?state=deep', waitFor: 'text=Irregular verbs' },
  { name: 'subdeck-list--empty--light', path: '/deck/preview?state=empty', waitFor: 'text=No subdecks yet' },
  { name: 'subdeck-list--search--light', path: '/deck/preview?state=search', waitFor: 'text=subdecks match' },
  { name: 'subdeck-list--no-results--light', path: '/deck/preview?state=no-results', waitFor: 'text=No subdecks for' },
  { name: 'subdeck-list--selection--light', path: '/deck/preview?state=selection', waitFor: 'text=2 selected' },
  { name: 'subdeck-list--create-sheet--light', path: '/deck/preview?state=create-sheet', waitFor: 'text=Import subdecks' },
  { name: 'subdeck-list--subdeck-actions--light', path: '/deck/preview?state=subdeck-actions', waitFor: 'text=Rename subdeck' },
  { name: 'subdeck-list--play--light', path: '/deck/preview?state=play', waitFor: 'text=Single mode' },
  { name: 'subdeck-list--loading--light', path: '/deck/preview?state=loading' },
  { name: 'subdeck-list--offline--light', path: '/deck/preview?state=offline', waitFor: 'text=Offline · showing saved subdecks' },
  { name: 'subdeck-list--error--light', path: '/deck/preview?state=error', waitFor: 'text=Couldn\'t load subdecks' },

  // Flashcard list (WBS 4.3) — fixture preview via /deck/preview/cards?state=… (src/app/deck/[deckId]/cards.tsx).
  { name: 'flashcard-list--loaded--light', path: '/deck/preview/cards?state=loaded', waitFor: 'text=안녕하세요' },
  { name: 'flashcard-list--dense--light', path: '/deck/preview/cards?state=dense', waitFor: 'text=안녕하세요' },
  { name: 'flashcard-list--minimum-data--light', path: '/deck/preview/cards?state=minimum-data', waitFor: 'text=감사합니다' },
  { name: 'flashcard-list--long-text--light', path: '/deck/preview/cards?state=long-text', waitFor: 'text=전화번호부에' },
  { name: 'flashcard-list--empty--light', path: '/deck/preview/cards?state=empty', waitFor: 'text=No cards yet' },
  { name: 'flashcard-list--search--light', path: '/deck/preview/cards?state=search', waitFor: 'text=공부하다' },
  { name: 'flashcard-list--no-results--light', path: '/deck/preview/cards?state=no-results', waitFor: 'text=No cards found' },
  { name: 'flashcard-list--filter-applied--light', path: '/deck/preview/cards?state=filter-applied', waitFor: 'text=2 due cards' },
  { name: 'flashcard-list--selection--light', path: '/deck/preview/cards?state=selection', waitFor: 'text=2 selected' },
  { name: 'flashcard-list--add-sheet--light', path: '/deck/preview/cards?state=add-sheet', waitFor: 'text=Import cards' },
  { name: 'flashcard-list--card-actions--light', path: '/deck/preview/cards?state=card-actions', waitFor: 'text=Hide card' },
  {
    name: 'flashcard-list--delete-confirm--light',
    path: '/deck/preview/cards?state=delete-confirm',
    waitFor: 'text=Delete this card?',
  },
  { name: 'flashcard-list--loading--light', path: '/deck/preview/cards?state=loading' },
  {
    name: 'flashcard-list--offline--light',
    path: '/deck/preview/cards?state=offline',
    waitFor: 'text=Offline · showing saved cards',
  },
  { name: 'flashcard-list--error--light', path: '/deck/preview/cards?state=error', waitFor: 'text=Couldn\'t load cards' },
  { name: 'flashcard-list--loaded--dark', path: '/deck/preview/cards?state=loaded&theme=dark', waitFor: 'text=안녕하세요' },

  // Library (WBS 3.4) — fixture preview via /library?state=… (src/app/(tabs)/library.tsx).
  { name: 'library--loaded--light', path: '/library?state=loaded', waitFor: 'text=Korean TOPIK I' },
  { name: 'library--dense--light', path: '/library?state=dense', waitFor: 'text=Advanced Idiomatic' },
  { name: 'library--empty--light', path: '/library?state=empty', waitFor: 'text=Build your learning library' },
  { name: 'library--create-sheet--light', path: '/library?state=create-sheet', waitFor: 'text=Create deck' },
  { name: 'library--search-active--light', path: '/library?state=search-active', waitFor: 'text=korean topik' },
  { name: 'library--search-results--light', path: '/library?state=search-results', waitFor: 'text=4 results' },
  { name: 'library--search-no-results--light', path: '/library?state=search-no-results', waitFor: 'text=No results' },
  { name: 'library--filter-applied--light', path: '/library?state=filter-applied', waitFor: 'text=decks match' },
  { name: 'library--filter-sheet--light', path: '/library?state=filter-sheet', waitFor: 'text=Sort & filter' },
  { name: 'library--selection--light', path: '/library?state=selection', waitFor: 'text=3 selected' },
  { name: 'library--loading--light', path: '/library?state=loading' },
  { name: 'library--offline--light', path: '/library?state=offline', waitFor: 'text=Offline · showing saved data' },

  { name: 'languages--list--light', path: '/settings/languages?state=list', waitFor: 'text=한국어 → English' },
  { name: 'languages--empty--light', path: '/settings/languages?state=empty', waitFor: 'text=No language pairs yet' },
  { name: 'languages--add--light', path: '/settings/languages?state=add', waitFor: 'text=Meaning language' },
  { name: 'languages--list--dark', path: '/settings/languages?state=list&theme=dark', waitFor: 'text=한국어 → English' },
  // deck-content-choice (WBS 3.6) — DB-free fixture preview via ?state=/?theme=.
  {
    name: 'deck-content-choice--default--light',
    path: '/deck/preview/content?state=default',
    waitFor: 'text=How do you want to organise it?',
  },
  {
    name: 'deck-content-choice--named--light',
    path: '/deck/preview/content?state=named',
    waitFor: 'text=How do you want to organise it?',
  },
  {
    name: 'deck-content-choice--default--dark',
    path: '/deck/preview/content?state=default&theme=dark',
    waitFor: 'text=How do you want to organise it?',
  },
  // mode-picker (WBS 5.4) — DB-free fixture preview via ?state=/?theme=.
  { name: 'mode-picker--default--light', path: '/session/mode-picker?state=default', waitFor: 'text=Card source' },
  {
    name: 'mode-picker--scope-dropdown--light',
    path: '/session/mode-picker?state=scopeDropdown',
    waitFor: 'text=Unlearned only',
  },
  {
    name: 'mode-picker--not-enough--light',
    path: '/session/mode-picker?state=notEnough',
    waitFor: 'text=This deck needs at least 4 words to play.',
  },
  { name: 'mode-picker--default--dark', path: '/session/mode-picker?state=default&theme=dark', waitFor: 'text=Card source' },
  // deck-settings (WBS 4.5) — DB-free overlay preview via ?state=/?theme=.
  { name: 'deck-settings--action-sheet--light', path: '/deck/preview/settings?state=action-sheet', waitFor: 'text=Deck actions' },
  { name: 'deck-settings--rename--light', path: '/deck/preview/settings?state=rename', waitFor: 'text=Rename deck' },
  { name: 'deck-settings--move--light', path: '/deck/preview/settings?state=move', waitFor: 'text=Move to' },
  { name: 'deck-settings--reset-confirm--light', path: '/deck/preview/settings?state=reset-confirm', waitFor: 'text=Reset progress?' },
  {
    name: 'deck-settings--delete-confirm--light',
    path: '/deck/preview/settings?state=delete-confirm',
    waitFor: 'text=Delete this deck?',
  },
  {
    name: 'deck-settings--action-sheet--dark',
    path: '/deck/preview/settings?state=action-sheet&theme=dark',
    waitFor: 'text=Deck actions',
  },
  // search (WBS 4.6) — DB-free fixture preview via ?state=/?theme=.
  { name: 'search--empty-recent--light', path: '/search?state=empty-recent', waitFor: 'text=RECENT' },
  { name: 'search--results--light', path: '/search?state=results', waitFor: 'text=to study' },
  { name: 'search--filtered--light', path: '/search?state=filtered', waitFor: 'text=to study' },
  { name: 'search--no-results--light', path: '/search?state=no-results', waitFor: 'text=No matches' },
  { name: 'search--results--dark', path: '/search?state=results&theme=dark', waitFor: 'text=to study' },
  // recall-mode (WBS 7.1) — DB-free fixture preview via ?state=/?theme=.
  { name: 'recall-mode--before-reveal--light', path: '/session/recall?state=before-reveal', waitFor: 'text=친구' },
  { name: 'recall-mode--revealed--light', path: '/session/recall?state=revealed', waitFor: 'text=friend' },
  { name: 'recall-mode--remembered--light', path: '/session/recall?state=remembered', waitFor: 'text=Moving to the next card.' },
  { name: 'recall-mode--complete--light', path: '/session/recall?state=complete', waitFor: 'text=Round complete!' },
  { name: 'recall-mode--revealed--dark', path: '/session/recall?state=revealed&theme=dark', waitFor: 'text=friend' },
  // guess-mode (WBS 6.3) — DB-free fixture preview via ?state=/?theme=.
  { name: 'guess-mode--waiting--light', path: '/session/guess?state=waiting', waitFor: 'text=학교' },
  { name: 'guess-mode--correct--light', path: '/session/guess?state=correct', waitFor: 'text=school' },
  { name: 'guess-mode--wrong--light', path: '/session/guess?state=wrong', waitFor: 'text=school' },
  { name: 'guess-mode--long-text--light', path: '/session/guess?state=long-text', waitFor: 'text=students go to study' },
  { name: 'guess-mode--waiting--dark', path: '/session/guess?state=waiting&theme=dark', waitFor: 'text=학교' },
  // fill-mode (WBS 7.2) — DB-free fixture preview via ?state=/?theme=.
  { name: 'fill-mode--waiting--light', path: '/session/fill?state=waiting', waitFor: 'text=friend' },
  { name: 'fill-mode--hint--light', path: '/session/fill?state=hint', waitFor: 'text=starts with' },
  { name: 'fill-mode--correct--light', path: '/session/fill?state=correct', waitFor: 'text=Next' },
  { name: 'fill-mode--wrong--light', path: '/session/fill?state=wrong', waitFor: 'text=Retry' },
  { name: 'fill-mode--wrong--dark', path: '/session/fill?state=wrong&theme=dark', waitFor: 'text=Retry' },
  // reminder (WBS 8.2) — DB-free fixture preview via /settings/reminders?state=/?theme=.
  { name: 'reminder--on--light', path: '/settings/reminders?state=on', waitFor: 'text=13:00' },
  { name: 'reminder--off--light', path: '/settings/reminders?state=off', waitFor: 'text=13:00' },
  { name: 'reminder--time-picker--light', path: '/settings/reminders?state=time-picker', waitFor: 'text=Pick reminder time' },
  { name: 'reminder--on--dark', path: '/settings/reminders?state=on&theme=dark', waitFor: 'text=13:00' },
  // statistics (WBS 8.1) — fixture preview via /stats?state=… (src/app/(tabs)/stats.tsx).
  { name: 'statistics--loaded--light', path: '/stats?state=loaded', waitFor: 'text=Study calendar' },
  { name: 'statistics--scope-switch--light', path: '/stats?state=scope-switch', waitFor: 'text=Study calendar' },
  { name: 'statistics--insufficient--light', path: '/stats?state=insufficient', waitFor: 'text=Not enough data' },
  { name: 'statistics--loading--light', path: '/stats?state=loading', waitFor: 'text=Stats' },
  { name: 'statistics--error--light', path: '/stats?state=error', waitFor: 'text=Couldn\'t load stats' },
  { name: 'statistics--loaded--dark', path: '/stats?state=loaded&theme=dark', waitFor: 'text=Study calendar' },
  // player (WBS 7.3) — DB-free fixture preview via /player?state=/?theme=.
  { name: 'player--playing--light', path: '/player?state=playing', waitFor: 'text=학교' },
  { name: 'player--paused--light', path: '/player?state=paused', waitFor: 'text=학교' },
  { name: 'player--speed--light', path: '/player?state=speed', waitFor: 'text=×1.5' },
  { name: 'player--error--light', path: '/player?state=error', waitFor: 'text=Playback failed' },
  { name: 'player--end--light', path: '/player?state=end', waitFor: 'text=All played' },
  { name: 'player--playing--dark', path: '/player?state=playing&theme=dark', waitFor: 'text=학교' },
  // study-session (WBS 5.5) — DB-free fixture preview via /session/play?state=/?theme=.
  { name: 'study-session--stage1-review--light', path: '/session/play?state=stage1-review', waitFor: 'text=Stage 1 · Review' },
  { name: 'study-session--stage2-match--light', path: '/session/play?state=stage2-match', waitFor: 'text=Stage 2 · Match' },
  { name: 'study-session--stage3-guess--light', path: '/session/play?state=stage3-guess', waitFor: 'text=Stage 3 · Guess' },
  { name: 'study-session--stage4-recall--light', path: '/session/play?state=stage4-recall', waitFor: 'text=Stage 4 · Recall' },
  { name: 'study-session--stage5-fill--light', path: '/session/play?state=stage5-fill', waitFor: 'text=Stage 5 · Fill' },
  { name: 'study-session--relearn--light', path: '/session/play?state=relearn', waitFor: 'text=not counted toward progress' },
  { name: 'study-session--due-review--light', path: '/session/play?state=due-review', waitFor: 'text=Leitner box' },
  { name: 'study-session--exit--light', path: '/session/play?state=exit', waitFor: 'text=Leave the session?' },
  {
    name: 'study-session--resume-error--light',
    path: '/session/play?state=resume-error',
    waitFor: 'text=Couldn\'t resume your session',
  },
  {
    name: 'study-session--answer-save-error--light',
    path: '/session/play?state=answer-save-error',
    waitFor: 'text=Couldn\'t save your answer',
  },
  {
    name: 'study-session--stage1-review--dark',
    path: '/session/play?state=stage1-review&theme=dark',
    waitFor: 'text=Stage 1 · Review',
  },
  // review-mode (WBS 6.1) — DB-free fixture preview via ?state=/?theme=.
  { name: 'review-mode--browsing--light', path: '/session/review?state=browsing', waitFor: 'text=학교' },
  { name: 'review-mode--editing--light', path: '/session/review?state=editing', waitFor: 'text=학교' },
  { name: 'review-mode--audio--light', path: '/session/review?state=audio', waitFor: 'text=Playing…' },
  { name: 'review-mode--loading--light', path: '/session/review?state=loading', waitFor: 'text=Review' },
  { name: 'review-mode--error--light', path: '/session/review?state=error', waitFor: 'text=Couldn\'t load review' },
  { name: 'review-mode--end--light', path: '/session/review?state=end', waitFor: 'text=All reviewed' },
  { name: 'review-mode--browsing--dark', path: '/session/review?state=browsing&theme=dark', waitFor: 'text=학교' },
  // flashcard-editor (WBS 4.4) — DB-free fixture preview via /card/new?state=/?theme=.
  { name: 'flashcard-editor--create--light', path: '/card/new?state=create', waitFor: 'text=New card' },
  { name: 'flashcard-editor--edit--light', path: '/card/new?state=edit', waitFor: 'text=Edit card' },
  { name: 'flashcard-editor--validation--light', path: '/card/new?state=validation', waitFor: 'text=Enter a term.' },
  { name: 'flashcard-editor--duplicate--light', path: '/card/new?state=duplicate', waitFor: 'text=already exists' },
  {
    name: 'flashcard-editor--additional-translation--light',
    path: '/card/new?state=additional-translation',
    waitFor: 'text=Translation · Tiếng Việt',
  },
  {
    name: 'flashcard-editor--audio-generating--light',
    path: '/card/new?state=audio-generating',
    waitFor: 'text=Term · 한국어',
  },
  { name: 'flashcard-editor--submitting--light', path: '/card/new?state=submitting', waitFor: 'text=Saving…' },
  {
    name: 'flashcard-editor--submit-error--light',
    path: '/card/new?state=submit-error',
    waitFor: 'text=Couldn’t save the card',
  },
  {
    name: 'flashcard-editor--submit-success--light',
    path: '/card/new?state=submit-success',
    waitFor: 'text=Card saved.',
  },
  { name: 'flashcard-editor--create--dark', path: '/card/new?state=create&theme=dark', waitFor: 'text=New card' },
  // study-result (WBS 7.4) — DB-free fixture preview via ?state=/?theme=.
  { name: 'study-result--standard--light', path: '/session/result?state=standard', waitFor: 'text=Session complete' },
  { name: 'study-result--goal-met--light', path: '/session/result?state=goal-met', waitFor: 'text=Daily goal reached!' },
  { name: 'study-result--goal-missed--light', path: '/session/result?state=goal-missed', waitFor: 'text=Almost there!' },
  { name: 'study-result--many-wrong--light', path: '/session/result?state=many-wrong', waitFor: 'text=A few shaky words' },
  { name: 'study-result--finalizing--light', path: '/session/result?state=finalizing', waitFor: 'text=Saving your results' },
  {
    name: 'study-result--retry-finalize--light',
    path: '/session/result?state=retry-finalize',
    waitFor: 'text=Retrying…',
  },
  {
    name: 'study-result--finalize-error--light',
    path: '/session/result?state=finalize-error',
    waitFor: 'text=Couldn\'t save your results',
  },
  {
    name: 'study-result--standard--dark',
    path: '/session/result?state=standard&theme=dark',
    waitFor: 'text=Session complete',
  },
  // match-mode (WBS 6.2) — DB-free fixture preview via ?state=/?theme=.
  { name: 'match-mode--playing--light', path: '/session/match?state=playing', waitFor: 'text=friend' },
  { name: 'match-mode--selected--light', path: '/session/match?state=selected', waitFor: 'text=love' },
  { name: 'match-mode--correct--light', path: '/session/match?state=correct', waitFor: 'text=love' },
  { name: 'match-mode--almost--light', path: '/session/match?state=almost', waitFor: 'text=3/5' },
  { name: 'match-mode--playing--dark', path: '/session/match?state=playing&theme=dark', waitFor: 'text=friend' },
  // import (WBS 9.1) — DB-free fixture preview via /settings/import?state=/?theme=.
  { name: 'import--source--light', path: '/settings/import?state=source', waitFor: 'text=CHOOSE SOURCE' },
  { name: 'import--mapping--light', path: '/settings/import?state=mapping', waitFor: 'text=COLUMN MAPPING' },
  { name: 'import--preview--light', path: '/settings/import?state=preview', waitFor: 'text=Import 124 cards' },
  {
    name: 'import--dup-warning--light',
    path: '/settings/import?state=dup-warning',
    waitFor: 'text=import anyway?',
  },
  { name: 'import--importing--light', path: '/settings/import?state=importing', waitFor: 'text=Importing…' },
  { name: 'import--import-error--light', path: '/settings/import?state=import-error', waitFor: 'text=Import failed' },
  { name: 'import--done--light', path: '/settings/import?state=done', waitFor: 'text=Imported 124 cards' },
  { name: 'import--source--dark', path: '/settings/import?state=source&theme=dark', waitFor: 'text=CHOOSE SOURCE' },
  // export (WBS 9.2) — DB-free fixture preview via /settings/export?state=/?theme=.
  { name: 'export--config--light', path: '/settings/export?state=config', waitFor: 'text=Include review state' },
  { name: 'export--exporting--light', path: '/settings/export?state=exporting', waitFor: 'text=Exporting…' },
  {
    name: 'export--export-error--light',
    path: '/settings/export?state=export-error',
    waitFor: 'text=Export failed',
  },
  { name: 'export--done--light', path: '/settings/export?state=done', waitFor: 'text=Exported 320 cards' },
  { name: 'export--config--dark', path: '/settings/export?state=config&theme=dark', waitFor: 'text=Include review state' },
  // settings (WBS 10.1) — root/value-picker preview on the profile tab, study screens on /settings/study.
  { name: 'settings--loaded--light', path: '/profile?state=loaded', waitFor: 'text=Study settings' },
  { name: 'settings--study-hub--light', path: '/settings/study?state=study-hub', waitFor: 'text=Language pairs' },
  {
    name: 'settings--study-worddisplay--light',
    path: '/settings/study?state=study-worddisplay',
    waitFor: 'text=Color by gender',
  },
  { name: 'settings--study-srs--light', path: '/settings/study?state=study-srs', waitFor: 'text=Leitner boxes' },
  { name: 'settings--study-mode--light', path: '/settings/study?state=study-mode', waitFor: 'text=Words per round' },
  { name: 'settings--study-voice--light', path: '/settings/study?state=study-voice', waitFor: 'text=Text-to-speech' },
  { name: 'settings--value-picker--light', path: '/profile?state=value-picker', waitFor: 'text=10 words' },
  { name: 'settings--loaded--dark', path: '/profile?state=loaded&theme=dark', waitFor: 'text=Study settings' },
];

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function serve(root) {
  return createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/' || p.endsWith('/')) p += 'index.html';
      let fp = normalize(join(root, p));
      if (!fp.startsWith(root)) {
        res.writeHead(403).end();
        return;
      }
      if (!(await exists(fp)) && !extname(fp)) fp += '.html';
      const data = await readFile(fp);
      res.writeHead(200, { 'content-type': MIME[extname(fp)] || 'application/octet-stream' });
      res.end(data);
    } catch {
      // SPA fallback: serve the root document for unknown routes.
      try {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(await readFile(join(root, 'index.html')));
      } catch {
        res.writeHead(404).end('not found');
      }
    }
  });
}

async function main() {
  if (!(await exists(join(DIST, 'index.html')))) {
    console.error(`✗ No web build at ${DIST}. Run: npx expo export --platform web --output-dir ${DIST}`);
    process.exit(2);
  }
  await mkdir(OUT, { recursive: true });
  await mkdir(BASE, { recursive: true });

  const server = serve(DIST);
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: FRAME, deviceScaleFactor: 1 });

  const results = [];
  for (const t of TARGETS) {
    await page.goto(`http://localhost:${PORT}${t.path}`, { waitUntil: 'networkidle' });
    if (t.waitFor) {
      await page.waitForSelector(t.waitFor, { timeout: 15000 }).catch(() => {});
    }
    await page.waitForTimeout(500); // settle fonts/layout
    const shotPath = join(OUT, `${t.name}.png`);
    await page.screenshot({ path: shotPath, clip: { x: 0, y: 0, ...FRAME } });

    const basePath = join(BASE, `${t.name}.png`);
    if (UPDATE || !(await exists(basePath))) {
      await copyFile(shotPath, basePath);
      results.push({ name: t.name, status: 'baseline-written' });
      continue;
    }
    const a = PNG.sync.read(await readFile(shotPath));
    const b = PNG.sync.read(await readFile(basePath));
    if (a.width !== b.width || a.height !== b.height) {
      results.push({ name: t.name, status: 'size-mismatch', a: [a.width, a.height], b: [b.width, b.height] });
      continue;
    }
    const diff = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: THRESHOLD });
    const ratio = n / (a.width * a.height);
    if (ratio > MAX_DIFF_RATIO) {
      await mkdir(DIFF, { recursive: true });
      await writeFile(join(DIFF, `${t.name}.png`), PNG.sync.write(diff));
      results.push({ name: t.name, status: 'mismatch', diffPixels: n, ratio: +ratio.toFixed(4) });
    } else {
      results.push({ name: t.name, status: 'match', diffPixels: n, ratio: +ratio.toFixed(4) });
    }
  }

  await browser.close();
  server.close();
  await writeFile(join(OUT, 'report.json'), JSON.stringify(results, null, 2));

  for (const r of results) console.log(`${r.status.padEnd(16)} ${r.name}${r.ratio !== undefined ? `  (${(r.ratio * 100).toFixed(2)}% diff)` : ''}`);
  const failed = results.filter((r) => r.status === 'mismatch' || r.status === 'size-mismatch');
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
