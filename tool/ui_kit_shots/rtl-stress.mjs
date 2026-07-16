#!/usr/bin/env node
// tool/ui_kit_shots/rtl-stress.mjs — KIT-41-06 combined worst-case stress.
//
// The regular shoot.mjs matrix covers width × font-scale × theme in LTR. This adds the ONE axis it
// doesn't: direction. It renders a few representative long-text screens under the COMBINED worst
// case — dir="rtl" + longest-content state + 200% font-scale, at the narrowest supported width — and
// checks that nothing becomes a blocker (content clipped by the frame, or an element overflowing its
// own box). The kit is portrait-scoped (SCOPE.md), so "landscape" from the checklist is represented
// by the width×height pressure of 320-wide × 200% text rather than a rotated frame.
//
// Output: tool/ui_kit_shots/out/rtl/<screen>--<state>--<theme>--rtl-fs2.png
//         tool/ui_kit_shots/out/rtl/report.json
// Exit: 1 if any combined-stress render shows a blocker, else 0.

import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { SCREENS } from './registry.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = normalize(join(HERE, '..', '..', 'docs', 'design', 'MemoX Design System_v4'));
const OUT = join(HERE, 'out', 'rtl');
const PORT = 5180;
const WIDTH = 320;          // narrowest supported phone — the tightest reflow
const FS = 2.0;             // 200% text scaling

const GROUP = Object.fromEntries(SCREENS.map((s) => [s.id, s.group]));
// Representative long-text / dense-content screens (the states that stress reflow the most).
const TARGETS = [
  { id: 'flashcard-list', state: 'long-text' },
  { id: 'guess-mode', state: 'long-text' },
  { id: 'study-result', state: 'many-wrong' },
  { id: 'subdeck-list', state: 'long-menu' },
];

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jsx': 'text/plain', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
const serve = (root) => createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const fp = normalize(join(root, p));
    if (!fp.startsWith(root)) { res.writeHead(403).end(); return; }
    res.writeHead(200, { 'content-type': MIME[extname(fp)] || 'application/octet-stream' });
    res.end(await readFile(fp));
  } catch { res.writeHead(404).end('not found'); }
});

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const server = serve(KIT).listen(PORT);
  const browser = await chromium.launch(process.env.MXH_CHROME ? { executablePath: process.env.MXH_CHROME } : {});
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto(`http://localhost:${PORT}/ui_kits/memox-app/index.html`);
  await page.waitForFunction(() => window.React && window.ReactDOM && window.Dashboard, null, { timeout: 30000 });
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'mxh-host'; host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999';
    document.body.appendChild(host);
    const cs = getComputedStyle(document.documentElement);
    window.__FONT_TOKENS = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']
      .map((k) => ['--memox-font-size-' + k, parseFloat(cs.getPropertyValue('--memox-font-size-' + k))]);
    window.__root = null;
  });
  await page.evaluate(async () => { try { await Promise.all(['20px', '24px', '40px'].map((s) => document.fonts.load(s + ' "Material Symbols Rounded"'))); await document.fonts.ready; } catch {} });

  const report = [];
  for (const t of TARGETS) {
    const g = GROUP[t.id];
    await page.waitForFunction((name) => !!window[name], g, { timeout: 20000 }).catch(() => {});
    for (const theme of ['light', 'dark']) {
      await page.evaluate(({ g, state, theme, w, fs }) => {
        const host = document.getElementById('mxh-host');
        // dir="rtl" on the frame flips the writing direction for the whole subtree.
        host.innerHTML = `<div id="mxh-frame" dir="rtl" data-theme="${theme}" style="width:${w}px;height:780px;position:relative;overflow:hidden;background:var(--memox-bg)"></div>`;
        const frame = document.getElementById('mxh-frame');
        for (const [tok, base] of window.__FONT_TOKENS) frame.style.setProperty(tok, (base * fs) + 'px');
        const Comp = window[g];
        if (window.__root) { try { window.__root.unmount(); } catch {} }
        window.__root = window.ReactDOM.createRoot(frame);
        window.__root.render(window.React.createElement(Comp, { state }));
      }, { g, state: t.state, theme, w: WIDTH, fs: FS });
      await page.waitForTimeout(300);

      const measured = await page.evaluate(() => {
        const frame = document.getElementById('mxh-frame');
        const fr = frame.getBoundingClientRect();
        const out = { hOverflow: [], vClipped: [] };
        const TH = 8;
        const inScroller = (el, axis) => { let n = el.parentElement; while (n && n !== frame) { const ov = getComputedStyle(n)['overflow' + axis]; if (ov === 'auto' || ov === 'scroll') return true; n = n.parentElement; } return false; };
        const label = (el) => el.getAttribute('data-mx-node') || (typeof el.className === 'string' && el.className.split(/\s+/)[0]) || el.tagName.toLowerCase();
        const rootEl = frame.firstElementChild;
        if (!rootEl || rootEl.querySelectorAll('*').length < 3) out.renderError = 'blank render';
        const boundary = [...frame.querySelectorAll('div')].find((d) => (d.textContent || '').trim().startsWith('⚠'));
        if (boundary) out.renderError = 'ErrorBoundary';
        frame.querySelectorAll('*').forEach((el) => {
          if (el.id === 'mxh-frame') return;
          const r = el.getBoundingClientRect();
          const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length);
          const past = Math.max(r.right - fr.right, fr.left - r.left);
          if (past > TH && hasText && !inScroller(el, 'X')) out.hOverflow.push({ node: label(el), extra: Math.round(past) });
          if (el.getAttribute('data-mx-node') && el.scrollWidth > el.clientWidth + TH && !['auto', 'scroll'].includes(getComputedStyle(el).overflowX)) out.hOverflow.push({ node: el.getAttribute('data-mx-node'), extra: el.scrollWidth - el.clientWidth });
        });
        const uniq = (a) => [...new Map(a.map((x) => [x.node, x])).values()].slice(0, 15);
        out.hOverflow = uniq(out.hOverflow);
        return out;
      });

      const name = `${t.id}--${t.state}--${theme}--rtl-fs2`;
      await page.locator('#mxh-frame').screenshot({ path: join(OUT, name + '.png') });
      const blocker = measured.renderError || measured.hOverflow.length;
      if (blocker) report.push({ shot: name, ...measured });
      console.log(`  ${name} — ${blocker ? '✗ ' + (measured.renderError || measured.hOverflow.map((x) => x.node + '+' + x.extra).join(', ')) : '✓ no blocker'}`);
    }
  }

  await writeFile(join(OUT, 'report.json'), JSON.stringify({ axis: 'dir=rtl + 200% font + longest-content state @ 320px', targets: TARGETS, pageErrors, blockers: report }, null, 2), 'utf-8');
  console.log(`\ndir=rtl + 200% combined stress: ${TARGETS.length * 2} renders · ${report.length} with blockers → out/rtl/report.json`);
  if (report.length) console.error('✗ combined RTL stress FOUND blockers'); else console.log('✓ combined RTL+long+200% stress — no blocker across all renders');
  await browser.close();
  server.close();
  process.exitCode = report.length ? 1 : 0;
};
run().catch((e) => { console.error(e); process.exit(1); });
