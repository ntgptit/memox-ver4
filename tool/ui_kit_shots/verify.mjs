#!/usr/bin/env node
// tool/ui_kit_shots/verify.mjs — the ONE consolidated UI-kit gate (npm run verify:ui-kit).
//
// Fails (exit 1) on any of:
//   1. DRIFT       — index.html gallery / specs INDEX / shots INDEX out of sync with registry.mjs
//   2. FRESHNESS   — the render report is older than the registry, the harness, or any kit source
//   3. VISUAL      — a screen/state renders blank / ErrorBoundary / has unaccepted overflow or clip
//
// Coverage: full 168-state matrix by default (CI). Pass --sample (or SHOOT_MODE=sample) for the
// fast local subset. This is the single command a handoff / CI blocks on.
//
// Usage:
//   node tool/ui_kit_shots/verify.mjs            # full matrix (CI)
//   node tool/ui_kit_shots/verify.mjs --sample   # fast local subset

import { spawnSync } from 'node:child_process';
import { statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const KIT = join(ROOT, 'docs/design/MemoX Design System_v4');
const sample = process.argv.includes('--sample') || process.env.SHOOT_MODE === 'sample';
// optional positional screen id (or `id:states`) — scopes the visual gate to one screen for a
// fast end-to-end check; drift + freshness still run repo-wide.
const scope = process.argv.slice(2).find((a) => !a.startsWith('--'));

const node = process.execPath;
const step = (name, res) => {
  const ok = res.status === 0;
  console.log(`\n${ok ? '✓' : '✗'} ${name}`);
  return ok;
};

// newest mtime across the kit source tree + the harness (what the render must be newer than).
function newestSource() {
  let newest = 0, at = '';
  const exts = ['.jsx', '.js', '.mjs', '.css', '.html'];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'out' || e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (exts.some((x) => e.name.endsWith(x))) {
        const m = statSync(p).mtimeMs;
        if (m > newest) { newest = m; at = p; }
      }
    }
  };
  walk(join(KIT, 'ui_kits/memox-app'));
  walk(HERE);
  return { newest, at };
}

console.log(`verify:ui-kit — coverage: ${sample ? 'sample (fast/local)' : 'FULL 168-state matrix (CI)'}`);

// ── 1. DRIFT ──────────────────────────────────────────────────────────────
const drift = step('registry ↔ artifacts (drift)', spawnSync(node, [join(HERE, 'gen.mjs'), '--check'], { stdio: 'inherit' }));

// ── 2. VISUAL (renders + writes report.json) ────────────────────────────────
const shootEnv = { ...process.env, ...(sample ? { SHOOT_MODE: 'sample' } : {}) };
const shootArgs = [join(HERE, 'shoot.mjs'), ...(scope ? [scope] : [])];
const visual = step(`visual gate (render + overflow/clip)${scope ? ` [scope: ${scope}]` : ''}`, spawnSync(node, shootArgs, { stdio: 'inherit', env: shootEnv }));

// ── 3. FRESHNESS (report newer than any source) ─────────────────────────────
let fresh = false;
try {
  const report = join(HERE, 'out/report.json');
  const rm = statSync(report).mtimeMs;
  const { newest, at } = newestSource();
  fresh = rm >= newest;
  console.log(`\n${fresh ? '✓' : '✗'} report freshness (report ${fresh ? '≥' : '<'} newest source)`);
  if (!fresh) console.log(`    stale vs ${at.replace(ROOT, '')} — re-run the gate`);
} catch { console.log('\n✗ report freshness — out/report.json missing'); }

// ── verdict ─────────────────────────────────────────────────────────────────
const pass = drift && visual && fresh;
console.log(`\n${pass ? '✓ verify:ui-kit PASSED' : '✗ verify:ui-kit FAILED'}${sample ? ' (sample coverage — run without --sample for the full CI gate)' : ''}`);
process.exit(pass ? 0 : 1);
