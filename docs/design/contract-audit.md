# Contract Audit — MemoX Design System v4 UI Kit

Đối chiếu toàn bộ **22 màn hình · 117 states** của `docs/design/MemoX Design System_v4/ui_kits/memox-app/`
với [`mobile-ui-construction-contract.md`](mobile-ui-construction-contract.md).

**Ruling áp dụng** (đã chốt với chủ dự án):
1. **Contract thắng khi xung đột spacing** — allowlist `{4,8,12,16,24,32,48}` là chuẩn; mọi
   `20/40/6/1/2/3/96/159px` trong kit là defect phải sửa. Gutter màn hình phải = 16.
2. **Scope = report + bổ sung state thiếu** — báo cáo này là backbone; sau đó thêm fixture
   cho các state matrix còn thiếu.

Nguồn dữ liệu: `ui_kits/memox-app/specs/*.md` (DOM spec token-resolved) + `shots/*.png`
(light+dark). Các số đo là deterministic (trích bằng script), đã lọc false-positive thủ công.

---

## A. Systemic defects (sửa 1 lần ở token/component, lợi cho toàn bộ 22 màn)

| ID | Severity | Layer | Defect | Bằng chứng | Hướng sửa (đưa về scale) |
|----|----------|-------|--------|-----------|--------------------------|
| SYS-01 | High | Token/Screen | **Gutter + card padding = 20px** ngoài scale | `pad:16/20/96/20` (87×), `pad:20` (52×); tổng **398×** giá trị 20px | Gutter 20→**16**; card padding 20→**16** (hoặc 24 nếu cần thoáng) |
| SYS-02 | High | Component | **Touch target < 44** ở control cốt lõi | `MxButton` compact 38, `MxChip` 34, `MxSwitch` 32, `MxIconButton` 36×36, `segmented seg` 38 | Nâng min control ≥44; `MxIconButton` 36→**48×48** (icon 24 + pad 12, on-scale) |
| SYS-03 | High | Token | **>5 typography roles** trên 18/22 màn | dashboard/library/statistics = 11 size khác nhau; cả kit dùng 30/26/24/22/20/18/17/16/15/13/12/11 + 48 | Gộp về **≤5 role** (Display / Title / Body / Label / Caption); số hero 48 phải fold vào Display |
| SYS-04 | Med | Component | **Icon-button pad `1/6`** ngoài scale | `pad:1/6` (icon-button) → 1px×171, 6px×226 | Chuẩn hoá theo SYS-02 (48×48, pad 12) → tự hết 1/6 |
| SYS-05 | Med | Screen | **Bottom scroll inset = 96px** ngoài scale | `pad:…/96/…` (87×) | Clearance nav(72)+FAB; compose từ token safe-inset, hoặc dùng 48×2 và document exception |
| SYS-06 | Med | Screen | **Top pad 40px** ở hero/empty | `pad:40/16` (17×) | 40→**32** hoặc **48** |
| SYS-07 | Low | Token | **Sub-grid pad 1/2/3px** (optical) | 1px×171, 2px×21, 3px×30 | Chấp nhận nếu là căn optical bên trong control; còn lại về 4 |
| SYS-08 | Low | Screen | **Giá trị 159px** (chiều cao/offset sheet) | 159px×22 (deck-detail, library, reminder…) | Rà từng sheet; đưa về token chiều cao chuẩn |

**PASS toàn kit:** không có màu hard-code (`bare #rrggbb` = 0 ✓); mọi state đều có **light + dark** ✓.

**False-positive đã loại (không tính defect):** `bottom-nav__icon 56×30` (item chạm thật 75×52 ✓);
`search-dock__input …×21` (dock bao ngoài lớn hơn).

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
