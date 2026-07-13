# App visual-regression harness (WBS 11.4)

The golden/screenshot harness for the **RN app** (distinct from `tool/ui_kit_shots`,
which shoots the design **kit**). Approved as **DEP-GOLDEN**.

## Approach

Render the Expo **web** build (a faithful web render of the RN screens) in headless
**chromium** (Playwright, already a dep) at the mobile design frame (390×780), capture
each canonical state, and **pixel-diff** it (pixelmatch) against a committed baseline.
Web is used because it is deterministic and CI-friendly; the screens are the same RN
components the design system drives.

## Commands

```bash
npm run golden          # export web + verify every state vs its baseline (exit 1 on mismatch)
npm run golden:update   # export web + (re)write the baselines
```

## Conventions

- **Naming:** `<screen>--<state>--<theme>.png` (e.g. `shell-dashboard--loaded--light.png`).
- **Canonical-shot lookup:** the committed reference is `tool/app_golden/baseline/`.
- **Diff artifacts:** a mismatch writes `tool/app_golden/diff/<name>.png` (the pixel
  diff) and `tool/app_golden/out/report.json`; both are reviewable. `out/`, `diff/`,
  and the exported `web-build-golden/` are gitignored — only baselines are committed.
- **Tolerance:** per-pixel threshold `0.1`; a state fails if `>1%` of pixels differ.

## Per-slice contract (Vertical Slice Quality Ownership)

`TARGETS` in `shoot.mjs` starts with the **shell baseline sample**. Every feature
screen slice **appends its canonical states** to `TARGETS` and commits their baselines
in the same PR (`npm run golden:update`, review the images, commit
`baseline/<name>.png`). This row does **not** claim golden coverage of screens that
don't exist yet — it establishes the harness + one sample.
