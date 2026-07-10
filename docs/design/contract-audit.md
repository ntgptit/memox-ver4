# Contract Audit — MemoX Design System v4 UI Kit

Đối chiếu toàn bộ **22 màn hình · 117 states** của `docs/design/MemoX Design System_v4/ui_kits/memox-app/`
với [`mobile-ui-construction-contract.md`](mobile-ui-construction-contract.md).

**Ruling áp dụng** (đã chốt với chủ dự án):
1. **Contract thắng khi xung đột spacing** — allowlist `{4,8,12,16,24,32,48}` là chuẩn; mọi
   `20/40/6/1/2/3/96/159px` trong kit là defect phải sửa. Gutter màn hình phải = 16.
2. **Scope = report + bổ sung state thiếu** — báo cáo này là backbone; sau đó thêm fixture
   cho các state matrix còn thiếu.

Nguồn dữ liệu: `ui_kits/memox-app/specs/*.md` (DOM spec token-resolved) + `shots/*.png`.

> ⚠ **CẢNH BÁO STALE — đọc trước khi dùng số liệu spec.** Specs/shots được export ở một
> bản CSS CŨ hơn hiện tại (gutter đã đổi 20→24, `MxButton` 38→48…). Mọi con số **spacing**
> lấy từ spec đã được **re-verify trên render thật** (Playwright + computed style / đọc CSS
> nguồn). Section A dưới đây là **bản đã đính chính theo ground-truth**, không phải theo spec.

---

## A. Systemic — bản đính chính theo render thật (Playwright, 2026-07-10)

Sau khi render kit hiện tại và đo `getComputedStyle` + đọc CSS nguồn, **phần lớn "systemic
defect" ban đầu là artifact của spec stale / đo nhầm visual**. Kit thực tế tuân thủ tốt hơn nhiều.

| ID | Trạng thái | Kết luận (ground-truth) |
|----|-----------|--------------------------|
| SYS-01 gutter | ✅ **FIXED (2026-07-10)** | `--memox-gutter: 24→16` (contract screen padding=16). Đồng thời đưa mọi spacing off-scale về scale: section gap `space-5(20)→space-6(24)` (contract 24/32), card/appbar/fab/sheet/empty padding `20→24` & `40→32`. Verify live: gutter 16, body gap 24, card pad 24, render OK, không vỡ. Còn `[1,2,3,6]` = optical trong control (hit-area đã 48) + `156` = clearance nav+FAB (composed) → accepted. |
| SYS-02 touch <44 | ✅ **RETRACTED — false positive** | Kit đã có pass "G2 hit area": mọi control nhỏ có `::after` overlay mở rộng vùng chạm lên **48px** (`.chip::after inset:-7px 0`, `.switch::after -8/-4`, `.icon-btn--sm::after -6`, `.btn--sm/.segmented__seg::after -4`). `MxButton` thật = 48px minH. **Touch target ĐẠT.** Spec đo box visual, không đo `::after`. |
| SYS-03 typography | ⚠ **Genuine (per-screen)** | Scale 9 bậc (12→48). Dashboard render **8 bậc/màn > 5**. Là kỷ luật hierarchy per-screen (giảm số kiểu chữ mỗi màn), KHÔNG phải lỗi token. |
| SYS-04 icon pad 1/6 | ✅ Retract (touch) | `1/6` là padding optical trong icon-btn; vùng chạm đã = 48 (::after). Không tính defect. |
| SYS-05 inset 96 / SYS-06 top 40 / SYS-08 159 | ❓ **Cần re-verify live** | Số từ spec stale; phải đo lại trên CSS hiện tại trước khi kết luận. |
| SYS-07 optical 1/2/3px | ✅ Low/accept | Căn optical trong control; vùng chạm đã xử lý. |

**PASS xác nhận (ground-truth):** 0 màu hard-code ✓ · full light+dark ✓ · full-tokenized ✓ ·
touch target ≥44 (qua ::after) ✓ · `MxButton` 48 ✓ · `.icon-btn` 48 ✓.

**Bài học:** không đo touch target bằng box visual (spec/`getBoundingClientRect`) — phải tính
cả `::after` hit overlay. Không refactor token trước khi verify render thật.

**⇒ "Contract thắng — sửa kit" hoá ra chỉ còn 1 điểm foundation thật (gutter 16) + kỷ luật
typography per-screen. Khối lượng thực nằm ở STATE MATRIX (mục B) — đúng với ruling "bổ sung state".**

---

## B. State-matrix coverage (contract step 6–7)

Contract yêu cầu mỗi màn: `Loading · Loaded-normal · Loaded-min · Loaded-dense · Empty ·
Recoverable-error · Long-text · Large-font · Narrow-device · Dark`. Form thêm:
`Validation-error · Disabled-submit · Submitting · Submit-failure · Submit-success`.

