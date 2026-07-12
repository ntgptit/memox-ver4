#!/usr/bin/env node
// tool/tests/design-parity.test.mjs — deterministic regression tests for the post-#62 fixes:
//   1. bundle/source parity  — no compiled bundle can carry a stale body (bundle retired)
//   2. contrast gate          — tertiary gated as normal; missing/invalid token = hard fail
//   3. manifest scopes        — dark-scoped tokens get dark values; dark inherits light
//   4. legacy metadata        — no Tokyo/NebulaFighter/indigo+cyan/blue-grey current claims
// No dependencies (plain assertions). Wired into verify:ui-kit[:structural] via verify.mjs.

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { scopedValues, isDarkScope, isLightScope } from '../parity/lib/scoped-values.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const KIT = join(ROOT, 'docs/design/MemoX Design System_v4');
const CONTRAST = join(ROOT, 'tool/ui_kit_shots/contrast.mjs');
const node = process.execPath;
const TMP = mkdtempSync(join(tmpdir(), 'mx-parity-'));

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; } else { fail++; console.error(`  ✗ ${name}`); } };

// helper: run contrast.mjs against a fixture stylesheet, return exit status
function contrastExit(css) {
  const f = join(TMP, `colors-${Math.abs(hash(css))}.css`);
  writeFileSync(f, css);
  return spawnSync(node, [CONTRAST], { env: { ...process.env, MX_CONTRAST_COLORS: f }, encoding: 'utf8' }).status;
}
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

// ── 2. CONTRAST ──────────────────────────────────────────────────────────────
const baseCss = readFileSync(join(KIT, 'tokens/colors.css'), 'utf8');
ok('contrast: canonical colors.css passes', contrastExit(baseCss) === 0);
ok('contrast: sub-4.5 text-tertiary (light) fails',
  contrastExit(baseCss.replace('--memox-text-tertiary: #6f6b81;', '--memox-text-tertiary: #9793a8;')) === 1);
ok('contrast: missing required token fails',
  contrastExit(baseCss.replace(/--memox-on-error:\s*#[0-9a-f]+;/i, '')) === 1);
ok('contrast: invalid required colour fails',
  contrastExit(baseCss.replace('--memox-accent: #7355d6;', '--memox-accent: notacolor;')) === 1);
ok('contrast: light passes but dark fails ⇒ whole gate fails',
  // dark --memox-text #f4f2fb is dark-only; drop it to the dark bg colour so text↔bg collapses
  // in dark while light (its own #1b1a26) stays fine.
  contrastExit(baseCss.replace('--memox-text: #f4f2fb;', '--memox-text: #141220;')) === 1);

// ── 3. MANIFEST SCOPES ───────────────────────────────────────────────────────
const fx = join(TMP, 'scoped.css');
writeFileSync(fx, `:root, [data-theme='light'] { --memox-bg: #f6f5fc; --memox-text: #1b1a26; --memox-primary: #4b3a8c; }
[data-theme='dark'] { --memox-bg: #141220; --memox-text: #f4f2fb; }`);
const sv = scopedValues(fx);
ok('scope: light bg = #f6f5fc', sv.light['--memox-bg'] === '#f6f5fc');
ok('scope: dark bg = #141220 (not the light value)', sv.dark['--memox-bg'] === '#141220');
ok('scope: dark text = #f4f2fb', sv.dark['--memox-text'] === '#f4f2fb');
ok('scope: dark inherits light for non-overridden --memox-primary', sv.dark['--memox-primary'] === '#4b3a8c');
ok('scope: isDarkScope true for dark selector', isDarkScope("[data-theme='dark']") === true);
ok('scope: isLightScope true for undefined/root', isLightScope(undefined) === true && isLightScope(':root') === true);
ok('scope: an unknown scope is neither light nor dark', !isDarkScope('[data-theme="sepia"]') && !isLightScope('[data-theme="sepia"]'));

// live manifest reflects scoped values
const manifest = JSON.parse(readFileSync(join(KIT, '_ds_manifest.json'), 'utf8'));
const bgDark = manifest.tokens.find((t) => t.name === '--memox-bg' && isDarkScope(t.scope));
const bgLight = manifest.tokens.find((t) => t.name === '--memox-bg' && isLightScope(t.scope));
ok('manifest: dark --memox-bg = #141220', bgDark && bgDark.value === '#141220');
ok('manifest: light --memox-bg = #f6f5fc', bgLight && bgLight.value === '#f6f5fc');

// ── 1. BUNDLE RETIRED (no stale compiled body possible) ──────────────────────
ok('bundle: _ds_bundle.js does not exist', !existsSync(join(KIT, '_ds_bundle.js')));
ok('bundle: build-bundle.mjs does not exist', !existsSync(join(ROOT, 'tool/parity/build-bundle.mjs')));

// ── 4 + parity integration: verify-parity passes (checks A–E incl. no-bundle + legacy) ──
const parity = spawnSync(node, [join(ROOT, 'tool/parity/verify-parity.mjs')], { encoding: 'utf8' });
ok('parity: verify-parity.mjs passes (components + light/dark tokens + no bundle + no legacy)', parity.status === 0);

console.log(`design-parity tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
