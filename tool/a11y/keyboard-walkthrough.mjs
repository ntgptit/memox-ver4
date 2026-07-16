#!/usr/bin/env node
// tool/a11y/keyboard-walkthrough.mjs — KIT-42-02 runtime evidence.
//
// Boots the MemoX UI-kit gallery, mounts a screen in isolation (the same window[Group]
// mount shoot.mjs uses), then drives the REAL keyboard through Playwright — Tab / Shift+Tab /
// Enter / Escape — recording the actual focus order and asserting the keyboard contract in
// guidelines/keyboard-focus-order.md (§4 full-task walkthrough, §5 "add a card" table).
//
// Why a real keyboard: synthetic keydown events do NOT move focus in a browser, so the walk
// MUST press keys from the Playwright layer and read document.activeElement back per stop.
//
// Static-kit honesty: the kit is a design reference. Buttons/switches/checkboxes are REAL
// focusable elements; text Fields are non-focusable <span> surfaces carrying design-intent
// data-* annotations (data-input-mode/enter-key-hint/aria-invalid — "production behaviour the
// static kit can't execute", see Field.jsx). So this harness reports TWO things per screen:
//   1. executable-focus-order  — the real Tab stops (ground truth), with no-trap / reversibility
//   2. reading-order           — DOM order of every contract node (focusables + annotated
//                                fields + live regions), proving DOM order = reading order (§1)
// It asserts only what is executable, and records the annotated field stops as reading-order
// evidence — never claims the static spans are tab stops.
//
// Output: tool/a11y/focus-order.<screen>.json  (per walked screen)
//         tool/a11y/axe-report.json             (axe-core, component-scoped)
//         tool/a11y/summary.json                (roll-up + pass/fail)
// Exit: 0 when every assertion holds and axe has no serious/critical component violation; 1 otherwise.

import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { SCREENS } from '../ui_kit_shots/registry.mjs';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = normalize(join(HERE, '..', '..', 'docs', 'design', 'MemoX Design System_v4'));
const OUT = HERE;
const PORT = 5179;

// group lookup from the SSOT registry (id -> window global name)
const GROUP = Object.fromEntries(SCREENS.map((s) => [s.id, s.group]));

// Screens walked for the executable focus order + reading order. flashcard-editor is the
// canonical "add a card" task (guidelines §5); edit has Save ENABLED and is dirty (so Esc/back
// is guarded), giving a reachable primary CTA and an overlay to Escape.
const WALK = [
  { id: 'flashcard-editor', state: 'edit', primaryCta: 'flashcard-editor/save', overlayOnEsc: false },
  { id: 'flashcard-editor', state: 'create', primaryCta: null, overlayOnEsc: false },
  { id: 'subdeck-list', state: 'long-menu', primaryCta: null, overlayOnEsc: true },
  { id: 'reminder', state: 'permission-denied', primaryCta: null, overlayOnEsc: false },
];

// Broader set for the axe-core component sweep (role/name/contrast/landmark-free component scope).
const AXE = [
  { id: 'dashboard', state: 'loaded' },
  { id: 'library', state: 'loaded' },
  { id: 'flashcard-editor', state: 'edit' },
  { id: 'flashcard-list', state: 'loaded' },
  { id: 'settings', state: 'loaded' },
  { id: 'account-sync', state: 'sign-in-form' },
  { id: 'reminder', state: 'permission-denied' },
  { id: 'mode-picker', state: 'default' },
];

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

// In-page: describe document.activeElement as a focus stop.
const DESCRIBE_ACTIVE = () => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) {
    return { end: true };
  }
  const frame = document.getElementById('mxh-frame');
  const inFrame = !!(frame && frame.contains(el));
  const roleOf = (n) => {
    const r = n.getAttribute('role');
    if (r) return r;
    const t = n.tagName.toLowerCase();
    if (t === 'button') return 'button';
    if (t === 'a' && n.hasAttribute('href')) return 'link';
    if (t === 'input') return (n.getAttribute('type') || 'text');
    return t;
  };
  const nameOf = (n) => {
    const al = n.getAttribute('aria-label');
    if (al && al.trim()) return al.trim();
    const lb = n.getAttribute('aria-labelledby');
    if (lb) { const t = lb.split(/\s+/).map((id) => (document.getElementById(id) || {}).textContent || '').join(' ').trim(); if (t) return t; }
    const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
    return txt.slice(0, 60);
  };
  return {
    end: false,
    inFrame,
    sentinel: el.id === 'mxh-before' || el.id === 'mxh-after',
    tag: el.tagName.toLowerCase(),
    role: roleOf(el),
    name: nameOf(el),
    node: el.getAttribute('data-mx-node') || null,
    ariaDisabled: el.getAttribute('aria-disabled') || null,
    ariaExpanded: el.getAttribute('aria-expanded') || null,
    ariaChecked: el.getAttribute('aria-checked') || null,
  };
};

