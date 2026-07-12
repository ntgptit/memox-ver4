// tool/parity/lib/scoped-values.mjs — shared theme-scope parsing for the manifest tooling.
// Extracts --memox-* custom properties per theme from a CSS file, honouring [data-theme='dark'].
// Dark inherits light for tokens it does not override (CSS cascade). No dependencies.

import { readFileSync } from 'node:fs';

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