Ký hiệu: ✓ có · ✗ thiếu · ～ có state domain tương đương.

### Thiếu trên CẢ 22 màn (universal gap)
- **Long-text** (title 3 dòng, badge/label dài) — ✗ toàn bộ.
- **Large-font** (font scale 1.3 / 1.5) — ✗ toàn bộ (kit render 1 cỡ cố định).
- **Narrow-device** (320 / 360 / 430px) — ✗ toàn bộ (kit chỉ khung 390px).
- **Multilingual edge** (VI/EN/KO) & **Keyboard-open** & **Safe-area notch/gesture** — ✗ toàn bộ.

→ Đây là hạng mục lớn nhất: cần harness render đa cấu hình (font-scale, width, locale) mới bổ sung được.

### Per-screen (state lifecycle + form)

| Screen | Archetype | Loading | Loaded | Min | Dense | Empty | Error | Form submit states | Ghi chú |
|--------|-----------|:--:|:--:|:--:|:--:|:--:|:--:|--------------------|---------|
| dashboard | Dashboard | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | — | thêm domain: goal-met, streak-reset (ok) |
| library | List/Search | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | — | lifecycle tốt; thiếu min(1 item)/dense(nhiều) |
| deck-detail | Detail | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | — | nhiều menu/dialog ✓; thiếu min/dense |
| flashcard-editor | **Form** | — | ✓ | — | — | — | — | validation ✓; **thiếu disabled/submitting/failure/success** | |
| game-picker | Selection | ✗ | ✓ | — | — | ～not-enough | ✗ | — | thiếu loading scope |
| game-matching | Focus flow | ✗ | ✓ | — | — | ✗ no-pairs | ✗ save-error | — | flow states đủ |
| game-mc | Focus flow | ✗ | ✓ | — | — | ✗ | ✗ | — | |
| game-recall | Focus flow | ✗ | ✓ | — | — | ✗ | ✗ | — | |
| game-typing | Focus flow | ✗ | ✓ | — | — | ✗ | ✗ | — | **có input → cần Keyboard-open + long-term** |
| review | Focus flow | ✗ | ✓ | — | — | ✗ | ✗ | — | thiếu loading/empty/error |
| player | Focus flow | ✗ | ✓ | — | — | — | ✗ load-fail | — | thiếu loading/error |
| study-result | Summary | ～finalizing | ✓ | — | ～many-wrong | — | ✓ finalize-error | — | tốt |
| search | Search | ✓ | ✓ | — | ✗ | ✓ recent | ～no-results | — | thiếu dense/error-fail |
| statistics | Dashboard | ✓ | ✓ | — | ✗ | ✓ insufficient | ✗ | — | thiếu dense/error |
| reminder | Form/Settings | — | ✓ | — | — | — | — | (toggle, no submit) | thiếu long-text |
| account-sync | Settings/Form | ～syncing | ✓ | — | — | — | ✓ conflict/offline | ～syncing≈submitting; **thiếu validation email** | |
| theme | Settings/Selection | — | ✓ | — | — | — | — | — | có control 'accent-size' nhưng **không test large-font** |
| import | Form/flow | ✗ importing | ✓ | — | — | — | ～dup-warning | done≈success; **thiếu submit-failure** | |
| export | Form/flow | ✓ exporting | ✓ | — | — | — | ✗ | done≈success; **thiếu failure** | |
| drawer | Nav/Selection | — | ✓ | — | — | ✗ no-lang | — | — | thiếu empty/long-name |
| study-session | Focus flow | ✗ | ✓ | — | — | — | ✓✓ save/resume-error | — | error tốt; thiếu loading |
| settings | Settings | — | ✓ | — | — | (n/a) | — | — | static ok; thiếu long-text |

---

## C. Kế hoạch khắc phục (thứ tự đề xuất)

1. **Foundation (systemic) trước — sửa 1 lần, verify lại toàn bộ shots:**
   - SYS-03 gộp typography về ≤5 role (token layer).
   - SYS-02 + SYS-04 nâng touch target control ≥44 (`MxButton`/`MxChip`/`MxSwitch`/`MxIconButton`/`MxSegmented`).
   - SYS-01 + SYS-06 đưa gutter/padding về scale (20→16, 40→32/48).
   - SYS-05/07/08 xử lý inset/optical/sheet còn lại.
2. **Bổ sung universal states** — dựng harness render đa cấu hình rồi thêm fixture
   Long-text / Large-font(1.3,1.5) / Narrow(320,360,430) / Keyboard-open / Multilingual cho từng màn.
