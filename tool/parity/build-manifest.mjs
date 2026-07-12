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

// Refresh each token's recorded VALUE from its source CSS (light / :root scope), so the
// manifest mirror never reports a stale palette (e.g. legacy Tokyo values after a migration).
// Names/kinds/definedIn are the frozen contract and are left untouched.
function lightScopeValues(cssPath) {
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const vals = {};
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1];
    if (/\[data-theme=['"]dark['"]\]/.test(sel)) continue; // light / :root only
    for (const d of m[2].matchAll(/(--memox-[a-z0-9-]+)\s*:\s*([^;]+);/g)) vals[d[1].trim()] = d[2].trim();
  }
  return vals;
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
if (Array.isArray(manifest.tokens)) {
  const cache = {};
  let refreshed = 0;
  for (const t of manifest.tokens) {
    if (!t.definedIn) continue;
    const vals = (cache[t.definedIn] ??= lightScopeValues(join(KIT, t.definedIn)));
    if (vals[t.name] != null && vals[t.name] !== t.value) { t.value = vals[t.name]; refreshed++; }
  }
  if (refreshed) console.log(`manifest tokens: refreshed ${refreshed} value(s) from source CSS`);
}
const prev = new Set(manifest.components.map((c) => c.sourcePath));
const next = new Set(components.map((c) => c.sourcePath));
const added = components.filter((c) => !prev.has(c.sourcePath)).map((c) => c.name);
const removed = [...prev].filter((p) => !next.has(p)).map((p) => basename(p, '.jsx'));

manifest.components = components;

// Drop gallery `cards` whose .card.html thumbnail no longer exists (deleted features).
let droppedCards = [];
if (Array.isArray(manifest.cards)) {
  const keep = manifest.cards.filter((c) => existsSync(join(KIT, c.path)));
  droppedCards = manifest.cards.filter((c) => !existsSync(join(KIT, c.path))).map((c) => c.path);
  manifest.cards = keep;
}

await writeFile(MANIFEST, JSON.stringify(manifest));

console.log(`manifest components: ${prev.size} → ${components.length}`);
if (added.length) console.log(`  + added:   ${added.join(', ')}`);
if (removed.length) console.log(`  - removed: ${removed.join(', ')}`);
if (droppedCards.length) console.log(`  - dropped cards: ${droppedCards.join(', ')}`);