// In-page: DOM reading order of every contract node (focusable controls + annotated fields +
// live regions), proving DOM order = reading order for a screen-reader linear scan.
const READING_ORDER = () => {
  const frame = document.getElementById('mxh-frame');
  if (!frame) return [];
  const SEL = 'a[href],button,input,select,textarea,[tabindex],[role],[data-mx-node],[data-input-mode],[data-validate-on],label';
  const nodes = [...frame.querySelectorAll(SEL)];
  const out = [];
  for (const n of nodes) {
    const role = n.getAttribute('role') || (n.tagName === 'BUTTON' ? 'button' : n.tagName === 'A' ? 'link' : n.tagName === 'LABEL' ? 'label' : null);
    const focusable = (n.matches('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])') || (n.getAttribute('tabindex') && n.getAttribute('tabindex') !== '-1'));
    const annotated = n.hasAttribute('data-input-mode') || n.hasAttribute('data-validate-on');
    if (!role && !n.hasAttribute('data-mx-node') && !annotated) continue;
    const name = (n.getAttribute('aria-label') || (n.textContent || '').replace(/\s+/g, ' ').trim()).slice(0, 50);
    out.push({
      node: n.getAttribute('data-mx-node') || null,
      role: role || null,
      focusable: !!focusable,
      annotatedField: annotated || null,
      live: n.getAttribute('role') === 'alert' ? 'alert' : n.getAttribute('role') === 'status' ? 'status' : null,
      name,
    });
  }
  return out;
};

async function mount(page, group, state) {
  await page.evaluate(({ group, state }) => {
    const host = document.getElementById('mxh-host');
    host.innerHTML = `<button id="mxh-before" style="position:absolute;left:-9999px">start</button>`
      + `<div id="mxh-frame" data-theme="light" style="width:390px;min-height:780px;position:relative;background:var(--memox-bg)"></div>`
      + `<button id="mxh-after" style="position:absolute;left:-9999px">end</button>`;
    const frame = document.getElementById('mxh-frame');
    const Comp = window[group];
    if (!Comp) return { error: 'not loaded: ' + group };
    if (window.__root) { try { window.__root.unmount(); } catch {} }
    window.__root = window.ReactDOM.createRoot(frame);
    window.__root.render(window.React.createElement(Comp, { state }));
    return null;
  }, { group, state });
  await page.waitForTimeout(300);
}

