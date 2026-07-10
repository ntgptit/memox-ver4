#!/usr/bin/env node
// tool/ui_kit_shots/shoot.mjs — contract step 7-8 verification harness for the MemoX UI kit.
//
// Renders each screen/state at the contract's responsive matrix (device widths ×
// font-scales × light/dark), screenshots every combo, and auto-detects overflow /
// clipped important content. Reuses the already-loaded gallery bundle: after index.html
// mounts, every screen component + React are global, so we ReactDOM.render one screen
// into a sized frame per combo — no need to rebuild the script graph.
//
// Usage:
//   node tool/ui_kit_shots/shoot.mjs                 # all screens, default matrix
//   node tool/ui_kit_shots/shoot.mjs dashboard       # one screen
//   node tool/ui_kit_shots/shoot.mjs dashboard:loaded,empty   # specific states
//
// Output: tool/ui_kit_shots/out/<screen>--<state>--<theme>--w<W>--fs<FS>.png
//         tool/ui_kit_shots/out/report.json  (overflow findings)
// Exit: 0 always (it reports; it does not gate). Read report.json for defects.

import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = normalize(join(HERE, '..', '..', 'docs', 'design', 'MemoX Design System_v4'));
const OUT = join(HERE, 'out');
const PORT = 5178;

// contract step 7 matrix
const WIDTHS = [320, 360, 390, 430];
const FONT_SCALES = [1.0, 1.3, 1.5];
const THEMES = ['light', 'dark'];

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jsx': 'text/plain', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
const serve = (root) => createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const fp = normalize(join(root, p));
    if (!fp.startsWith(root)) { res.writeHead(403).end(); return; }
    const data = await readFile(fp);
    res.writeHead(200, { 'content-type': MIME[extname(fp)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404).end('not found'); }
});

// screen -> window global + full state list (mirrors index.html SCREENS)
const REGISTRY = {
  dashboard: { g: 'Dashboard', states: ['loaded', 'not-studied', 'goal-met', 'streak-reset', 'empty', 'loading'] },
  library: { g: 'Library', states: ['loaded', 'empty', 'loading', 'error'] },
  'deck-detail': { g: 'DeckDetail', states: ['loaded', 'no-results', 'empty', 'loading', 'error'] },
  'flashcard-editor': { g: 'FlashcardEditor', states: ['create', 'edit', 'validation', 'duplicate', 'multi-meaning', 'audio'] },
  'game-picker': { g: 'GamePicker', states: ['default', 'not-enough'] },
  'game-matching': { g: 'GameMatching', states: ['playing', 'complete'] },
  'game-mc': { g: 'GameMultipleChoice', states: ['waiting', 'complete'] },
  'game-recall': { g: 'GameRecall', states: ['before-reveal', 'complete'] },
  'game-typing': { g: 'GameTyping', states: ['waiting', 'typing', 'complete'] },
  review: { g: 'Review', states: ['browsing', 'end'] },
  player: { g: 'Player', states: ['playing', 'end'] },
  'study-result': { g: 'StudyResult', states: ['standard', 'many-wrong', 'finalize-error'] },
  search: { g: 'Search', states: ['empty-recent', 'results', 'no-results', 'loading'] },
  statistics: { g: 'Statistics', states: ['loaded', 'insufficient', 'loading'] },
  reminder: { g: 'Reminder', states: ['on', 'off'] },
  'account-sync': { g: 'AccountSync', states: ['signed-out', 'signed-in', 'conflict', 'offline'] },
  theme: { g: 'Theme', states: ['light', 'accent-size'] },
  import: { g: 'Import', states: ['source', 'mapping', 'done'] },
  export: { g: 'Export', states: ['config', 'exporting', 'done'] },
  drawer: { g: 'Drawer', states: ['open'] },
  'study-session': { g: 'StudySession', states: ['stage1-review', 'resume-error', 'answer-save-error'] },
  settings: { g: 'Settings', states: ['loaded'] },
};