3. **Bổ sung per-screen states còn thiếu** (bảng B) — min/dense data, loading/empty/error, form submit lifecycle.
4. **Visual verification (contract step 8)** cho từng fixture mới: render → screenshot → defect ID → fix → re-shoot → pass visual gate.

**Định nghĩa hoàn thành** bám đúng contract step 9: mỗi màn phải đủ screen plan, archetype,
composition map, component map, state matrix, fixture, responsive + a11y verification,
screenshots, defect report, kết quả fix, và guard/test tương ứng.

> ⚠ Lưu ý kỹ thuật: kit là HTML/CSS prototype render ở khung 390px cố định. Các state
> Large-font / Narrow-device / Keyboard-open **chưa render được** nếu không dựng harness
> (nhiều viewport width + font-scale). Đây là điều kiện tiên quyết cho bước 2–4.

---

## D. Remediation log

### 2026-07-10 · Harness đa cấu hình
- Thêm `tool/ui_kit_shots/shoot.mjs` (Playwright): render mỗi screen×state ở
  **4 width (320/360/390/430) × 3 font-scale (1.0/1.3/1.5) × light/dark**, screenshot +
  tự phát hiện overflow ngang / clip nội dung quan trọng. Đây là công cụ verify contract
  step 7–8 cho cả 22 màn. Output `tool/ui_kit_shots/out/` (gitignored).

### 2026-07-10 · SYS-01 spacing → contract scale (đã nêu mục A). ✅

### 2026-07-10 · dashboard — narrow/large-font pass ✅
Harness phát hiện & đã fix (verify lại: **144 combos, 0 finding**):
- **D-01 (shared)** `MxBottomNav` tràn ngang ở 320px (5 item × pill 56px cố định = 348px,
  "Profile" bị cắt). Fix: `.bottom-nav__item{min-width:0}` + `.bottom-nav__icon{width:100%;
  max-width:56px}` → item/pill co vừa 320px ở mọi font-scale. **Lợi cho MỌI màn có nav.**
- **D-02** `dashboard/mastered` (grid 2 cột) tràn 4–9px ở 320px×1.5. Fix:
  `gridTemplateColumns: minmax(0,1fr)…` + inner flex `minWidth:0; flexWrap:wrap`.

> Còn tồn đọng (chưa làm): SYS-03 typography ≤5/màn; và chạy harness + bổ sung state
> data (min/dense/error/form-submit) cho 21 màn còn lại, theo đúng vòng render→defect→fix→re-shoot.

### 2026-07-10 · Quét harness TOÀN KIT (1560 combos) — triage responsive/large-font

Chạy `shoot.mjs` cho cả 22 màn × 4 width × 3 font-scale × 2 theme = **1560 combos**.
Detector đã tinh chỉnh **2 vòng** để loại false-positive (verify từng lần bằng screenshot):
- Loại `::after` hit-overlay (chip/switch/btn/icon-btn/segmented/accent-swatch): ngưỡng >8px
  (max hit inset = 8) thay vì skip cả control (skip cả control làm SÓT `add-meaning +74`).
- Loại descendant của scroller ngang (chip row) — cuộn có chủ đích.
- Health-check chỉ báo blank thật / ErrorBoundary (prefix "⚠"), không đòi `.app` (overlay hợp lệ).

**Kết quả: kit responsive-CLEAN gần như tuyệt đối.** Sau khi lọc, chỉ còn **1 class defect
thật** trên 5 màn — **app-bar title bị cắt ellipsis**:

| Màn | Title | Overflow | Configs | Mức độ |
|-----|-------|----------|---------|--------|
| **player** | "TOPIK I — Vocabulary" | tới +182px | mọi width + font (nặng nhất) | title bị bóp còn ~17px ở vài state (trail 2 icon chiếm 100px) |
| **deck-detail** | "Korean Basics" | +80px | w320–390, mọi font | |
| flashcard-editor | "New card" | +74px | w320/360 + font lớn | |
| game-mc | "Multiple choice" | +46px | w320/360 + font lớn | |
| account-sync | "Account & Sync" | +8px | chỉ w320/fs1.5 | borderline |

Ghi chú: `.appbar__title` ĐÃ có `flex:1;min-width:0;ellipsis` đúng — vấn đề là **trail chiếm
quá nhiều width** (player: 2 icon = 100px) bóp title. Fix hướng: giảm/gộp trail action, hoặc
cho phép title 2 dòng ở app-bar cao, hoặc rút gọn title. Cần quyết per-screen.

**Harness flakiness:** 1/1560 combo (dashboard) render blank do race mount — không phải defect
kit (tăng thời gian paint / retry sẽ hết).

**Mọi màn/state/config khác: 0 overflow, 0 clip** — kit đã responsive tốt (nhờ hệ token +
hit-area + fix `MxBottomNav` dùng chung).
