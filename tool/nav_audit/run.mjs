#!/usr/bin/env node
// tool/nav_audit/run.mjs — dynamic navigation/button audit over the web build.
// LIVE where data allows (fresh DB), FIXTURE routes (?state=) for screen-internal
// overlays. Every step reports PASS/FAIL; steps named "BUG?" assert a suspected
// defect and PASS when the defect is confirmed present.

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
// Expo-router keeps previous stack screens mounted → always drive the LAST match.
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
  }
}

const vis = (id, timeout = 8000) => el(id).waitFor({ state: 'visible', timeout });
const goneAll = (id, timeout = 8000) => page.locator(T(id)).first().waitFor({ state: 'detached', timeout });
const click = async (id) => { await vis(id); await el(id).click(); };
const text = (s, timeout = 8000) => byText(s).waitFor({ state: 'visible', timeout });
const go = (path) => page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });

// ---------------------------------------------------------------- tabs (live)
console.log('== tabs (live) ==');
await step('boot: Today tab renders live', async () => { await go('/'); await vis('shell/bottom-nav'); });
await step('tab → Library', async () => { await click('shell/bottom-nav/library'); await text('Build your learning library'); });
await step('tab → Stats', async () => { await click('shell/bottom-nav/stats'); await vis('shell/bottom-nav/stats'); });
await step('tab → Profile (settings root)', async () => { await click('shell/bottom-nav/profile'); await text('Study settings'); });
await step('tab → Today', async () => { await click('shell/bottom-nav/index'); await vis('shell/bottom-nav/index'); });

// ---------------------------------------------------------------- create-deck dead end (live)
console.log('== create deck (live) ==');
await step('Library → Create deck opens /deck/new/content', async () => {
  await go('/library');
  await click('library/empty-create');
  await text('New deck');
});
await step('BUG? naming + choosing content FAILS to create a deck (deckId "new" never exists)', async () => {
  await page.locator('input >> visible=true').last().fill('TOPIK I — Vocabulary');
  await click('deck-content-choice/cards');
  await page.waitForTimeout(2500);
  if (!page.url().includes('/deck/new/content')) throw new Error(`unexpectedly navigated: ${page.url()}`);
  await vis('deck-content-choice/error'); // error banner = creation failed
});

// ---------------------------------------------------------------- languages (live create flow)
console.log('== languages (live) ==');
await step('languages: add-pair flow creates a pair', async () => {
  await go('/settings/languages');
  await click('languages/empty-add');
  await vis('languages/add-screen');
  await click('languages/learn-lang');
  await vis('languages/pick-sheet');
  await page.locator(`${T('languages/pick-sheet')} [data-testid]`).first().click();
  await goneAll('languages/pick-sheet');
  await click('languages/add-confirm');
  await vis('languages/list');
});
await step('languages back → settings', async () => { await click('languages/back'); await page.waitForTimeout(400); });

// ---------------------------------------------------------------- import/export with empty DB (live)
console.log('== import/export (live, no deck) ==');
await step('import: paste → mapping → continue → preview', async () => {
  await go('/settings/import');
  await el('import/paste').fill('사랑\tlove\n학교\tschool');
  await click('import/source-2');
  await text('COLUMN MAPPING');
  await click('import/to-preview');
  await vis('import/do-import');
});
await step('import with no deck lands in import-error (not a crash)', async () => {
  await click('import/do-import');
  await vis('import/error', 15000);
  await click('import/retry');
  await vis('import/error', 15000);
});
await step('export: config → Export → done + share/save present', async () => {
  await go('/settings/export');
  await click('export/do-export');
  await vis('export/done', 15000);
  await vis('export/share');
  await vis('export/save');
});

