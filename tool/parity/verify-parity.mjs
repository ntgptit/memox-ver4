#!/usr/bin/env node
// tool/parity/verify-parity.mjs — deterministic source ↔ runtime parity gate (no browser, no deps).
//
// Runtime model after the deep-violet SSOT work (Strategy 1): the canonical app gallery
// (ui_kits/memox-app/index.html) renders EVERY component from SOURCE via the in-browser Babel
// loader — base Mx* primitives AND screen composites — so there is no compiled artifact in the
// canonical render path to drift. The only compiled artifact left, _ds_bundle.js, is pruned to
// the frozen base primitives and consumed solely by the component reference cards / template.
//
// This gate fails (exit 1) on any of:
//   A. manifest ↔ source       — a component in one but not the other, or a path mismatch
//   B. bundle ↔ source          — a dead bundle entry, a missing source file, or a STALE hash
//   C. gallery ↔ source          — a component with no source <script> tag, or a dead tag
//   D. canonical runtime purity  — index.html still referencing the compiled bundle
// A source component add/remove/rename trips A+C until build-manifest + index.html are updated;
// a base-primitive edit trips B until build-bundle is re-run. (Composite BODY edits need no
// artifact refresh — they render live — and are covered by verify.mjs's report-freshness check.)

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = fileURLToPath(new URL('../../docs/design/MemoX Design System_v4/', import.meta.url));
const MANIFEST = join(KIT, '_ds_manifest.json');
const BUNDLE = join(KIT, '_ds_bundle.js');
const INDEX = join(KIT, 'ui_kits/memox-app/index.html');

const hash12 = (p) => createHash('sha256').update(readFileSync(p, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);
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

// ── A. manifest ↔ source ─────────────────────────────────────────────────────
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const manifestPaths = new Set(manifest.components.map((c) => c.sourcePath));
for (const p of source) if (!manifestPaths.has(p)) fail('A', `source component missing from manifest: ${p}`);
for (const p of manifestPaths) if (!source.has(p)) fail('A', `dead manifest entry (no source file): ${p}`);
for (const c of manifest.components) if (c.name !== c.sourcePath.replace(/.*\//, '').replace(/\.jsx$/, '')) fail('A', `manifest name/path mismatch: ${c.name} ↔ ${c.sourcePath}`);

// ── B. bundle ↔ source (base primitives only, hashes fresh) ──────────────────
const bhead = readFileSync(BUNDLE, 'utf8').match(/^\/\* @ds-bundle: (\{[\s\S]*?\}) \*\//);
if (!bhead) fail('B', '_ds_bundle.js @ds-bundle header not found');
else {
  const bundle = JSON.parse(bhead[1]);
  for (const c of bundle.components) {
    if (!c.sourcePath.startsWith('components/')) fail('B', `non-base (dead) bundle entry: ${c.sourcePath}`);
    else if (!source.has(c.sourcePath)) fail('B', `bundle entry has no source file: ${c.sourcePath}`);
  }
  for (const [p, h] of Object.entries(bundle.sourceHashes || {})) {
    if (!existsSync(join(KIT, p))) { fail('B', `bundle sourceHash for missing file: ${p}`); continue; }
    const cur = hash12(join(KIT, p));
    if (cur !== h) fail('B', `STALE bundle hash for ${p}: bundle ${h} ≠ source ${cur} — run build-bundle.mjs`);
  }
}

// ── C. gallery ↔ source (every component has a source <script> tag; no dead tags) ─
const html = readFileSync(INDEX, 'utf8');
const tagSrcs = [...html.matchAll(/<script type="text\/babel-src" src="([^"]+)"><\/script>/g)].map((m) => m[1]);
// resolve each tag (relative to index.html dir) to a KIT-relative path
const tagPaths = new Set(tagSrcs.map((s) => rel(join(KIT, 'ui_kits/memox-app', s))));
for (const s of tagSrcs) {
  const abs = join(KIT, 'ui_kits/memox-app', s);
  if (!existsSync(abs)) fail('C', `dead gallery <script> tag (file missing): ${s}`);
}
for (const p of source) if (!tagPaths.has(p)) fail('C', `component not loaded from source in the gallery (no <script> tag): ${p}`);

// ── D. canonical runtime purity — gallery must not load the compiled bundle ──
if (/_ds_bundle\.js/.test(html)) fail('D', 'index.html still references _ds_bundle.js — the canonical runtime must render from source');

// ── report ───────────────────────────────────────────────────────────────────
console.log('source ↔ runtime parity gate\n');
console.log(`  source components:  ${source.size}`);
console.log(`  manifest entries:   ${manifest.components.length}`);
console.log(`  gallery src tags:   ${tagSrcs.length}`);
if (failures.length) {
  console.log(`\n✗ parity FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log('  · ' + f);
  process.exit(1);
}
console.log('\n✓ parity PASSED — manifest, bundle and gallery all match the current source (0 missing / dead / stale).');
