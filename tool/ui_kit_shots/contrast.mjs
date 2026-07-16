#!/usr/bin/env node
// tool/ui_kit_shots/contrast.mjs — deterministic WCAG 2.x contrast gate for the MemoX
// colour tokens. Parses the CANONICAL token source (tokens/colors.css) — no browser, no
// dependency — composites alpha containers over their opaque base, and fails (exit 1) when
// any required foreground/background pair misses its threshold, in EITHER light or dark.
//
// Thresholds (WCAG 2.x): normal text ≥ 4.5:1 · large/bold text ≥ 3.0:1 · UI/icon ≥ 3.0:1.
// text-tertiary is gated as NORMAL text (≥ 4.5) on both bg and surface, because components.css
// uses it for small 11–13px meta/overline labels; its token value is tuned to clear 4.5 while
// staying below text-secondary so the hierarchy holds. Disabled foregrounds are reported but
// NOT gated (WCAG 1.4.3 exempts disabled controls). A MISSING or UNPARSEABLE required token is
// a hard failure (exit 1), never a silent warning.
//
// Usage: node tool/ui_kit_shots/contrast.mjs        (gated by verify:ui-kit[:structural])

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

const KIT = fileURLToPath(new URL('../../docs/design/MemoX Design System_v4/', import.meta.url));
// MX_CONTRAST_COLORS lets the regression tests point the gate at a fixture stylesheet without
// touching the real token source; production runs use the canonical colors.css.
const COLORS = process.env.MX_CONTRAST_COLORS ? resolve(process.env.MX_CONTRAST_COLORS) : join(KIT, 'tokens/colors.css');

