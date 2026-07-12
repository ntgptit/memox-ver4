#!/usr/bin/env node
// tool/parity/verify-parity.mjs — deterministic source ↔ runtime parity gate (no browser, no deps).
//
// Runtime model: the design system renders 100% from SOURCE. The app gallery
// (ui_kits/memox-app/index.html) and the component reference cards (components/*/*.card.html via
// components/_ds_runtime.js) transpile the base Mx* primitives + composites in-browser; there is
// NO compiled artifact (_ds_bundle.js is gone). So nothing can carry a stale compiled body, and
// the manifest is the only mirror to keep honest.
//
// Fails (exit 1) on any of:
//   A. manifest ↔ source          — a component in one but not the other, or a name/path mismatch
//   B. manifest token ↔ source     — a recorded token value ≠ its SCOPED source value (light/dark),
//                                     or a token carrying an unrecognised scope
//   C. gallery ↔ source            — a component with no source <script> tag, or a dead tag
//   D. no compiled bundle          — any file still referencing the retired _ds_bundle.js
// A source component add/remove/rename trips A+C until build-manifest + index.html are updated; a
// token value/scope edit trips B until build-manifest is re-run. Composite BODY edits render live
// and are covered by verify.mjs's report-freshness check.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scopedValues, isDarkScope, isLightScope, normValue as norm } from './lib/scoped-values.mjs';

const KIT = fileURLToPath(new URL('../../docs/design/MemoX Design System_v4/', import.meta.url));
const MANIFEST = join(KIT, '_ds_manifest.json');
const INDEX = join(KIT, 'ui_kits/memox-app/index.html');

const rel = (p) => p.replace(/\\/g, '/').replace(KIT.replace(/\\/g, '/'), '');

// ---- component source set (same rule as build-manifest.mjs) ----
function sourceComponents() {
  const roots = ['components', 'ui_kits/memox-app/_features', 'ui_kits/memox-app/_shared'];
  const out = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.jsx') && /^[A-Z]/.test(e.name)) out.push(rel(p));
    }
  };
  roots.forEach((r) => walk(join(KIT, r)));
  return out.filter((r) => !r.startsWith('ui_kits/memox-app/_features/') || r.includes('/components/'));
}

const failures = [];
const fail = (check, msg) => failures.push(`[${check}] ${msg}`);
const source = new Set(sourceComponents());
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

// ── A. manifest ↔ source ─────────────────────────────────────────────────────
const manifestPaths = new Set(manifest.components.map((c) => c.sourcePath));
for (const p of source) if (!manifestPaths.has(p)) fail('A', `source component missing from manifest: ${p}`);
for (const p of manifestPaths) if (!source.has(p)) fail('A', `dead manifest entry (no source file): ${p}`);
for (const c of manifest.components) if (c.name !== c.sourcePath.replace(/.*\//, '').replace(/\.jsx$/, '')) fail('A', `manifest name/path mismatch: ${c.name} ↔ ${c.sourcePath}`);

// ── B. manifest token values ↔ scoped source (light/dark), scope sanity ──────
let lightMismatch = 0, darkMismatch = 0, unknownScope = 0;
const cache = {};
for (const t of manifest.tokens || []) {
  if (!t.definedIn) continue;
  if (!existsSync(join(KIT, t.definedIn))) { fail('B', `token ${t.name} definedIn missing file: ${t.definedIn}`); continue; }
  const sv = (cache[t.definedIn] ??= scopedValues(join(KIT, t.definedIn)));
  let want;
  if (isDarkScope(t.scope)) want = sv.dark[t.name];
  else if (isLightScope(t.scope)) want = sv.light[t.name];
  else { unknownScope++; fail('B', `token ${t.name} has an unrecognised scope: ${JSON.stringify(t.scope)}`); continue; }
  if (want != null && norm(want) !== norm(t.value)) {
    (isDarkScope(t.scope) ? (darkMismatch++) : (lightMismatch++));
    fail('B', `${isDarkScope(t.scope) ? 'dark' : 'light'} token ${t.name}: manifest ${t.value} ≠ source ${want}`);
  }
}

// ── C. gallery ↔ source (every component has a source <script> tag; no dead tags) ─
const html = readFileSync(INDEX, 'utf8');
const tagSrcs = [...html.matchAll(/<script type="text\/babel-src" src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const tagPaths = new Set(tagSrcs.map((s) => rel(join(KIT, 'ui_kits/memox-app', s))));
for (const s of tagSrcs) if (!existsSync(join(KIT, 'ui_kits/memox-app', s))) fail('C', `dead gallery <script> tag (file missing): ${s}`);
for (const p of source) if (!tagPaths.has(p)) fail('C', `component not loaded from source in the gallery (no <script> tag): ${p}`);

// ── D. no compiled bundle — nothing may reference the retired _ds_bundle.js ───
function walkFiles(dir, exts, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'shots' || e.name === 'fonts' || e.name === 'uploads') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}
for (const f of walkFiles(KIT, ['.html', '.js', '.mjs', '.md', '.json'])) {
  if (/_ds_bundle\.js/.test(readFileSync(f, 'utf8'))) fail('D', `still references the retired _ds_bundle.js: ${rel(f)}`);
}

// ── E. legacy palette metadata — current guideline/card metadata must claim deep violet ──
// Deep violet is the canonical palette; the legacy Tokyo/NebulaFighter identity may survive only
// as an explicit historical note in readme.md / the audit, never in a guideline @dsCard subtitle
// or a manifest card. Scanned surfaces are metadata only (not body prose).
const LEGACY = /tokyo|nebulafighter|nebula\b|indigo primary|primary indigo|cyan accent|accent cyan|blue-grey|blue grey/i;
for (const f of walkFiles(join(KIT, 'guidelines'), ['.html'])) {
  const m = readFileSync(f, 'utf8').match(/@dsCard\b([^]*?)-->/);
  if (m && LEGACY.test(m[1])) fail('E', `guideline @dsCard metadata claims a legacy palette: ${rel(f)} — ${m[1].trim().slice(0, 90)}`);
}
for (const c of manifest.cards || []) {
  const meta = `${c.name || ''} ${c.subtitle || ''} ${c.group || ''}`;
  if (LEGACY.test(meta)) fail('E', `manifest card metadata claims a legacy palette: "${c.name}" — "${c.subtitle}"`);
}

// ── report ───────────────────────────────────────────────────────────────────
console.log('source ↔ runtime parity gate (no compiled bundle)\n');
console.log(`  source components:  ${source.size}`);
console.log(`  manifest entries:   ${manifest.components.length}`);
console.log(`  manifest tokens:    ${(manifest.tokens || []).length}  (light mismatch ${lightMismatch}, dark mismatch ${darkMismatch}, unknown scope ${unknownScope})`);
console.log(`  gallery src tags:   ${tagSrcs.length}`);
if (failures.length) {
  console.log(`\n✗ parity FAILED — ${failures.length} issue(s):`);
  for (const f of failures.slice(0, 40)) console.log('  · ' + f);
  if (failures.length > 40) console.log(`  … and ${failures.length - 40} more`);
  process.exit(1);
}
console.log('\n✓ parity PASSED — manifest (components + light/dark tokens) and gallery match source; no compiled bundle remains.');
