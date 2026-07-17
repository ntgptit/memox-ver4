// tool/parity/lib/token-parity.mjs — PURE, unit-testable manifest ↔ source token parity.
// Checks BOTH directions so neither a drifted value, a deleted token, nor an unmirrored source
// token can slip through:
//   B  manifest → source : every manifest token still matches its scoped source value AND its
//                          source declaration still EXISTS (want == null ⇒ deleted ⇒ FAIL, since
//                          token names are an additive-only frozen contract).
//   B2 source → manifest : every source token (per file) is mirrored by a manifest entry (a light
//                          entry for its :root value, a dark entry when [data-theme='dark'] overrides).
//
// No filesystem access here (that stays in verify-parity) — inputs are injected so tests can drive
// it with synthetic data:
//   tokens      : manifest.tokens[]  ({ name, value, scope?, definedIn })
//   sourceOf(f) : (definedIn) => { light:{name:val}, dark:{name:val} } | null   (null = missing file)
//   sourceFiles : string[] of token files that must be fully mirrored
// Returns { failures: string[], light, dark, unknown } (failures empty ⇒ parity holds).

import { isDarkScope, isLightScope, normValue as norm } from './scoped-values.mjs';

export function tokenParity(tokens, sourceOf, sourceFiles) {
  const failures = [];
  let light = 0, dark = 0, unknown = 0;

  // B — manifest → source
  for (const t of tokens || []) {
    if (!t.definedIn) continue;
    const sv = sourceOf(t.definedIn);
    if (!sv) { failures.push(`token ${t.name} definedIn missing file: ${t.definedIn}`); continue; }
    let want;
    if (isDarkScope(t.scope)) want = sv.dark[t.name];
    else if (isLightScope(t.scope)) want = sv.light[t.name];
    else { unknown++; failures.push(`token ${t.name} has an unrecognised scope: ${JSON.stringify(t.scope)}`); continue; }
    if (want == null) {
      // The manifest still carries a token whose source declaration is GONE — a deletion. Names are
      // additive-only, so this FAILS (the old `want != null &&` guard let it pass silently). Removing
      // only a DARK override while light stays leaves want = the inherited light value (defined), so
      // that case falls through to the mismatch branch instead.
      failures.push(`manifest token no longer in source (names are additive-only — deleted?): ${t.name}${isDarkScope(t.scope) ? ' [dark]' : ''} in ${t.definedIn}`);
      continue;
    }
    if (norm(want) !== norm(t.value)) {
      isDarkScope(t.scope) ? dark++ : light++;
      failures.push(`${isDarkScope(t.scope) ? 'dark' : 'light'} token ${t.name}: manifest ${t.value} ≠ source ${want}`);
    }
  }

  // B2 — source → manifest
  const haveLight = new Set((tokens || []).filter((t) => isLightScope(t.scope)).map((t) => t.definedIn + '|' + t.name));
  const haveDark = new Set((tokens || []).filter((t) => isDarkScope(t.scope)).map((t) => t.definedIn + '|' + t.name));
  for (const f of sourceFiles || []) {
    const sv = sourceOf(f);
    if (!sv) continue;
    for (const name of Object.keys(sv.light)) if (!haveLight.has(f + '|' + name)) failures.push(`source token not mirrored in manifest (light): ${name} in ${f}`);
    for (const [name, value] of Object.entries(sv.dark)) if (sv.light[name] !== value && !haveDark.has(f + '|' + name)) failures.push(`source token not mirrored in manifest (dark override): ${name} in ${f}`);
  }

  return { failures, light, dark, unknown };
}