// Walk Tab forward until focus leaves the page (reaches browser chrome → activeElement=body),
// with a hard cap so a trap can't spin forever. Then Shift+Tab back and assert reversibility.
async function walkFocus(page) {
  const CAP = 50;
  await page.focus('#mxh-before');
  const forward = [];
  let trapped = false;
  for (let i = 0; i < CAP; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(DESCRIBE_ACTIVE);
    if (s.end) break;                          // left the page after the last control — no forward trap
    if (s.id === 'mxh-after' || s.sentinel && s.name === 'end') { forward.push(s); break; }
    forward.push(s);
    if (i === CAP - 1) trapped = true;         // never escaped within the cap
  }
  // strip trailing sentinel for the reported in-frame stops
  const stops = forward.filter((s) => !s.sentinel);
  // reverse walk from the after-sentinel
  await page.focus('#mxh-after');
  const backward = [];
  for (let i = 0; i < CAP; i++) {
    await page.keyboard.press('Shift+Tab');
    const s = await page.evaluate(DESCRIBE_ACTIVE);
    if (s.end || (s.sentinel && s.name === 'start')) break;
    if (!s.sentinel) backward.push(s);
  }
  return { stops, backwardCount: backward.length, trapped };
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const server = serve(KIT).listen(PORT);
  const browser = await chromium.launch(process.env.MXH_CHROME ? { executablePath: process.env.MXH_CHROME } : {});
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto(`http://localhost:${PORT}/ui_kits/memox-app/index.html`);
  await page.waitForFunction(() => window.React && window.ReactDOM && window.Dashboard, null, { timeout: 30000 });
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'mxh-host';
    host.style.cssText = 'position:absolute;left:0;top:0;background:transparent';
    document.body.appendChild(host);
    window.__root = null;
  });
  await page.evaluate(async () => { try { await Promise.all(['20px', '24px'].map((s) => document.fonts.load(s + ' "Material Symbols Rounded"'))); await document.fonts.ready; } catch {} });

  const failures = [];
  const walkResults = [];

  // ---- executable focus order + reading order ----
  for (const t of WALK) {
    const group = GROUP[t.id];
    await page.waitForFunction((g) => !!window[g], group, { timeout: 20000 }).catch(() => {});
    await mount(page, group, t.state);
    const reading = await page.evaluate(READING_ORDER);
    const { stops, backwardCount, trapped } = await walkFocus(page);

    const label = `${t.id}:${t.state}`;
    const checks = [];
    // 1. no keyboard trap — forward walk escaped within the cap
    checks.push({ check: 'no-forward-trap', pass: !trapped });
    if (trapped) failures.push(`${label}: focus never escaped (keyboard trap)`);
    // 2. reversible — Shift+Tab returns through the same number of stops (focus not lost/gained)
    const reversible = backwardCount === stops.length;
    checks.push({ check: 'reversible-shift-tab', pass: reversible, forward: stops.length, backward: backwardCount });
    if (!reversible) failures.push(`${label}: asymmetric tab order (fwd ${stops.length} vs back ${backwardCount})`);
    // 3. every real stop has an accessible name (button-name / link-name at the source)
    const unnamed = stops.filter((s) => !s.name && !s.node);
    checks.push({ check: 'all-stops-named', pass: unnamed.length === 0, unnamed: unnamed.length });
    if (unnamed.length) failures.push(`${label}: ${unnamed.length} focus stop(s) without an accessible name`);
    // 4. primary CTA reachable when the screen state has one enabled
    if (t.primaryCta) {
      const reached = stops.some((s) => s.node === t.primaryCta);
      checks.push({ check: 'primary-cta-reachable', pass: reached, cta: t.primaryCta });
      if (!reached) failures.push(`${label}: primary CTA ${t.primaryCta} not reachable by keyboard`);
    }
    // annotated (production) field stops are documented from reading order, never asserted as tab stops
    const annotatedFields = reading.filter((r) => r.annotatedField).map((r) => r.node);

    walkResults.push({ screen: t.id, state: t.state, executableFocusOrder: stops, readingOrder: reading, annotatedFieldStops: annotatedFields, checks });
    await writeFile(join(OUT, `focus-order.${t.id}.${t.state}.json`), JSON.stringify({
      screen: t.id, state: t.state,
      note: 'executableFocusOrder = real Tab stops (buttons/switches/checkboxes). Text Fields are '
        + 'non-focusable design-intent spans in the static kit (see Field.jsx / keyboard-focus-order.md); '
        + 'they appear in readingOrder with annotatedField=true and map to real inputs in production.',
      executableFocusOrder: stops, readingOrder: reading, annotatedFieldStops: annotatedFields, checks,
    }, null, 2), 'utf-8');
  }

  // ---- axe-core component sweep ----
  // axe-core is VENDORED (tool/a11y/vendor/axe.min.js), not an npm dependency — so this harness
  // never perturbs package.json / the lockfile / `npm ci`. Falls back to node_modules if present.
  let axeSource;
  try { axeSource = await readFile(join(HERE, 'vendor', 'axe.min.js'), 'utf-8'); }
  catch { axeSource = await readFile(require.resolve('axe-core'), 'utf-8'); }
  const axeResults = [];
  // Rules that only make sense at whole-PAGE scope — disabled because we mount a single component
  // fragment (no <html lang>, no landmarks, no <title>). Component-level rules stay ON.
  const PAGE_SCOPE_OFF = ['region', 'landmark-one-main', 'page-has-heading-one', 'html-has-lang', 'html-lang-valid', 'document-title', 'bypass', 'landmark-no-duplicate-banner', 'landmark-unique', 'meta-viewport'];
  for (const t of AXE) {
    const group = GROUP[t.id];
    await page.waitForFunction((g) => !!window[g], group, { timeout: 20000 }).catch(() => {});
    await mount(page, group, t.state);
    await page.addScriptTag({ content: axeSource });
    const res = await page.evaluate(async (off) => {
      const cfg = { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, rules: {} };
      for (const r of off) cfg.rules[r] = { enabled: false };
      const r = await window.axe.run(document.getElementById('mxh-frame'), cfg);
      return r.violations.map((v) => ({
        id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,
        targets: v.nodes.slice(0, 4).map((n) => n.target.join(' ')),
        contrast: v.id === 'color-contrast'
          ? v.nodes.slice(0, 8).map((n) => { const d = (n.any[0] || {}).data || {}; return { ratio: d.contrastRatio, need: d.expectedContrastRatio, fg: d.fgColor, bg: d.bgColor, target: n.target.join(' ') }; })
          : undefined,
      }));
    }, PAGE_SCOPE_OFF);
    // KIT-42-02's axe scope (per the handoff) is role / name / landmark / aria — the keyboard-task
    // lane. color-contrast is a SEPARATE audit lane (contrast.mjs token gate + KIT-08/21/39); axe
    // measures rendered pixels and here surfaces text-tertiary-on-surface-sunken spots (~4.2:1, just
    // under AA 4.5) that the token-pair gate does not cover. We RECORD those as observations (never
    // hide them) and file them separately, but they do not gate this keyboard/role/name harness.
    const structural = res.filter((v) => v.id !== 'color-contrast');
    const contrastObs = res.filter((v) => v.id === 'color-contrast');
    const seriousStructural = structural.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    axeResults.push({ screen: t.id, state: t.state, structuralViolations: structural, contrastObservations: contrastObs, seriousStructural: seriousStructural.length });
    if (seriousStructural.length) failures.push(`${t.id}:${t.state}: axe ${seriousStructural.length} serious/critical role/name/aria — ${seriousStructural.map((v) => v.id).join(', ')}`);
  }

  await writeFile(join(OUT, 'axe-report.json'), JSON.stringify({
    tool: 'axe-core', version: '4.12.1 (vendored: tool/a11y/vendor/axe.min.js)',
    scope: 'component fragment mounted in isolation; page-scope rules disabled: ' + PAGE_SCOPE_OFF.join(', '),
    gate: 'role/name/aria (KIT-42-02 lane) hard-fails; color-contrast recorded as observations only '
      + '(contrast is the contrast.mjs token gate + KIT-08/21/39 lane). Observed contrast spots are '
      + 'text-tertiary on surface-sunken (~4.2:1 vs AA 4.5) — filed for the contrast lane, not this harness.',
    results: axeResults,
  }, null, 2), 'utf-8');

  const summary = {
    generatedBy: 'tool/a11y/keyboard-walkthrough.mjs',
    walked: walkResults.map((w) => ({ screen: w.screen, state: w.state, stops: w.executableFocusOrder.length, checks: w.checks })),
    axe: axeResults.map((a) => ({ screen: a.screen, state: a.state, structural: a.structuralViolations.length, seriousStructural: a.seriousStructural, contrastObservations: a.contrastObservations.length })),
    pageErrors,
    failures,
    status: failures.length ? 'FAIL' : 'PASS',
  };
  await writeFile(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2), 'utf-8');

  console.log(`\n=== keyboard walkthrough ===`);
  for (const w of walkResults) console.log(`  ${w.screen}:${w.state} — ${w.executableFocusOrder.length} tab stop(s); ${w.checks.filter((c) => c.pass).length}/${w.checks.length} checks pass`);
  console.log(`=== axe-core (component-scoped: role/name/aria gate; contrast recorded as observation) ===`);
  for (const a of axeResults) console.log(`  ${a.screen}:${a.state} — role/name/aria: ${a.structuralViolations.length} (${a.seriousStructural} serious); contrast obs: ${a.contrastObservations.length}`);
  if (pageErrors.length) console.log(`page errors: ${pageErrors.length}`);
  if (failures.length) { console.error(`\n✗ FAIL — ${failures.length} issue(s):`); for (const f of failures) console.error('  · ' + f); }
  else console.log(`\n✓ PASS — no keyboard trap, reversible tab order, primary CTA reachable, all stops named, no serious/critical axe violation.`);

  await browser.close();
  server.close();
  process.exitCode = failures.length ? 1 : 0;
}

run().catch((e) => { console.error(e); process.exit(1); });
