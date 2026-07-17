// tool/parity/lib/scoped-values.mjs — shared theme-scope parsing for the manifest tooling.
// Extracts --memox-* custom properties per theme from a CSS file, honouring [data-theme='dark'].
// Dark inherits light for tokens it does not override (CSS cascade). No dependencies.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Base light/dark token files under tokens/ that the manifest MUST mirror. Discovered from DISK
// (not derived from the manifest), so a brand-new tokens/*.css is caught by build-manifest +
// verify-parity even before anyone registers it — closes the "new token file slips the gate" hole.
// The allowlist excludes files that are NOT base :root/dark tokens.
export const TOKEN_FILE_ALLOWLIST = new Set([
  'high-contrast.css', // additive [data-hc='true'] profile overrides — read by contrast.mjs, never mirrored
]);
export function tokenSourceFiles(kitDir) {
  let entries;
  try { entries = readdirSync(join(kitDir, 'tokens')); } catch { return []; }
  return entries
    .filter((f) => f.endsWith('.css') && !TOKEN_FILE_ALLOWLIST.has(f))
    .map((f) => 'tokens/' + f)
    .sort();
}

export function scopedValues(cssPath) {
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const light = {}, dark = {};
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1];
    const isDark = /\[data-theme=['"]dark['"]\]/.test(sel);
    const isLight = /:root/.test(sel) || /\[data-theme=['"]light['"]\]/.test(sel);
    if (!isDark && !isLight) continue;
    for (const d of m[2].matchAll(/(--memox-[a-z0-9-]+)\s*:\s*([^;]+);/g)) (isDark ? dark : light)[d[1].trim()] = d[2].trim();
  }
  return { light, dark: { ...light, ...dark } };
}

export const isDarkScope = (s) => /\[data-theme=['"]dark['"]\]/.test(s || '');
export const isLightScope = (s) => !s || /:root/.test(s) || /\[data-theme=['"]light['"]\]/.test(s);
export const normValue = (v) => (v || '').replace(/\s+/g, ' ').trim();
