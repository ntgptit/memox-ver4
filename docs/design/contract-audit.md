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
| SYS-01 gutter | ⚠ **Genuine (1 quyết định)** | Gutter thật = **24px** (không phải 20). 24 ∈ scale nhưng contract ghi rõ *screen padding = 16* → vẫn lệch. Chọn: đổi token `--memox-gutter: 24→16`, hoặc sửa contract. |
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