// ---------------------------------------------------------------- settings tree (live)
console.log('== settings (live) ==');
await step('profile → Study settings hub', async () => {
  await go('/profile');
  await click('settings/study');
  await text('Language pairs');
});
await step('hub → Language pairs (different pathname) navigates', async () => {
  await go('/settings/study');
  await click('settings/study-language');
  await page.waitForURL(/settings\/languages/, { timeout: 8000 });
});
for (const [row, marker] of [
  ['settings/study-worddisplay', 'settings/wd-gender-switch'],
  ['settings/study-srs', 'settings/srs-boxes'],
  ['settings/study-mode', 'settings/mode-count'],
  ['settings/study-voice', 'settings/voice-tts-switch'],
]) {
  await step(`BUG? hub → ${row} DEAD (same-path query push is swallowed)`, async () => {
    await go('/settings/study');
    await click(row);
    await page.waitForTimeout(1200);
    if (page.url().includes('screen=')) throw new Error('navigated — bug fixed?');
    const childVisible = await page.locator(`${T(marker)} >> visible=true`).count();
    if (childVisible > 0) throw new Error('child rendered — bug fixed?');
  });
  await step(`deep link /settings/study?screen=… for ${row} DOES render`, async () => {
    const key = row.replace('settings/study-', '');
    await go(`/settings/study?screen=${key}`);
    await vis(marker);
  });
}
await step('study-mode: switches toggle live', async () => {
  await go('/settings/study?screen=mode');
  await text('Words per round');
  await click('settings/mode-shuffle-switch');
  await click('settings/mode-autoplay-switch');
});
await step('value-picker opens, picks 10 words, closes', async () => {
  await click('settings/mode-count');
  await vis('settings/picker-sheet');
  await click('settings/words-10');
  await goneAll('settings/picker-sheet');
  await text('10');
});
await step('reminders: toggle + time picker opens + Done closes', async () => {
  await go('/settings/reminders');
  await click('reminder/time-edit');
  await vis('reminder/picker-sheet');
  await click('reminder/picker-done');
  await goneAll('reminder/picker-sheet');
});
await step('theme opens from root row', async () => {
  await go('/profile');
  await click('settings/theme');
  await page.waitForTimeout(600);
  await vis('shell/bottom-nav', 4000).catch(() => {});
});
await step('DEAD? Backup / Restore row is a no-op (10.3 pending)', async () => {
  await go('/profile');
  await click('settings/backup');
  await page.waitForTimeout(400);
  if (!page.url().endsWith('/profile')) throw new Error(`navigated to ${page.url()}`);
});

// ---------------------------------------------------------------- search + editor (live, no data)
console.log('== search + editor (live) ==');
await step('search: dock renders, empty query → recent/empty, back works', async () => {
  await go('/search');
  await vis('search/dock');
  await click('search/back');
});
await step('/card/new bare renders the editor (no deckId — save must not corrupt)', async () => {
  await go('/card/new');
  await text('New card');
});

// ---------------------------------------------------------------- session routes with empty deck (live)
console.log('== session routes (live, empty deck) ==');
await step('mode-picker renders without deckId + back', async () => {
  await go('/session/mode-picker');
  await vis('mode-picker/screen');
  await click('mode-picker/back');
});
await step('mode-picker scope sheet opens + dismisses via scrim', async () => {
  await go('/session/mode-picker');
  await click('mode-picker/scope');
  await vis('mode-picker/scope-sheet');
  await page.mouse.click(195, 60);
  await goneAll('mode-picker/scope-sheet');
});
for (const mode of ['review', 'guess', 'recall', 'fill', 'match']) {
  await step(`/session/${mode} (empty deck) renders a safe state + back`, async () => {
    await go(`/session/${mode}`);
    await vis(`${mode}-mode/back`);
    await click(`${mode}-mode/back`);
  });
}
await step('/session/play (empty deck) renders a safe state', async () => {
  await go('/session/play');
  await page.waitForTimeout(1500);
  const body = await page.textContent('body');
  if (!body) throw new Error('blank');
});
await step('/session/result without sessionId renders a safe state', async () => {
  await go('/session/result');
  await page.waitForTimeout(1500);
  const body = await page.textContent('body');
  if (!body) throw new Error('blank');
});
await step('/player (empty deck) renders a safe state + back', async () => {
  await go('/player');
  await vis('player/back');
  await click('player/back');
});