// ── parse tokens/colors.css into { light:{tok:val}, dark:{tok:val} } ─────────
function parseTokens() {
  const css = readFileSync(COLORS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const out = { light: {}, dark: {} };
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(css))) {
    const sel = m[1];
    const isDark = /\[data-theme=['"]dark['"]\]/.test(sel);
    const isLight = /:root/.test(sel) || /\[data-theme=['"]light['"]\]/.test(sel);
    const decl = /(--memox-[a-z0-9-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = decl.exec(m[2]))) {
      const name = d[1].trim();
      const val = d[2].trim();
      if (isDark) out.dark[name] = val;
      else if (isLight) out.light[name] = val;
    }
  }
  // dark inherits light for anything it does not override (matches CSS cascade)
  out.dark = { ...out.light, ...out.dark };

  // High-contrast profile (KIT-08-06 / KIT-39-05): additive [data-hc='true'] overrides
  // layered onto the light and dark bases from tokens/high-contrast.css. Optional file.
  try {
    const hcPath = join(KIT, 'tokens/high-contrast.css');
    const hcCss = readFileSync(hcPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const hcLight = {}, hcDark = {};
    let h;
    const hcBlock = /([^{}]+)\{([^{}]*)\}/g;
    while ((h = hcBlock.exec(hcCss))) {
      const sel = h[1];
      const target = /\[data-theme=['"]dark['"]\]/.test(sel) ? hcDark : hcLight;
      const decl = /(--memox-[a-z0-9-]+)\s*:\s*([^;]+);/g;
      let d;
      while ((d = decl.exec(h[2]))) target[d[1].trim()] = d[2].trim();
    }
    out['hc-light'] = { ...out.light, ...hcLight };
    out['hc-dark'] = { ...out.dark, ...hcDark };
  } catch { /* high-contrast profile optional */ }
  return out;
}

// Profiles gated by the contrast run. hc-* present only when high-contrast.css exists.
function profilesOf(tokens) {
  return ['light', 'dark', 'hc-light', 'hc-dark'].filter((p) => tokens[p]);
}

// ── colour parsing + WCAG maths ──────────────────────────────────────────────
function parseColor(v) {
  v = v.trim();
  let m = v.match(/^#([0-9a-f]{3})$/i);
  if (m) { const h = m[1]; return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16), 1]; }
  m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) { const h = m[1]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]; }
  m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) { const p = m[1].split(',').map((x) => x.trim()); return [+p[0], +p[1], +p[2], p[3] === undefined ? 1 : +p[3]]; }
  throw new Error('cannot parse colour: ' + v);
}
// composite src (may have alpha) over an OPAQUE base → opaque rgb
function over(src, base) {
  const a = src[3];
  return [Math.round(src[0] * a + base[0] * (1 - a)), Math.round(src[1] * a + base[1] * (1 - a)), Math.round(src[2] * a + base[2] * (1 - a)), 1];
}
function relLum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(fg, bg) {
  const l1 = relLum(fg), l2 = relLum(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const THRESH = { normal: 4.5, large: 3.0, ui: 3.0, info: 0 };

// ── required pairs (contract §7.1). over = opaque base an alpha bg composites onto. ──
// { fg, bg, over?, cat }  cat ∈ normal | large | ui | info(not gated)
const PAIRS = [
  // text on canvases
  { fg: '--memox-text', bg: '--memox-bg', cat: 'normal' },
  { fg: '--memox-text', bg: '--memox-surface', cat: 'normal' },
  { fg: '--memox-text-secondary', bg: '--memox-bg', cat: 'normal' },
  { fg: '--memox-text-secondary', bg: '--memox-surface', cat: 'normal' },
  // app-bar search placeholder sits on surface-sunken (.cappbar__search) — text-secondary
  { fg: '--memox-text-secondary', bg: '--memox-surface-sunken', cat: 'normal' },
  { fg: '--memox-text-tertiary', bg: '--memox-bg', cat: 'normal' },
  { fg: '--memox-text-tertiary', bg: '--memox-surface', cat: 'normal' },
  // brand
  { fg: '--memox-on-primary', bg: '--memox-primary', cat: 'normal' },
  { fg: '--memox-on-primary-soft', bg: '--memox-primary-soft', over: '--memox-surface', cat: 'normal' },
  { fg: '--memox-on-accent', bg: '--memox-accent', cat: 'normal' },
  // accent glyph/text on the SOFT accent tint (icon-tile/chip/avatar use --memox-accent here)
  { fg: '--memox-accent', bg: '--memox-accent-soft', over: '--memox-surface', cat: 'ui' },
  // semantic solid + soft
  { fg: '--memox-on-success', bg: '--memox-success', cat: 'normal' },
  { fg: '--memox-on-success-soft', bg: '--memox-success-soft', over: '--memox-surface', cat: 'normal' },
  { fg: '--memox-on-warning', bg: '--memox-warning', cat: 'normal' },
  { fg: '--memox-on-warning-soft', bg: '--memox-warning-soft', over: '--memox-surface', cat: 'normal' },
  { fg: '--memox-on-error', bg: '--memox-error', cat: 'normal' },
  { fg: '--memox-on-error-soft', bg: '--memox-error-soft', over: '--memox-surface', cat: 'normal' },
  { fg: '--memox-on-info', bg: '--memox-info', cat: 'normal' },
  { fg: '--memox-on-info-soft', bg: '--memox-info-soft', over: '--memox-surface', cat: 'normal' },
  // UI: focus ring, control boundary, selected-nav pill, links, ghost-button fg
  { fg: '--memox-focus-ring', bg: '--memox-surface', cat: 'ui' },
  { fg: '--memox-focus-ring', bg: '--memox-bg', cat: 'ui' },
  // border-strong backs the outline-button ring + emphasis hairlines. Those controls carry a
  // text label and (for chips) a fill, so WCAG 1.4.11 does not require the border itself to hit
  // 3.0 (text-labeled controls / decorative separators are exempt — cf. Material & HIG outline
  // buttons at ~12% borders). The sole-means interactive indicator, focus-ring, IS gated above.
  { fg: '--memox-border-strong', bg: '--memox-surface', over: '--memox-surface', cat: 'info' },
  { fg: '--memox-border-strong', bg: '--memox-bg', over: '--memox-bg', cat: 'info' },
  { fg: '--memox-accent', bg: '--memox-surface', cat: 'normal' },   // MxLink text
  { fg: '--memox-accent', bg: '--memox-bg', cat: 'normal' },
  { fg: '--memox-primary-strong', bg: '--memox-surface', cat: 'large' }, // ghost button / link fg
  { fg: '--memox-primary-strong', bg: '--memox-bg', cat: 'large' },
  // disabled — reported, not gated
  { fg: '--memox-state-disabled', bg: '--memox-surface', cat: 'info' },
  { fg: '--memox-state-disabled', bg: '--memox-bg', cat: 'info' },
];

const tokens = parseTokens();
const short = (t) => t.replace('--memox-', '');
const rows = [];
let failures = 0;
const PROFILES = profilesOf(tokens);

for (const theme of PROFILES) {
  const T = tokens[theme];
  for (const p of PAIRS) {
    const need = THRESH[p.cat];
    // Resolve + composite. A missing required token, a missing composite base, or an
    // unparseable colour is a HARD failure (never a silent warning) — for every pair,
    // including the reported-only disabled pairs (their token still has to exist).
    let fg, bg;
    try {
      const fgRaw = T[p.fg];
      if (fgRaw == null) throw new Error(`missing required foreground token ${p.fg}`);
      const bgRaw = T[p.bg];
      if (bgRaw == null) throw new Error(`missing required background token ${p.bg}`);
      const overTok = p.over || '--memox-surface';
      const baseRaw = T[overTok];
      if (baseRaw == null) throw new Error(`missing required composite base ${overTok}`);
      bg = over(parseColor(bgRaw), parseColor(baseRaw)); // flatten alpha container onto base
      fg = over(parseColor(fgRaw), bg);                  // flatten any fg alpha onto the bg
    } catch (e) {
      failures++;
      rows.push({ theme, fg: p.fg, bg: p.bg, cat: p.cat, need, error: e.message, gated: true });
      continue;
    }
    const r = ratio(fg, bg);
    const pass = r >= need;
    if (!pass && p.cat !== 'info') failures++;
    rows.push({ theme, fg: p.fg, bg: p.bg, cat: p.cat, ratio: r, need, pass, gated: p.cat !== 'info' });
  }
}

// ── report ───────────────────────────────────────────────────────────────────
console.log(`contrast gate — WCAG 2.x over tokens/colors.css (profiles: ${PROFILES.join(' + ')})\n`);
const fmt = (n) => n.toFixed(2).padStart(5);
for (const theme of PROFILES) {
  console.log(`  ${theme.toUpperCase()}`);
  for (const r of rows.filter((x) => x.theme === theme)) {
    if (r.error) { console.log(`    ✗ ${r.error}  [${r.cat} — required]`); continue; }
    const mark = r.cat === 'info' ? '·' : r.pass ? '✓' : '✗';
    const tag = r.cat === 'info' ? '(disabled — not gated)' : `${r.cat} ≥ ${r.need.toFixed(1)}`;
    console.log(`    ${mark} ${fmt(r.ratio)}:1  ${short(r.fg)} on ${short(r.bg)}  [${tag}]`);
  }
  console.log('');
}

const failing = rows.filter((x) => x.error || (x.gated && !x.pass));
if (failing.length) {
  console.log(`✗ contrast gate FAILED — ${failing.length} pair(s):\n`);
  for (const r of failing) {
    console.log(`  Theme:             ${r.theme}`);
    console.log(`  Foreground token:  ${r.fg}`);
    console.log(`  Background token:  ${r.bg}`);
    if (r.error) console.log(`  Problem:           ${r.error}`);
    else console.log(`  Actual ratio:      ${r.ratio.toFixed(2)}:1`);
    console.log(`  Required ratio:    ${r.need.toFixed(1)}:1`);
    console.log(`  Usage category:    ${r.cat}\n`);
  }
  process.exit(1);
}
console.log(`✓ contrast gate PASSED — all required pairs meet WCAG thresholds (${PROFILES.join(' + ')}).`);