function parseArgs() {
  const a = process.argv[2];
  if (!a) return Object.keys(REGISTRY).map((id) => ({ id, states: REGISTRY[id].states }));
  const [id, states] = a.split(':');
  if (!REGISTRY[id]) { console.error(`unknown screen "${id}". Known: ${Object.keys(REGISTRY).join(', ')}`); process.exit(2); }
  return [{ id, states: states ? states.split(',') : REGISTRY[id].states }];
}

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const server = serve(KIT).listen(PORT);
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.warn('page error:', e.message));

  await page.goto(`http://localhost:${PORT}/ui_kits/memox-app/index.html`);
  // wait until React + at least the dashboard global are ready (babel compiled)
  await page.waitForFunction(() => window.React && window.ReactDOM && window.Dashboard, null, { timeout: 30000 });

  // install a reusable isolated mount + font-scale helper
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'mxh-host';
    host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:transparent';
    document.body.appendChild(host);
    // capture base font tokens once
    const cs = getComputedStyle(document.documentElement);
    window.__FONT_TOKENS = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']
      .map((k) => ['--memox-font-size-' + k, parseFloat(cs.getPropertyValue('--memox-font-size-' + k))]);
    window.__root = null;
  });

  const targets = parseArgs();
  const report = [];
  for (const { id, states } of targets) {
    const g = REGISTRY[id].g;
    // wait for this screen's global to be compiled/registered before rendering it
    // (babel compiles the script graph async — the first combo used to blank otherwise)
    await page.waitForFunction((name) => !!window[name], g, { timeout: 20000 }).catch(() => {});
    for (const state of states) {
      for (const theme of THEMES) {
        for (const w of WIDTHS) {
          for (const fs of FONT_SCALES) {
            const findings = await page.evaluate(({ g, state, theme, w, fs }) => {
              const host = document.getElementById('mxh-host');
              // frame box at target width, phone height, clipped like a device
              host.innerHTML = `<div id="mxh-frame" data-theme="${theme}" style="width:${w}px;height:780px;position:relative;overflow:hidden;background:var(--memox-bg)"></div>`;
              const frame = document.getElementById('mxh-frame');
              // apply font-scale by overriding the font-size tokens on the frame
              for (const [tok, base] of window.__FONT_TOKENS) frame.style.setProperty(tok, (base * fs) + 'px');
              const Comp = window[g];
              if (!Comp) return { error: 'component not loaded: ' + g };
              if (window.__root) { try { window.__root.unmount(); } catch {} }
              window.__root = window.ReactDOM.createRoot(frame);
              window.__root.render(window.React.createElement(Comp, { state }));
              return null; // measured after paint below
            }, { g, state, theme, w, fs });

            await page.waitForTimeout(250); // let it paint (babel + fonts)

            const measured = await page.evaluate(() => {
              const frame = document.getElementById('mxh-frame');
              const fr = frame.getBoundingClientRect();
              const out = { hOverflow: [], clipped: [] };
              // render-health: only flag a TRUE blank (nothing mounted) or the gallery
              // ErrorBoundary fallback (its text starts with "⚠"). Overlays (drawer) that
              // have no .app scaffold are valid, so we don't require .app.
              const rootEl = frame.firstElementChild;
              const boundary = [...frame.querySelectorAll('div')].find((d) => (d.textContent || '').trim().startsWith('⚠'));
              if (!rootEl || rootEl.querySelectorAll('*').length < 3) out.renderError = 'blank render';
              else if (boundary) out.renderError = 'ErrorBoundary: ' + (boundary.textContent || '').slice(0, 80);

              // Only skip descendants of an INTENDED horizontal scroller (chip rows, etc.).
              // Do NOT skip hit-controls by class: their ::after hit overlay is a fixed 6-8px,
              // so a >8px threshold filters that artifact while still catching real text overflow.
              const TH = 8; // px — above the max ::after hit inset (chip/switch = 7/8)
              const inHScroller = (el) => {
                let n = el.parentElement;
                while (n && n !== frame) {
                  const ov = getComputedStyle(n).overflowX;
                  if (ov === 'auto' || ov === 'scroll') return true;
                  n = n.parentElement;
                }
                return false;
              };
              const label = (el) => el.getAttribute('data-mx-node') || (typeof el.className === 'string' && el.className.split(/\s+/)[0]) || el.tagName.toLowerCase();
              frame.querySelectorAll('*').forEach((el) => {
                if (el.id === 'mxh-frame' || inHScroller(el)) return;
                const s = getComputedStyle(el);
                const txt = (el.textContent || '').trim();
                // ellipsis actually truncating real text (title/label) — any element, not just data-mx-node
                if (s.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 4 && txt.length > 1 && el.children.length === 0) {
                  out.clipped.push({ node: label(el), text: txt.slice(0, 40), extra: el.scrollWidth - el.clientWidth });
                }
                // content clipped by the device frame (overflow:hidden -> invisible), real magnitude only.
                // Flag text-bearing leaves/controls (direct text node) — not big layout containers.
                const r = el.getBoundingClientRect();
                const past = Math.max(r.right - fr.right, fr.left - r.left);
                const hasDirectText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length);
                if (past > TH && hasDirectText) {
                  out.hOverflow.push({ node: label(el), extra: Math.round(past), edge: true });
                }
                // content overflows its own non-scroll box, real magnitude
                if (el.getAttribute('data-mx-node') && el.scrollWidth > el.clientWidth + TH && s.overflowX !== 'auto' && s.overflowX !== 'scroll') {
                  out.hOverflow.push({ node: el.getAttribute('data-mx-node'), extra: el.scrollWidth - el.clientWidth });
                }
              });
              // dedupe
              const uniq = (arr, key) => [...new Map(arr.map((x) => [key(x), x])).values()];
              out.hOverflow = uniq(out.hOverflow, (x) => x.node + (x.edge ? ':edge' : '')).slice(0, 20);
              out.clipped = uniq(out.clipped, (x) => x.node).slice(0, 20);
              return out;
            });

            const name = `${id}--${state}--${theme}--w${w}--fs${String(fs).replace('.', '_')}`;
            await page.locator('#mxh-frame').screenshot({ path: join(OUT, name + '.png') });
            const hasIssue = measured.hOverflow.length || measured.clipped.length || measured.renderError;
            if (hasIssue) report.push({ shot: name, ...measured });
            if (findings?.error) report.push({ shot: name, error: findings.error });
          }
        }
      }
    }
    console.log(`shot ${id}: done`);
  }

  await writeFile(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  const combos = targets.reduce((n, t) => n + t.states.length * THEMES.length * WIDTHS.length * FONT_SCALES.length, 0);
  console.log(`\n${combos} combos shot · ${report.length} with overflow/clip findings → out/report.json`);
  await browser.close();
  server.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
