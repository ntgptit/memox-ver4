#!/usr/bin/env node
// tool/parity/verify-app-parity.mjs — kit ↔ APP visual parity report.
//
// The kit harness (tool/ui_kit_shots) checks the kit against itself, and the app
// golden harness (tool/app_golden) diffs the app against its own committed
// baselines — neither ever compares the APP to the KIT, so a wrong conversion
// sails through both. This tool closes that gap: for every app golden baseline
// whose `<screen>--<state>--<theme>.png` name also exists in the kit's reference
// shots, it pixel-compares the two at the shared 390×780 design frame and writes
// a ranked mismatch report + per-pair diff images.
//
// The kit shoots at 2x DPR (780×1560); the app goldens are 1x (390×780). The kit
// image is box-downsampled 2→1 before comparison. Antialiasing/text rasterization
// differ across the two renderers, so exact-pixel equality is not the bar — the
// numbers rank HOW FAR each screen is from its reference so drift is visible and
// reviewable, instead of silently self-certified.
//
//   node tool/parity/verify-app-parity.mjs              # report only (exit 0)
//   node tool/parity/verify-app-parity.mjs --gate 3     # exit 1 if any pair > 3%
//   node tool/parity/verify-app-parity.mjs languages    # only screens matching a prefix
//
// THE RULE (AGENTS.md / construction contract §8-9): every screen state × theme must
// stay under 3% mismatch vs its kit reference (`npm run parity:gate`) BEFORE the
// screen is considered done or the next screen is started. A pair may exceed the bar
// only via parity-allowlist.json with a written semantic reason.
//
// Output: tool/parity/out/app-parity.json + tool/parity/out/diff/<name>.png

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const KIT_SHOTS = join(ROOT, 'docs/design/MemoX Design System_v4/ui_kits/memox-app/shots');
const APP_BASELINE = join(ROOT, 'tool/app_golden/baseline');
const OUT_DIR = join(ROOT, 'tool/parity/out');
const DIFF_DIR = join(OUT_DIR, 'diff');
const ALLOWLIST_PATH = join(ROOT, 'tool/parity/parity-allowlist.json');

// Per-pixel color threshold (pixelmatch): loose, since the two renderers rasterize
// text/shadows differently. The score that matters is the mismatch percentage.
const PIXEL_THRESHOLD = 0.2;

const args = process.argv.slice(2);
const gateIdx = args.indexOf('--gate');
const gatePct = gateIdx >= 0 ? Number(args[gateIdx + 1]) : null;
const prefix = args.filter((a, i) => a !== '--gate' && i !== gateIdx + 1)[0] ?? '';

if (gateIdx >= 0 && (!Number.isFinite(gatePct) || gatePct <= 0)) {
  console.error('--gate requires a positive percentage, e.g. --gate 25');
  process.exit(2);
}

/** Box-downsample a PNG by an integer factor (kit shoots at 2x DPR). */
function downsample(png, factor) {
  const w = Math.floor(png.width / factor);
  const h = Math.floor(png.height / factor);
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const i = ((y * factor + dy) * png.width + (x * factor + dx)) * 4;
          r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; a += png.data[i + 3];
        }
      }
      const n = factor * factor;
      const o = (y * w + x) * 4;
      out.data[o] = r / n; out.data[o + 1] = g / n; out.data[o + 2] = b / n; out.data[o + 3] = a / n;
    }
  }
  return out;
}

function loadPng(path) {
  return PNG.sync.read(readFileSync(path));
}

if (!existsSync(KIT_SHOTS) || !existsSync(APP_BASELINE)) {
  console.error(`missing input dir:\n  kit: ${KIT_SHOTS}\n  app: ${APP_BASELINE}`);
  process.exit(2);
}

const kitNames = new Set(readdirSync(KIT_SHOTS).filter((f) => f.endsWith('.png')));
const appNames = readdirSync(APP_BASELINE).filter((f) => f.endsWith('.png') && f.startsWith(prefix));

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(DIFF_DIR, { recursive: true });

const results = [];
const unmatched = [];

for (const name of appNames.sort()) {
  if (!kitNames.has(name)) {
    unmatched.push(name);
    continue;
  }
  const app = loadPng(join(APP_BASELINE, name));
  let kit = loadPng(join(KIT_SHOTS, name));
  if (kit.width === app.width * 2 && kit.height === app.height * 2) {
    kit = downsample(kit, 2);
  }
  if (kit.width !== app.width || kit.height !== app.height) {
    results.push({ name, error: `size mismatch: kit ${kit.width}×${kit.height} vs app ${app.width}×${app.height}` });
    continue;
  }
  const diff = new PNG({ width: app.width, height: app.height });
  const differing = pixelmatch(kit.data, app.data, diff.data, app.width, app.height, {
    threshold: PIXEL_THRESHOLD,
    includeAA: false,
  });
  const pct = (differing / (app.width * app.height)) * 100;
  writeFileSync(join(DIFF_DIR, name), PNG.sync.write(diff));
  results.push({ name, mismatchPct: Number(pct.toFixed(2)) });
}

results.sort((a, b) => (b.mismatchPct ?? 101) - (a.mismatchPct ?? 101));

const report = {
  pixelThreshold: PIXEL_THRESHOLD,
  gatePct,
  compared: results,
  appOnlyNoKitShot: unmatched,
};
writeFileSync(join(OUT_DIR, 'app-parity.json'), JSON.stringify(report, null, 2) + '\n');

console.log(`kit ↔ app parity — ${results.length} compared, ${unmatched.length} app-only (no kit shot)\n`);
for (const r of results) {
  if (r.error) console.log(`  !!  ${r.name} — ${r.error}`);
  else console.log(`  ${String(r.mismatchPct).padStart(6)}%  ${r.name}`);
}
if (unmatched.length) {
  console.log(`\napp baselines with no same-named kit shot (fixture/state-name drift?):`);
  for (const n of unmatched) console.log(`  - ${n}`);
}
console.log(`\nreport: tool/parity/out/app-parity.json · diffs: tool/parity/out/diff/`);

if (gatePct != null) {
  // Allowlist: named pairs may exceed the gate for a WRITTEN semantic reason only
  // (see parity-allowlist.json). Styling drift never belongs there.
  let allowlist = {};
  if (existsSync(ALLOWLIST_PATH)) {
    allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'));
    delete allowlist['//'];
  }

  const offending = results.filter((r) => r.error || r.mismatchPct > gatePct);
  const allowed = offending.filter((r) => allowlist[r.name]);
  const over = offending.filter((r) => !allowlist[r.name]);

  for (const r of allowed) {
    console.log(`\nallowlisted (${r.mismatchPct ?? r.error}%): ${r.name}\n  reason: ${allowlist[r.name]}`);
  }
  const stale = Object.keys(allowlist).filter(
    (name) => !offending.some((r) => r.name === name),
  );
  for (const name of stale) {
    console.log(`\nnote: allowlist entry now passes the gate — remove it: ${name}`);
  }

  if (over.length) {
    console.error(
      `\nGATE FAIL: ${over.length} pair(s) above ${gatePct}% — fix the screen before moving on ` +
        `(review tool/parity/out/diff/<name>.png; rule: AGENTS.md / contract §8).`,
    );
    for (const r of over) console.error(`  ${String(r.mismatchPct ?? '!').padStart(6)}%  ${r.name}`);
    process.exit(1);
  }
  console.log(`\ngate OK: all pairs ≤ ${gatePct}% (${allowed.length} allowlisted)`);
}