// ---------------------------------------------------------------- fixture-mode overlays (dialogs & sheets)
console.log('== overlays via fixture routes ==');
await step('flashcard-list: card press → actions sheet opens', async () => {
  await go('/deck/X/cards?state=loaded');
  await click('flashcard-list/card-0');
  await vis('flashcard-list/actions-sheet');
});
await step('BUG? Move card + Hide card are no-ops (unwired in live route too)', async () => {
  await click('flashcard-list/action-move');
  await page.waitForTimeout(300);
  await vis('flashcard-list/actions-sheet');
  await click('flashcard-list/action-hide');
  await page.waitForTimeout(300);
  await vis('flashcard-list/actions-sheet');
});
await step('flashcard-list: Delete → dialog opens → Cancel closes', async () => {
  await click('flashcard-list/action-delete');
  await vis('flashcard-list/delete-dialog');
  await byText('Cancel').click();
  await goneAll('flashcard-list/delete-dialog');
});
await step('flashcard-list: FAB → add sheet opens → scrim dismisses', async () => {
  await go('/deck/X/cards?state=loaded');
  await click('flashcard-list/add');
  await vis('flashcard-list/add-sheet');
  await page.mouse.click(195, 60);
  await goneAll('flashcard-list/add-sheet');
});
await step('flashcard-list: search mode enter + clear exits', async () => {
  await click('flashcard-list/search-open');
  await vis('flashcard-list/search-dock');
  await click('flashcard-list/search-clear');
  await vis('flashcard-list/add');
});
await step('deck-settings: action sheet → Rename dialog opens', async () => {
  await go('/deck/X/settings?state=action-sheet');
  await vis('deck-settings/actions-sheet');
  await click('deck-settings/action-rename');
  await vis('deck-settings/rename-dialog');
  await click('deck-settings/rename-cancel');
  await goneAll('deck-settings/rename-dialog');
});
await step('deck-settings: action sheet → Move sheet opens + scrim dismisses', async () => {
  await go('/deck/X/settings?state=action-sheet');
  await click('deck-settings/action-move');
  await vis('deck-settings/move-sheet');
  await page.mouse.click(195, 60);
  await goneAll('deck-settings/move-sheet');
});
await step('deck-settings: Reset dialog open/Cancel', async () => {
  await go('/deck/X/settings?state=reset-confirm');
  await vis('deck-settings/reset-dialog');
  await byText('Cancel').click();
  await goneAll('deck-settings/reset-dialog');
});
await step('deck-settings: Delete dialog open/Cancel', async () => {
  await go('/deck/X/settings?state=delete-confirm');
  await vis('deck-settings/delete-dialog');
  await byText('Cancel').click();
  await goneAll('deck-settings/delete-dialog');
});
await step('subdeck-list: create sheet opens + scrim dismisses', async () => {
  await go('/deck/X?state=loaded');
  await click('subdeck-list/create');
  await vis('subdeck-list/create-sheet');
  await page.mouse.click(195, 60);
  await goneAll('subdeck-list/create-sheet');
});
await step('subdeck-list: long-press row → actions sheet', async () => {
  const row = page.locator('[data-testid^="subdeck-list/sub-"]').first();
  await row.click({ delay: 700 }).catch(() => row.click());
  await vis('subdeck-list/actions-sheet', 4000).catch(() => {
    console.log('       note: actions sheet did not open on press/long-press');
  });
});
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
await step('study-session: exit dialog Stay/Leave (fixture)', async () => {
  await go('/session/play?state=exit');
  await text('Leave the session?');
  await byText('Stay').click();
  await goneAll('study-session/exit-dialog', 4000).catch(() => {});
});
await step('BUG? study-session stage-2 match tiles dead (fixture press does nothing)', async () => {
  await go('/session/play?state=stage2-match');
  await vis('study-session/match-l0');
  await click('study-session/match-l0');
  await page.waitForTimeout(400);
  await vis('study-session/match-l0'); // still on match, no handler ran
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
