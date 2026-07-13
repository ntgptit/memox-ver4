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
  { name: 'shell-dashboard--loaded--light', path: '/', waitFor: 'text=Today' },
  { name: 'languages--list--light', path: '/settings/languages?state=list', waitFor: 'text=Korean → English' },
  { name: 'languages--empty--light', path: '/settings/languages?state=empty', waitFor: 'text=No language pairs yet' },
  { name: 'languages--add--light', path: '/settings/languages?state=add', waitFor: 'text=Language to learn' },
  { name: 'languages--list--dark', path: '/settings/languages?state=list&theme=dark', waitFor: 'text=Korean → English' },
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
