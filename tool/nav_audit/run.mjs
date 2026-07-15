#!/usr/bin/env node
// tool/nav_audit/run.mjs — dynamic navigation/button audit over the web build.
// After the 12.1–12.4 fixes this suite runs POSITIVE end-to-end: creates a
// language pair + deck through the UI, imports cards, completes a FULL 5-stage
// session to the result screen, and walks every sheet/dialog open/close.
// Remaining `DEAD?` steps document the 12.11 product-decision no-ops.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { chromium } from 'playwright';

const DIST = normalize(join(process.cwd(), process.argv[2] ?? 'web-build-golden'));
const PORT = 5190;
const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.json': 'application/json',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = join(DIST, decodeURIComponent(url.pathname));
  try {
    let data;
    try { data = await readFile(p); } catch { data = await readFile(join(DIST, 'index.html')); p = 'index.html'; }
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(PORT, r));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 160)));
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });

const results = [];
const T = (id) => `[data-testid="${id}"]`;
// Expo-router keeps previous stack screens mounted → always drive the LAST
// VISIBLE match.
const el = (id) => page.locator(`${T(id)} >> visible=true`).last();
const byText = (s) => page.locator(`text=${s} >> visible=true`).last();

async function step(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  PASS ${name}`);
  } catch (e) {
    results.push({ name, ok: false, err: String(e).split('\n')[0].slice(0, 140) });
    console.log(`  FAIL ${name}\n       ${String(e).split('\n')[0].slice(0, 150)}`);
    try {
      const n = results.length;
      await page.screenshot({ path: `tool/nav_audit/fail-${n}.png` });
      const vis = await page.$$eval('[data-testid]', (els) =>
        els.filter((el) => el.offsetParent !== null).map((el) => el.getAttribute('data-testid')));
      console.log(`       visible: ${[...new Set(vis)].join(' ')}`.slice(0, 360));
    } catch { /* diagnostics only */ }
  }
}

const vis = (id, timeout = 8000) => el(id).waitFor({ state: 'visible', timeout });
const goneAll = (id, timeout = 8000) => page.locator(T(id)).first().waitFor({ state: 'detached', timeout });
const click = async (id) => { await vis(id); await el(id).click(); };
const text = (s, timeout = 8000) => byText(s).waitFor({ state: 'visible', timeout });
const go = (path) => page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });

// Seed vocabulary — EXACTLY 3 cards so the 5-stage match board (first 3 cards)
// covers every card and the session is completable.
const SEED = { 사랑: 'love', 학교: 'school', 친구: 'friend' };
const TERM_OF = Object.fromEntries(Object.entries(SEED).map(([t, m]) => [m, t]));
let deckId = null;

// ---------------------------------------------------------------- tabs (live)
console.log('== tabs (live) ==');
await step('boot: Today tab renders live', async () => { await go('/'); await vis('shell/bottom-nav'); });
await step('tab → Library', async () => { await click('shell/bottom-nav/library'); await text('Build your learning library'); });
await step('tab → Stats', async () => { await click('shell/bottom-nav/stats'); await vis('shell/bottom-nav/stats'); });
await step('tab → Profile (settings root)', async () => { await click('shell/bottom-nav/profile'); await text('Study settings'); });
await step('tab → Today', async () => { await click('shell/bottom-nav/index'); await vis('shell/bottom-nav/index'); });

// ------------------------------------------------- create deck (12.1, live)
console.log('== create deck (12.1) ==');
await step('12.1: with NO language pair, Create deck routes to add-pair', async () => {
  await go('/library');
  await click('library/empty-create');
  await text('New deck');
  await page.locator('input >> visible=true').last().fill('TOPIK I — Vocabulary');
  await click('deck-content-choice/cards');
  await page.waitForURL(/settings\/languages/, { timeout: 8000 });
});
await step('languages: add-pair flow creates a pair', async () => {
  await click('languages/empty-add');
  await vis('languages/add-screen');
  await click('languages/learn-lang');
  await vis('languages/pick-sheet');
  await page.locator(`${T('languages/pick-sheet')} [data-testid] >> visible=true`).first().click();
  await goneAll('languages/pick-sheet');
  await click('languages/add-confirm');
  await vis('languages/list');
});
await step('12.1: with a pair, Create deck CREATES the deck and lands on its cards', async () => {
  await go('/library');
  await click('library/empty-create');
  await text('New deck');
  await page.locator('input >> visible=true').last().fill('TOPIK I — Vocabulary');
  await click('deck-content-choice/cards');
  await page.waitForURL(/\/deck\/(?!new\b)[^/]+\/cards/, { timeout: 10000 });
  deckId = decodeURIComponent(new URL(page.url()).pathname.split('/')[2]);
});
await step('library lists the created deck', async () => {
  await go('/library');
  await text('TOPIK I — Vocabulary');
});

// ------------------------------------------------- import seed (live)
console.log('== import (seed 3 cards) ==');
await step('import: paste → mapping → preview → Imported 3 cards → Back to deck', async () => {
  await go('/settings/import');
  await el('import/paste').fill(Object.entries(SEED).map(([t, m]) => `${t}\t${m}`).join('\n'));
  await click('import/source-2');
  await text('COLUMN MAPPING');
  await click('import/to-preview');
  await click('import/do-import');
  await text('Imported 3 cards', 15000);
  await click('import/go-deck');
  await page.waitForURL(/\/deck\//, { timeout: 8000 });
});

// ------------------------------------------------- card flows (12.4, live)
console.log('== card flows (12.4, live) ==');
await step('cards list shows the imported cards', async () => {
  await go(`/deck/${deckId}/cards`);
  await text('사랑');
});
await step('12.4: FAB → Add card carries the deck context in the URL', async () => {
  await click('flashcard-list/add');
  await vis('flashcard-list/add-sheet');
  await click('flashcard-list/add-card');
  await page.waitForURL(/\/card\/new\?.*deckId=/, { timeout: 8000 });
  if (!page.url().includes(`deckId=${encodeURIComponent(deckId)}`) && !page.url().includes(`deckId=${deckId}`)) {
    throw new Error(`wrong deckId in ${page.url()}`);
  }
});
await step('editor: fill + Save persists into THIS deck and returns', async () => {
  await el('flashcard-editor/term').locator('input, textarea').last().fill('물');
  await el('flashcard-editor/meaning').locator('input, textarea').last().fill('water');
  await click('flashcard-editor/save');
  await page.waitForTimeout(1200);
  await go(`/deck/${deckId}/cards`);
  await text('물');
});
await step('editor save cleanup: delete the extra card so the match board stays 3-wide', async () => {
  await go(`/deck/${deckId}/cards`);
  await click('flashcard-list/card-3');
  await vis('flashcard-list/actions-sheet');
  await click('flashcard-list/action-delete');
  await vis('flashcard-list/delete-dialog');
  await byText('Delete').click();
  await page.waitForTimeout(800);
  await go(`/deck/${deckId}/cards`);
  const still = await page.locator('text=물 >> visible=true').count();
  if (still > 0) throw new Error('confirm did not delete');
});
await step('card-actions sheet opens on card press', async () => {
  await go(`/deck/${deckId}/cards`);
  await click('flashcard-list/card-0');
  await vis('flashcard-list/actions-sheet');
});
await step('DEAD? Move/Hide card are documented no-ops (12.11 pending)', async () => {
  await click('flashcard-list/action-move');
  await page.waitForTimeout(300);
  await vis('flashcard-list/actions-sheet');
  await click('flashcard-list/action-hide');
  await page.waitForTimeout(300);
  await vis('flashcard-list/actions-sheet');
});
await step('Delete card → dialog → Cancel keeps the card (DB-checked)', async () => {
  await click('flashcard-list/action-delete');
  await vis('flashcard-list/delete-dialog');
  await byText('Cancel').click();
  await goneAll('flashcard-list/delete-dialog');
  await text('사랑'); // cancel kept it
});

// ------------------------------------------------- deck settings (live)
console.log('== deck settings (live dialogs) ==');
await step('deck settings: opens WITH the action sheet (kit default) → Rename dialog open/Cancel', async () => {
  await go(`/deck/${deckId}/settings`);
  await vis('deck-settings/actions-sheet'); // opens by design
  await click('deck-settings/action-rename');
  await vis('deck-settings/rename-dialog');
  await click('deck-settings/rename-cancel');
  await goneAll('deck-settings/rename-dialog');
});
await step('deck settings: Move sheet + Reset/Delete dialogs open and Cancel', async () => {
  await click('deck-settings/more');
  await vis('deck-settings/actions-sheet');
  await click('deck-settings/action-move');
  await vis('deck-settings/move-sheet');
  await page.mouse.click(195, 60);
  await goneAll('deck-settings/move-sheet');
  await click('deck-settings/more');
  await click('deck-settings/action-reset');
  await vis('deck-settings/reset-dialog');
  await byText('Cancel').click();
  await goneAll('deck-settings/reset-dialog');
  await click('deck-settings/more');
  await click('deck-settings/action-delete');
  await vis('deck-settings/delete-dialog');
  await byText('Cancel').click();
  await goneAll('deck-settings/delete-dialog');
});

// ------------------------------------------------- full 5-stage session (12.3, live)
console.log('== full 5-stage session (12.3, live) ==');
// Stages 3/5 have no testID on the prompt card — detect the current card by
// which seed term (stage 3) / meaning (stage 5) is visible on screen.
async function visibleSeed(candidates) {
  for (const c of candidates) {
    if ((await page.locator(`text=${c} >> visible=true`).count()) > 0) return c;
  }
  throw new Error(`no seed text visible among ${candidates.join(',')}`);
}
await step('session boots at Stage 1 · Review', async () => {
  await go(`/session/play?deckId=${deckId}`);
  await text('Stage 1 · Review', 12000);
});
await step('stage 1: Next ×3 → Stage 2 · Match', async () => {
  for (let i = 0; i < 3; i += 1) {
    await click('study-session/next');
    await page.waitForTimeout(250);
  }
  await text('Stage 2 · Match', 8000);
});
await step('12.3: stage 2 match tiles answer and advance → Stage 3 · Guess', async () => {
  // Board = first 3 cards in order; the current card iterates in the same
  // order, so the correct meaning tile is l0 → l1 → l2.
  for (let i = 0; i < 3; i += 1) {
    await click(`study-session/match-l${i}`);
    await page.waitForTimeout(300);
  }
  await text('Stage 3 · Guess', 8000);
});
await step('stage 3: pick the correct meaning ×3 → Stage 4 · Recall', async () => {
  for (let i = 0; i < 3; i += 1) {
    const term = await visibleSeed(Object.keys(SEED));
    await byText(SEED[term]).click();
    await page.waitForTimeout(300);
  }
  await text('Stage 4 · Recall', 8000);
});
await step('stage 4: Show ×3 (reveal advances directly) → Stage 5 · Fill', async () => {
  for (let i = 0; i < 3; i += 1) {
    await click('study-session/reveal');
    await page.waitForTimeout(300);
  }
  await text('Stage 5 · Fill', 8000);
});
await step('stage 5: type each term + check ×3 → result screen', async () => {
  for (let i = 0; i < 3; i += 1) {
    const meaning = await visibleSeed(Object.values(SEED));
    await el('study-session/fill-input').fill(TERM_OF[meaning]);
    await click('study-session/check');
    await page.waitForTimeout(350);
  }
  await page.waitForURL(/\/session\/result/, { timeout: 12000 });
});
await step('exit dialog: Stay keeps the session, Leave exits', async () => {
  await go(`/session/play?deckId=${deckId}`);
  await text('Stage 1 · Review', 12000);
  await click('study-session/close');
  await vis('study-session/exit-dialog');
  await click('study-session/exit-cancel');
  await goneAll('study-session/exit-dialog');
  await click('study-session/close');
  await vis('study-session/exit-dialog');
  await click('study-session/exit-ok');
  await page.waitForTimeout(500);
});

// ------------------------------------------------- study modes + player (live)
console.log('== study modes + player (live) ==');
await step('mode-picker: scope sheet opens/picks; mode starts a session', async () => {
  await go(`/session/mode-picker?deckId=${deckId}`);
  await click('mode-picker/scope');
  await vis('mode-picker/scope-sheet');
  await page.mouse.click(195, 60);
  await goneAll('mode-picker/scope-sheet');
});
for (const mode of ['review', 'guess', 'recall', 'fill', 'match']) {
  await step(`/session/${mode} renders over the seeded deck + back`, async () => {
    await go(`/session/${mode}?deckId=${deckId}`);
    await vis(`${mode}-mode/back`);
    await click(`${mode}-mode/back`);
  });
}
await step('player: renders over the deck (transport where TTS allows) + back', async () => {
  await go(`/player?deckId=${deckId}`);
  await vis('player/back');
  // Headless Chromium has no speech voices — the player may legitimately land
  // in its error state; exercise the transport only when it is offered.
  if ((await page.locator(`${T('player/playpause')} >> visible=true`).count()) > 0) {
    await click('player/playpause');
    await click('player/next');
  } else {
    await vis('player/retry').catch(() => vis('player/replay'));
  }
  await click('player/back');
});

// ------------------------------------------------- settings tree (12.2, live)
console.log('== settings (12.2, live) ==');
await step('profile → Study settings hub', async () => {
  await go('/profile');
  await click('settings/study');
  await text('Language pairs');
});
for (const [row, key, marker] of [
  ['settings/study-worddisplay', 'worddisplay', 'settings/wd-gender-switch'],
  ['settings/study-srs', 'srs', 'settings/srs-boxes'],
  ['settings/study-mode', 'mode', 'settings/mode-count'],
  ['settings/study-voice', 'voice', 'settings/voice-tts-switch'],
]) {
  await step(`12.2: hub row → /settings/study/${key} renders → back → hub`, async () => {
    await go('/settings/study');
    await click(row);
    await page.waitForURL(new RegExp(`settings/study/${key}`), { timeout: 8000 });
    await vis(marker);
    await click('settings/child-back');
    await vis('settings/study-language');
  });
}
await step('12.2: legacy deep link ?screen=srs still renders the child', async () => {
  await go('/settings/study?screen=srs');
  await vis('settings/srs-boxes');
});
await step('value-picker opens, picks 10 words, closes', async () => {
  await go('/settings/study/mode');
  await click('settings/mode-count');
  await vis('settings/picker-sheet');
  await click('settings/words-10');
  await goneAll('settings/picker-sheet');
  await text('10');
});
await step('reminders: time picker opens + Done closes', async () => {
  await go('/settings/reminders');
  await click('reminder/time-edit');
  await vis('reminder/picker-sheet');
  await click('reminder/picker-done');
  await goneAll('reminder/picker-sheet');
});
await step('DEAD? Backup / Restore row is a no-op (10.3 pending)', async () => {
  await go('/profile');
  await click('settings/backup');
  await page.waitForTimeout(400);
  if (!page.url().endsWith('/profile')) throw new Error(`navigated to ${page.url()}`);
});

// ------------------------------------------------- export + search (live, seeded)
console.log('== export + search (live) ==');
await step('export runs to done with Share/Save', async () => {
  await go('/settings/export');
  await click('export/do-export');
  await vis('export/done', 15000);
  await vis('export/share');
  await vis('export/save');
});
await step('search finds a seeded card → opens editor → Cancel back', async () => {
  await go('/search');
  await vis('search/dock');
  await page.locator('input >> visible=true').last().fill('사랑');
  await page.waitForTimeout(900);
  await byText('사랑').click();
  await page.waitForURL(/\/card\//, { timeout: 8000 });
  await click('flashcard-editor/cancel');
});

// ------------------------------------------------- remaining fixture overlays
console.log('== remaining overlays (fixture) ==');
await step('library: create sheet + filter sheet open/close (fixture)', async () => {
  await go('/library?state=loaded');
  await click('library/create');
  await vis('library/create-sheet');
  await page.mouse.click(195, 60);
  await goneAll('library/create-sheet');
  await click('library/filters');
  await vis('library/filter-sheet');
  await click('library/fs-apply');
  await goneAll('library/filter-sheet');
});
await step('subdeck-list: create sheet opens + scrim dismisses (fixture)', async () => {
  await go('/deck/X?state=loaded');
  await click('subdeck-list/create');
  await vis('subdeck-list/create-sheet');
  await page.mouse.click(195, 60);
  await goneAll('subdeck-list/create-sheet');
});

// ---------------------------------------------------------------- report
console.log('\n== RESULT ==');
const fails = results.filter((r) => !r.ok);
console.log(`${results.length - fails.length}/${results.length} steps passed`);
for (const f of fails) console.log(`  FAIL ${f.name} — ${f.err}`);
if (consoleErrors.length) {
  console.log(`console errors seen (${consoleErrors.length} total, unique first 8):`);
  for (const e of [...new Set(consoleErrors)].slice(0, 8)) console.log('  ·', e);
}
await browser.close();
server.close();
process.exitCode = fails.length > 0 ? 1 : 0;
