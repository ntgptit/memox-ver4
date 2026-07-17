// tool/parity/build-manifest.mjs — rebuild the `components` array of _ds_manifest.json
// from the kit's ACTUAL component files, so the manifest never drifts from source
// (deleted components drop out, new ones appear automatically).
//
// A "component" = a *.jsx whose basename is PascalCase (starts with an uppercase letter)
// under one of:
//   components/**                              (core Mx* families)
//   ui_kits/memox-app/_features/*/components/**  (per-screen composites)
//   ui_kits/memox-app/_shared/**               (cross-screen shared)
// Screen entry files (_features/<x>/<Screen>.jsx) and lowercase data/helper modules
// (libFixtures.jsx, kit-helpers.jsx) are intentionally excluded. Every other manifest
// field is preserved verbatim.
//
// Usage: node tool/parity/build-manifest.mjs

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scopedValues, isDarkScope, isLightScope } from './lib/scoped-values.mjs';

const KIT = fileURLToPath(new URL('../../docs/design/MemoX Design System_v4/', import.meta.url));
const MANIFEST = join(KIT, '_ds_manifest.json');
const ROOTS = ['components', 'ui_kits/memox-app/_features', 'ui_kits/memox-app/_shared'];

async function walk(dir) {
  let out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(await walk(p));
    else if (e.isFile() && e.name.endsWith('.jsx') && /^[A-Z]/.test(e.name)) out.push(p);
  }
  return out;
}

const abs = (await Promise.all(ROOTS.map((r) => walk(join(KIT, r))))).flat();
const rel = (p) => relative(KIT, p).split(sep).join('/');
const components = abs
  .map((p) => rel(p))
  // keep _features files only when they live in a components/ dir (drop screen entries)
  .filter((r) => !r.startsWith('ui_kits/memox-app/_features/') || r.includes('/components/'))
  .map((sourcePath) => ({ name: basename(sourcePath, '.jsx'), sourcePath }))
  .sort((a, b) => (a.sourcePath < b.sourcePath ? -1 : a.sourcePath > b.sourcePath ? 1 : 0));

// Refresh each token's recorded VALUE from its source CSS, HONOURING theme scope (shared
// scoped-values lib), so the manifest mirror never reports a stale palette and a dark-scoped
// token gets the DARK value — not the light one. Dark inherits light for tokens it does not
// override. Names/kinds/definedIn/scope are the frozen contract and are left untouched. An
// unrecognised scope is left unchanged with a warning (never silently given the light value);
// verify-parity.mjs then fails on it.
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
if (Array.isArray(manifest.tokens)) {
  const cache = {};
  let refreshed = 0, unknown = 0;
  for (const t of manifest.tokens) {
    if (!t.definedIn) continue;
    const sv = (cache[t.definedIn] ??= scopedValues(join(KIT, t.definedIn)));
    let vals;
    if (isDarkScope(t.scope)) vals = sv.dark;
    else if (isLightScope(t.scope)) vals = sv.light;
    else { unknown++; console.warn(`manifest tokens: unknown scope "${t.scope}" for ${t.name} — value left unchanged`); continue; }
    if (vals[t.name] != null && vals[t.name] !== t.value) { t.value = vals[t.name]; refreshed++; }
  }
  if (refreshed || unknown) console.log(`manifest tokens: refreshed ${refreshed} value(s) from scoped source CSS${unknown ? ` · ${unknown} unknown-scope left unchanged` : ''}`);

  // ADD any source token missing from the manifest, so additive tokens (e.g. new component tokens)
  // are mirrored: a light entry for every :root value, and a dark entry when [data-theme='dark']
  // genuinely overrides it. Kind is inferred from the source file. Keeps the manifest a COMPLETE
  // mirror so verify-parity's source↔manifest check can hold both directions.
  const kindOf = (f) => (/colors/.test(f) ? 'color' : /typography/.test(f) ? 'font' : /spacing/.test(f) ? 'spacing' : /radius/.test(f) ? 'radius' : /elevation/.test(f) ? 'shadow' : 'other');
  const tokenFiles = [...new Set(manifest.tokens.map((t) => t.definedIn).filter(Boolean))];
  const haveLight = new Set(manifest.tokens.filter((t) => isLightScope(t.scope)).map((t) => t.definedIn + '|' + t.name));
  const haveDark = new Set(manifest.tokens.filter((t) => isDarkScope(t.scope)).map((t) => t.definedIn + '|' + t.name));
  let added = 0;
  for (const f of tokenFiles) {
    const sv = (cache[f] ??= scopedValues(join(KIT, f)));
    for (const [name, value] of Object.entries(sv.light)) {
      if (!haveLight.has(f + '|' + name)) { manifest.tokens.push({ name, value, kind: kindOf(f), definedIn: f }); added++; }
    }
    for (const [name, value] of Object.entries(sv.dark)) {
      if (sv.light[name] === value) continue; // inherited, not overridden → no dark entry
      if (!haveDark.has(f + '|' + name)) { manifest.tokens.push({ name, value, kind: kindOf(f), definedIn: f, scope: "[data-theme='dark']" }); added++; }
    }
  }
  if (added) console.log(`manifest tokens: added ${added} missing source token entr(y|ies)`);
}
const prev = new Set(manifest.components.map((c) => c.sourcePath));
const next = new Set(components.map((c) => c.sourcePath));
const added = components.filter((c) => !prev.has(c.sourcePath)).map((c) => c.name);
const removed = [...prev].filter((p) => !next.has(p)).map((p) => basename(p, '.jsx'));

manifest.components = components;

// Drop gallery `cards` whose .card.html thumbnail no longer exists (deleted features), and
// REFRESH the metadata (name/subtitle/group/viewport) of the survivors from their canonical
// `@dsCard` comment, so a card subtitle can never drift from the source HTML (e.g. keep a stale
// legacy-palette description after a migration).
let droppedCards = [];
let refreshedCards = 0;
function dsCardAttrs(html) {
  const m = html.match(/@dsCard\b([^]*?)-->/);
  if (!m) return null;
  const attrs = {};
  for (const a of m[1].matchAll(/(\w+)="([^"]*)"/g)) attrs[a[1]] = a[2];
  return attrs;
}
if (Array.isArray(manifest.cards)) {
  droppedCards = manifest.cards.filter((c) => !existsSync(join(KIT, c.path))).map((c) => c.path);
  manifest.cards = manifest.cards.filter((c) => existsSync(join(KIT, c.path)));
  for (const c of manifest.cards) {
    const a = dsCardAttrs(readFileSync(join(KIT, c.path), 'utf8'));
    if (!a) continue;
    for (const k of ['name', 'subtitle', 'group', 'viewport']) {
      if (a[k] != null && a[k] !== c[k]) { c[k] = a[k]; refreshedCards++; }
    }
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest));

console.log(`manifest components: ${prev.size} → ${components.length}`);
if (added.length) console.log(`  + added:   ${added.join(', ')}`);
if (removed.length) console.log(`  - removed: ${removed.join(', ')}`);
if (droppedCards.length) console.log(`  - dropped cards: ${droppedCards.join(', ')}`);
if (refreshedCards) console.log(`  ~ refreshed ${refreshedCards} card metadata field(s) from @dsCard`);
