// tool/parity/build-bundle.mjs — deterministic, dependency-free rebuild of _ds_bundle.js.
//
// Context: the canonical app gallery (ui_kits/memox-app/index.html) now renders EVERY screen
// composite from SOURCE (in-browser Babel), so the bundle is no longer the canonical runtime.
// The only remaining consumers are the component reference cards (components/*/*.card.html) and
// the dashboard template (templates/memox-dashboard/ds-base.js), which use ONLY the base Mx*
// primitives. This builder prunes the bundle to exactly those base primitives — dropping every
// stale/dead composite block the external design-sync-cli left behind — and refreshes the
// @ds-bundle header (components + sha256-LF-12 sourceHashes) from the current source tree.
//
// It re-uses the primitives' already-transpiled blocks verbatim (the base layer is frozen — no
// JSX transform, hence no new dependency); verify-parity.mjs fails if any embedded hash drifts
// from source, so an edited primitive can never silently ship stale.
//
// Usage: node tool/parity/build-bundle.mjs   (writes only on change; --check fails on drift)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = fileURLToPath(new URL('../../docs/design/MemoX Design System_v4/', import.meta.url));
const BUNDLE = join(KIT, '_ds_bundle.js');
const check = process.argv.includes('--check');

// sha256 of LF-normalised source, first 12 hex — the algorithm the design-sync-cli uses.
const hash12 = (p) => createHash('sha256').update(readFileSync(p, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);

// base primitives = every components/**/Mx*.jsx on disk (the frozen Mx* families).
function basePrimitives() {
  const out = [];
  const walk = (dir, rel) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(dir, e.name), rel + e.name + '/');
      else if (/^Mx[A-Z].*\.jsx$/.test(e.name)) out.push(rel + e.name);
    }
  };
  walk(join(KIT, 'components'), 'components/');
  return out.sort();
}

const src = readFileSync(BUNDLE, 'utf8');
const headerMatch = src.match(/^\/\* @ds-bundle: (\{[\s\S]*?\}) \*\//);
if (!headerMatch) throw new Error('build-bundle: @ds-bundle header not found');
const header = JSON.parse(headerMatch[1]);
const body = src.slice(headerMatch[0].length);

// split the IIFE body into: setup | component blocks | tail exposures + close.
const firstBlock = body.search(/^\/\/ (?:components|ui_kits)\//m);
const exposeRe = /\n__ds_ns\.[A-Za-z0-9_]+ = __ds_scope\./;
const exposeAt = body.search(exposeRe);
if (firstBlock < 0 || exposeAt < 0) throw new Error('build-bundle: could not locate block / expose sections');
const setup = body.slice(0, firstBlock);
const blocksSection = body.slice(firstBlock, exposeAt);
const tailSection = body.slice(exposeAt); // leading \n + all `__ds_ns.X = __ds_scope.X;` + `})();`

const base = basePrimitives();
const baseSet = new Set(base);

// keep only base-primitive component blocks (split on the `// <path>` markers). Some base
// primitives (MxLink/MxContextualAppBar/MxList) are runtime-authored and source-loaded by the
// gallery — they were never compiled into the bundle, so they simply have no block here.
const blocks = blocksSection.split(/(?=^\/\/ (?:components|ui_kits)\/)/m).filter(Boolean);
const keptBlocks = blocks.filter((b) => {
  const m = b.match(/^\/\/ (\S+\.jsx)/);
  return m && baseSet.has(m[1]);
});
const keptPaths = keptBlocks.map((b) => b.match(/^\/\/ (\S+\.jsx)/)[1]);
const keptNames = new Set(keptPaths.map((p) => p.replace(/.*\//, '').replace(/\.jsx$/, '')));
// keep only kept-primitive exposure lines; always keep the closing `})();`.
const exposeLines = tailSection.split('\n').filter((l) => {
  const m = l.match(/^__ds_ns\.([A-Za-z0-9_]+) = __ds_scope\./);
  if (m) return keptNames.has(m[1]);
  return l.trim() === '' || l.includes('})();');
});

// refreshed header: EXACTLY the primitives that have a compiled block here (+ their hashes).
header.components = keptPaths.map((sourcePath) => ({ name: sourcePath.replace(/.*\//, '').replace(/\.jsx$/, ''), sourcePath }));
header.sourceHashes = Object.fromEntries(keptPaths.map((p) => [p, hash12(join(KIT, p))]));

const nextBody = setup + keptBlocks.join('') + '\n' + exposeLines.join('\n').replace(/^\n+/, '');
const next = `/* @ds-bundle: ${JSON.stringify(header)} */\n${nextBody.replace(/^\n*/, '\n')}`;

if (src.replace(/\r\n/g, '\n') === next.replace(/\r\n/g, '\n')) { console.log(`build-bundle: bundle already current (${keptPaths.length} base primitives).`); process.exit(0); }
if (check) { console.error('✗ build-bundle: _ds_bundle.js is stale vs source — run `node tool/parity/build-bundle.mjs`.'); process.exit(1); }
writeFileSync(BUNDLE, next);
console.log(`build-bundle: wrote ${keptPaths.length} base primitives (${blocks.length - keptBlocks.length} stale composite block(s) pruned).`);
