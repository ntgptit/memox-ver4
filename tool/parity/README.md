# Parity tooling

Two distinct gates live here — one kit-internal, one kit↔app:

## `verify-parity.mjs` (kit-internal, gating)

Deterministic source ↔ runtime consistency for the design kit itself
(manifest ↔ source ↔ gallery ↔ token values). Run via `npm run gen:parity`
after kit edits. Does **not** look at the RN app.

## `verify-app-parity.mjs` (kit ↔ APP, report)

The kit harness checks the kit against itself; the app golden harness
(`tool/app_golden`) diffs the app against its own committed baselines.
Neither compares the **app to the kit** — which is how a wrong kit→RN
conversion self-certifies. This report closes that loop:

```bash
npm run parity:app                     # ranked mismatch report, exit 0
node tool/parity/verify-app-parity.mjs languages       # one screen prefix
node tool/parity/verify-app-parity.mjs --gate 25       # exit 1 above 25%
```

For every `tool/app_golden/baseline/<screen>--<state>--<theme>.png` with a
same-named kit reference in `ui_kits/memox-app/shots/`, it pixel-compares
the two at the shared 390×780 frame (the kit's 2x shot is box-downsampled)
and writes:

- `tool/parity/out/app-parity.json` — ranked mismatch percentages
- `tool/parity/out/diff/<name>.png` — per-pair diff image
- a list of app baselines with **no** same-named kit shot (state-name drift)

The two renderers rasterize text/AA differently, so 0% is not the bar.
Read it as a **ranking**: review the top offenders' diff PNGs, fix, re-shoot
(`npm run golden:update`), re-run. Keep fixtures identical on both sides —
data drift makes the comparison meaningless (kit fixtures live in
`ui_kits/memox-app/_features/<screen>/`, app fixtures in
`src/features/<feature>/ui/fixtures.ts`).
