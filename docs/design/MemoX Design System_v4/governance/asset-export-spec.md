# Asset export specification

> Closes audit items **KIT-14-05** (no brand logo/app-icon asset; no clear-space/min-size/
> dark-bg variant spec) and **KIT-45-05** (no asset export spec table with dimensions/
> scale/fallback; missing logo/app-icon).

Defines how each shipped asset is exported and consumed, and records the **logo /
app-icon gap** as a tracked deliverable (not a silent omission). Values are drawn from
`_ds_manifest.json`, `tokens/typography.css`, and the kit iconography section.

## Export spec table

| Asset | Type | Source | Format | Weights / sizes | Scale / DPR | Fallback | Consumer | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Plus Jakarta Sans** | Variable font | `fonts/PlusJakartaSans[wght].ttf` | TTF (variable, `wght` axis) | Weight range `200 800`; used at 400/500/600/700/800 (`--memox-font-weight-*`) | N/A (vector) | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` (`--memox-font-sans`) | RN font asset + `@font-face` in `tokens/typography.css` | **Current** — self-hosted, shipped |
| **Material Symbols Rounded** | Icon font | Google Fonts CDN | Variable icon font (weight 400, FILL 0) | Rendered at `--memox-icon-size-sm/md/lg/xl` = 18/22/28/32px | N/A (vector) | OS glyph fallback if CDN unavailable; self-host if offline needed | Ligature spans in kit HTML; RN icon font in production | **Current** — CDN (not self-hosted; see gap G2) |
| **Avatar images** | Raster (content, not brand) | Placeholder/user-provided | Sized by token | `--memox-comp-avatar-sm/md/lg` = 32/44/64px | 1× / 2× per DPR (kit shoots at 2×) | Initials in `MxAvatar` when no image | `MxAvatar` | **Current** — content asset, no brand export |
| **Brand logo** | Vector mark | — none provided — | (target: SVG + PNG @1×/2×/3×) | (target: min-size + clear-space specs) | (target: 1×/2×/3×) | Plus Jakarta Sans **Extrabold wordmark** used in lieu of a mark | Wordmark type today | **Gap G1 — missing** |
| **App icon** | Raster/vector | — none provided — | (target: iOS/Android icon sets + adaptive icon) | (target: full platform size matrix) | (target: per-platform density buckets) | none | Launcher / store | **Gap G1 — missing** |

## Tracked gaps

- **G1 — logo / app-icon (P2, EXC-02).** No brand logo or app-icon asset was provided or
  available to copy; the MemoX wordmark is currently just Plus Jakarta Sans Extrabold
  type. When a logo/app-icon is supplied, this spec must be extended with:
  - **Clear-space:** minimum padding around the mark expressed in a token multiple.
  - **Minimum size:** smallest legible render (portrait phone context) in px.
  - **Dark-bg variant:** an explicit mark/wordmark treatment for the `[data-theme='dark']`
    canvas (`--memox-bg` `#141220`), mirroring the light treatment on `#f6f5fc`.
  - **Export matrix:** SVG master + PNG @1×/2×/3× (kit shoots at 2× DPR) and the full iOS
    + Android app-icon/adaptive-icon size sets.
  Tracked in `exception-register.md` (EXC-02); owner: Design System team (design owner).

- **G2 — icon font self-hosting.** Material Symbols Rounded is loaded from the Google
  Fonts CDN. If an offline/self-hosted build is required, self-host the variable icon
  font and document its export here (per `readme.md` iconography guidance).

## Export rules

- **No raw brand values in assets** beyond the token layer — asset dimensions reference
  tokens (`--memox-comp-avatar-*`, `--memox-icon-size-*`) rather than literals where the
  asset is sized by the system.
- **DPR:** the kit renders/shoots at **2× DPR**; raster exports provide at least @1× and
  @2×, adding @3× for app icons.
- **Fallback is mandatory** for every font/icon asset so a missing CDN or font file
  degrades gracefully.
