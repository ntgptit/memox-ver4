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
import { SCREENS } from './registry.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const KIT = join(ROOT, 'docs/design/MemoX Design System_v4');
const sample = process.argv.includes('--sample') || process.env.SHOOT_MODE === 'sample';
// --structural: run only the deterministic checks (drift + canonical-shot presence), skip the
// font/render-sensitive visual pass. This is the fast, reliable blocking gate for CI.
const structural = process.argv.includes('--structural');
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

const coverage = structural ? 'STRUCTURAL only (drift + shots, no render)'
  : scope ? `scoped: ${scope} (full responsive grid, this screen only)`
  : sample ? 'sample (fast local — sampled states, worst-case combo only)'
  : (process.env.SHOOT_SHARD ? `FULL matrix, shard ${process.env.SHOOT_SHARD}` : 'FULL matrix (168 states × responsive grid)');
console.log(`verify:ui-kit — coverage: ${coverage}`);

// ── 1. DRIFT ──────────────────────────────────────────────────────────────
const drift = step('registry ↔ artifacts (drift)', spawnSync(node, [join(HERE, 'gen.mjs'), '--check'], { stdio: 'inherit' }));

// ── 1b. CONTRAST (deterministic, always) — WCAG over tokens/colors.css ───────
const contrast = step('contrast (WCAG light+dark)', spawnSync(node, [join(HERE, 'contrast.mjs')], { stdio: 'inherit' }));

// ── 1c. SOURCE/RUNTIME PARITY (deterministic, always) ────────────────────────
const parity = step('source ↔ runtime parity', spawnSync(node, [join(ROOT, 'tool/parity/verify-parity.mjs')], { stdio: 'inherit' }));

// ── 2. VISUAL (renders + writes report.json) — skipped in --structural ──────
let visual = true, fresh = true;
if (!structural) {
  const shootEnv = { ...process.env, ...(sample ? { SHOOT_MODE: 'sample' } : {}) };
  const shootArgs = [join(HERE, 'shoot.mjs'), ...(scope ? [scope] : [])];
  visual = step(`visual gate (render + overflow/clip)${scope ? ` [scope: ${scope}]` : ''}`, spawnSync(node, shootArgs, { stdio: 'inherit', env: shootEnv }));

  // ── 3. FRESHNESS (report newer than any source) ──────────────────────────
  fresh = false;
  try {
    const report = join(HERE, 'out/report.json');
    const rm = statSync(report).mtimeMs;
    const { newest, at } = newestSource();
    fresh = rm >= newest;
    console.log(`\n${fresh ? '✓' : '✗'} report freshness (report ${fresh ? '≥' : '<'} newest source)`);
    if (!fresh) console.log(`    stale vs ${at.replace(ROOT, '')} — re-run the gate`);
  } catch { console.log('\n✗ report freshness — out/report.json missing'); }
}

// ── 4. SHOTS (canonical baseline present: light+dark per registry state) ────
let shotsOk = true;
if (scope) {
  console.log('\n· canonical shots — skipped (scoped run)');
} else {
  const SHOTS = join(KIT, 'ui_kits/memox-app/shots');
  const missing = [];
  for (const s of SCREENS) for (const st of s.states) for (const th of ['light', 'dark']) {
    try { statSync(join(SHOTS, `${s.id}--${st}--${th}.png`)); } catch { missing.push(`${s.id}--${st}--${th}`); }
  }
  shotsOk = missing.length === 0;
  console.log(`\n${shotsOk ? '✓' : '✗'} canonical shots (light+dark per state)`);
  if (!shotsOk) console.log(`    ${missing.length} missing, e.g. ${missing.slice(0, 5).join(', ')} — run: MXH_CANON=1 node tool/ui_kit_shots/shoot.mjs`);
}

// ── verdict ─────────────────────────────────────────────────────────────────
const pass = drift && contrast && parity && visual && fresh && shotsOk;
console.log(`\n${pass ? '✓ verify:ui-kit PASSED' : '✗ verify:ui-kit FAILED'}${sample ? ' (sample coverage — run without --sample for the full CI gate)' : ''}`);
process.exit(pass ? 0 : 1);
