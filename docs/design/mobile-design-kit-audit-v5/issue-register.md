# Issue Register

Tổng hợp từ vòng audit v5 trên MemoX Design System v4 (119 issue). Reviewed by: Claude (automated kit audit) · 2026-07-16.

## Phân bố severity

| Severity | Số lượng |
|---|---|
| `P0` | 6 |
| `P1` | 62 |
| `P2` | 44 |
| `P3` | 7 |
| **Tổng** | **119** |

## Phân bố final status theo nhóm

| Final status | Số nhóm |
|---|---|
| PASS | 6 |
| PARTIAL | 17 |
| BLOCKED | 25 |

## Issue

| Issue ID | Checklist ID | Mô tả | Severity | Owner | Target | Status | Evidence | Retest |
|---|---|---|---|---|---|---|---|---|
| ISS-KIT-42-01 | KIT-42-01 | Screen thiếu heading landmark (title là div); không có screen-reader walkthrough chứng minh reading order. | `P0` | Design System team | v4.1 kit freeze | `OPEN` | MxContextualAppBar.jsx:72-76 | — |
| ISS-KIT-42-02 | KIT-42-02 | Không có routing/nav để chạy task hoàn chỉnh bằng keyboard; không có focus-order log. | `P0` | Design System team | v4.1 kit freeze | `OPEN` | components/** Enter/Space handler; readme.md | — |
| ISS-KIT-42-04 | KIT-42-04 | Announcement (role=status/alert) chỉ có ở flashcard-editor; export/import/study-result success/failure/progress không announce. | `P0` | Design System team | v4.1 kit freeze | `OPEN` | _features/flashcard-editor/**; export/,import/,study-result/ = 0 aria-live | — |
| ISS-KIT-48-01 | KIT-48-01 | Chưa toàn bộ 48 nhóm có final status hoàn tất + evidence link tại thời điểm chốt release. | `P0` | Design System team | v4.1 kit freeze | `OPEN` | validation-report.json; audit-summary.md | — |
| ISS-KIT-48-02 | KIT-48-02 | Còn nhiều P0/P1 mở (a11y KIT-42, governance KIT-46, deprecation KIT-47, responsive KIT-32). | `P0` | Design System team | v4.1 kit freeze | `OPEN` | issue-register.md | — |
| ISS-KIT-48-06 | KIT-48-06 | Không có sign-off của design/accessibility/governance owner. | `P0` | Design System team | v4.1 kit freeze | `OPEN` | toàn kit (không có sign-off record) | — |
| ISS-KIT-08-06 | KIT-08-06 | Contrast evidence chỉ phủ light+dark; không có high-contrast/forced-colors profile. Cặp critical cần contrast evidence trên mọi profile (rule: contrast không dưới P1). | `P1` | Design System team | v4.1 kit freeze | `OPEN` | tool/ui_kit_shots/contrast.mjs; tokens/colors.css (chỉ light+dark) | Add high-contrast profile + run critical-pair contrast across all three profiles. |
| ISS-KIT-15-05 | KIT-15-05 | Core Mx* thiếu banner/snackbar/dialog/sheet/menu/determinate-progress như frozen component; chỉ tồn tại dạng feature composite chưa promote. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css chỉ .spinner (1085-1098); _ds_manifest.json; ui_kits/memox-app/_shared | — |
| ISS-KIT-18-01 | KIT-18-01 | Focus ring (--memox-ring-focus) chỉ áp cho btn/icon-btn/fab/search-dock; chip/switch/segmented/link/bottom-nav không có branded focus ring; chip/segmented/link thiếu disabled. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css focus-visible 337/474/573/621 only | — |
| ISS-KIT-18-02 | KIT-18-02 | MxTextField không có read-only prop/state; empty/filled/error/disabled có nhưng read-only không phân biệt. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | MxTextField.d.ts; components.css field--error/disabled (945,949) | — |
| ISS-KIT-18-03 | KIT-18-03 | Async chỉ có indeterminate spinner; MxButton không có loading/submitting; không có success/failure/retry component state. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css .spinner (1085-1098); MxButton.d.ts | — |
| ISS-KIT-19-05 | KIT-19-05 | Text inputs suppress focus outline, không có :focus/:focus-visible ring nên keyboard focus không nhìn thấy. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css:928,196,612 outline:none; ring chỉ prop-driven :621 | — |
| ISS-KIT-21-02 | KIT-21-02 | Text inputs không có visible focus indicator khi keyboard focus; chỉ button/fab/icon-btn có focus ring. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css:928/196/612 outline:none; rings 337-339,474-476,573-575 | — |
| ISS-KIT-21-03 | KIT-21-03 | Selected (bottom-nav), expanded (collapsible), loading (spinner) không được announce programmatically. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | MxBottomNav.jsx:10-20 no aria-current; .card-more no aria-expanded; .spinner no aria-busy | — |
| ISS-KIT-21-06 | KIT-21-06 | Reduced-motion phủ một phần (chỉ cappbar+spinner); không có 200% text-scaling verification. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css:206,1098; motion.css:17 pulse uncovered; 0 large-font shots | — |
| ISS-KIT-23-02 | KIT-23-02 | Detail pattern thiếu not-found / deleted-entity state variant. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | specs/account-sync.md; subdeck-list.md error not not-found | — |
| ISS-KIT-24-02 | KIT-24-02 | Bottom nav active chỉ có visual --active; không có aria-current/aria-selected/role=tab nên selected không expose cho AT. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | MxBottomNav.jsx:4-22; components.css:680-690 | — |
| ISS-KIT-25-03 | KIT-25-03 | Validation timing (blur/submit/async) không có spec/state; chỉ 1 snapshot all-invalid. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | flashcard-editor/components/Field.jsx:36-40; FlashcardEditor.jsx:138 | — |
| ISS-KIT-25-04 | KIT-25-04 | Không có state render bàn phím mở để verify field/primary action không bị che; SaveBar sticky là mitigation chưa xác nhận. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | FlashcardEditor.jsx:101-108,134,147 | — |
| ISS-KIT-25-06 | KIT-25-06 | Dirty-cancel chỉ tham chiếu shared ConfirmDialog; không có discard-confirm state/copy cho editor và không có dirty/clean logic. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | FlashcardEditor.jsx:10,129; _shared/ConfirmDialog.jsx | — |
| ISS-KIT-26-05 | KIT-26-05 | Không có rule/state cho search/filter giữ hay reset khi back/navigation; mỗi state là snapshot độc lập. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | _features/search/Search.jsx; library/Library.jsx | — |
| ISS-KIT-27-01 | KIT-27-01 | Trigger vào selection mode không được document; back thoát mode trước navigation không mô tả. Exit qua X có. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | MxContextualAppBar.jsx:63; shots/library--selection--light.png | — |
| ISS-KIT-27-02 | KIT-27-02 | Select-all không có indeterminate/tri-state phản ánh scope; count 'N selected' có. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | MxContextualAppBar.jsx:76; Library.jsx:108,114 | — |
| ISS-KIT-27-03 | KIT-27-03 | Không có state zero-selected; count luôn >0, more_vert luôn enabled; không chứng minh zero-selected → no action / auto-exit. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | Library.jsx:106-116; FlashcardList.jsx:113-135 | — |
| ISS-KIT-27-04 | KIT-27-04 | Không có bulk destructive confirm nêu số lượng; bulk action nằm sau more_vert không document. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | FlashcardList.jsx:167-180 | — |
| ISS-KIT-27-05 | KIT-27-05 | Không có rule selection thay đổi khi filter/sort/search đổi; hidden selection không xử lý. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | Library.jsx:106-116 | — |
| ISS-KIT-27-06 | KIT-27-06 | Không có state outcome cho bulk move/export (success/failure/partial) và không có selection recovery. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | Library.jsx; FlashcardList.jsx | — |
| ISS-KIT-29-02 | KIT-29-02 | Sheet không có maxHeight/overflow scroll cho long content và không có sheet-form+keyboard state. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | kit-helpers.jsx:116-124; Library.jsx:145-168 | — |
| ISS-KIT-29-05 | KIT-29-05 | Back đóng overlay trên cùng và focus trở về trigger không được render/document. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | kit-helpers.jsx:107-113 | — |
| ISS-KIT-31-01 | KIT-31-01 | Risk rubric chỉ 2 tier (warning/error), thiếu tier undoable; ConfirmDialog.md xếp reset/leave-session là warning nhưng code render tone=error. Không có risk-classification table. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | _shared/ConfirmDialog.md vs ExitDialog.jsx:10 + DeckResetConfirmDialog.jsx:9 | — |
| ISS-KIT-32-01 | KIT-32-01 | Chỉ có profile phone-hẹp(320)/rộng(430); thiếu tablet và compact-height; không có breakpoint table. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | tool/ui_kit_shots/shoot.mjs:32 WIDTHS=[320,360,390,430] | — |
| ISS-KIT-32-02 | KIT-32-02 | Không có composition tablet để so sánh reflow; chỉ 1 frame phone. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | shoot.mjs:136 height 780 cố định | — |
| ISS-KIT-32-03 | KIT-32-03 | Không có layout tablet/large-screen với max content width và nav/pane strategy. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | frame giới hạn 430px phone | — |
| ISS-KIT-32-04 | KIT-32-04 | Không có pattern list-detail/multi-pane collapse về single-pane. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | grep split-view/two-pane/list-detail = 0 | — |
| ISS-KIT-32-05 | KIT-32-05 | Sheet/dialog/nav chọn theo loại nội dung, không có adaptive-presentation rule theo device profile. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | kit-helpers.jsx:107,116 | — |
| ISS-KIT-33-01 | KIT-33-01 | Không có shared/adapted matrix theo platform profile và không có scope statement khẳng định kit dùng một visual language không adaptation theo platform. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | grep iOS/Android/Cupertino/Platform. = 0 | — |
| ISS-KIT-33-04 | KIT-33-04 | Không có platform component parity matrix cho switch/checkbox/radio/menu/action-sheet. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | MxSwitch, MxSegmentedControl, kit-helpers.jsx:116 | — |
| ISS-KIT-34-02 | KIT-34-02 | Bottom nav/sheet dùng pad cố định (--memox-comp-nav-safe-pad:4px), không có --memox-safe-area-bottom/env(safe-area-inset-bottom); bất đối xứng với top. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | tokens/component.css:47; components.css:642; kit-helpers.jsx:118 | — |
| ISS-KIT-34-05 | KIT-34-05 | Không có spec status-bar icon mode (dark/light) hay system nav bar appearance theo light/dark surface. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | grep statusBar/barStyle/light-content/dark-content = 0 | — |
| ISS-KIT-34-06 | KIT-34-06 | Không có landscape device frame để kiểm side cutout/rounded corner che target. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | shoot.mjs:136 chỉ render portrait height 780 | — |
| ISS-KIT-35-01 | KIT-35-01 | Không có cơ chế/token keyboard-avoidance; sticky SaveBar chỉ là assertion; không render được keyboard-open. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | _features/flashcard-editor/FlashcardEditor.jsx:98-108 | — |
| ISS-KIT-35-04 | KIT-35-04 | Không có dismiss-keyboard behavior matrix (back/tap/scroll không submit/mất input). | `P1` | Design System team | v4.1 kit freeze | `OPEN` | grep dismiss-keyboard = 0 | — |
| ISS-KIT-35-05 | KIT-35-05 | Không có autofill/password-manager affordance spec (autoComplete/textContentType). | `P1` | Design System team | v4.1 kit freeze | `OPEN` | MxTextField.d.ts có name/type=password nhưng không có autofill state | — |
| ISS-KIT-35-06 | KIT-35-06 | Không có landscape compact-height và hardware-keyboard evidence. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | shoot.mjs:136 portrait 780 | — |
| ISS-KIT-36-01 | KIT-36-01 | Scroll behavior rõ nhưng không có min-height tài liệu hóa và không stress ở portrait ngắn nhất. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css:39-44; shoot.mjs:136 height 780 | — |
| ISS-KIT-36-02 | KIT-36-02 | Không có landscape screenshots để kiểm nav/overlay/primary action ở compact height. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | grep landscape/orientation = 0 | — |
| ISS-KIT-36-03 | KIT-36-03 | Không có rotation state-preservation rule/recording cho input/selection/scroll/nav. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | kit tĩnh không thực thi rotation | — |
| ISS-KIT-37-01 | KIT-37-01 | Không có localization expansion corpus (30–50% dài hơn) cho button/tab/dialog; chỉ có content-stress tiếng Anh. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | shots/flashcard-list--long-text--*.png; guess-mode--long-text--*.png | — |
| ISS-KIT-37-02 | KIT-37-02 | CJK và mixed-script render qua OS fallback nhưng không khai báo font stack CJK/Vietnamese; Vietnamese diacritics không có evidence. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | tokens/typography.css; audit/_sheets/16-edge-a.png | — |
| ISS-KIT-37-03 | KIT-37-03 | Không có RTL support: 0 logical property, 8 physical left/right trong components.css; không mirror leading/trailing. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css | — |
| ISS-KIT-37-04 | KIT-37-04 | Date/time/number hardcode tiếng Anh; không có locale-format layer cho number/currency/plural/unit. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | shots/dashboard--loaded--*.png | — |
| ISS-KIT-37-05 | KIT-37-05 | Generic spec dùng physical left/right thay vì start/end (8 physical, 0 logical). | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css | — |
| ISS-KIT-37-06 | KIT-37-06 | Copy là English-only string hardcode trong JSX; không có string externalization/i18n. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | _features/**/*.jsx | — |
| ISS-KIT-38-06 | KIT-38-06 | Reduced-motion không đủ: chỉ cappbar+spinner honor; skeleton shimmer infinite bỏ qua prefers-reduced-motion; không có global reset hay reduced-motion token. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | components.css:206-210,1098; index.html:56; tokens/motion.css | — |
| ISS-KIT-39-05 | KIT-39-05 | Không có high-contrast profile trong colors.css (chỉ light+dark); KIT-08-06 kỳ vọng profile high-contrast. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | tokens/colors.css; KIT-08...md:34 | — |
| ISS-KIT-41-06 | KIT-41-06 | Combined worst-case RTL + long text + 200% text + landscape không được test. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | shots/ (390x780 portrait); components.css | — |
| ISS-KIT-42-05 | KIT-42-05 | Không xác nhận task hoàn thành dưới 200% text / high-contrast / reduced-motion. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | tokens/colors.css; shots/ | — |
| ISS-KIT-42-06 | KIT-42-06 | Không có accessibility issue register / sign-off / release gate trong kit. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | MemoX Design System_v4/ (không có a11y governance artifact) | — |
| ISS-KIT-46-01 | KIT-46-01 | Không có ownership index; foundation/component/pattern/theme không gắn owner/reviewer. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | _ds_manifest.json không có field owner | — |
| ISS-KIT-46-02 | KIT-46-02 | Không có CONTRIBUTING/contribution template (use-cases/dup-check/states/a11y/docs). | `P1` | Design System team | v4.1 kit freeze | `OPEN` | không có CONTRIBUTING.md | — |
| ISS-KIT-46-03 | KIT-46-03 | Không có acceptance-criteria matrix phân biệt token/component/pattern. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | mobile-ui-construction-contract.md; _adherence.oxlintrc.json | — |
| ISS-KIT-46-04 | KIT-46-04 | Không có version-bump/approval/migration-note process cho breaking change. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | readme.md:7 | — |
| ISS-KIT-47-01 | KIT-47-01 | Không có tooling scan duplicate định kỳ; scan thủ công chỉ thấy semantic alias by-design. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | _adherence.oxlintrc.json; tokens/colors.css,spacing.css,radius.css | — |
| ISS-KIT-47-02 | KIT-47-02 | Không có bảng deprecation cấu trúc (replacement/reason/since-version/removal-target). | `P1` | Design System team | v4.1 kit freeze | `OPEN` | readme.md:13,57 | — |
| ISS-KIT-47-03 | KIT-47-03 | Không có governance/lint rule chặn new usage của artifact deprecated. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | readme.md:13; _adherence.oxlintrc.json | — |
| ISS-KIT-47-05 | KIT-47-05 | Không có usage-scan-before-removal process hay báo cáo usage=0 trước khi xóa. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | readme.md:7; ui_kits/memox-app/_features/README.md | — |
| ISS-KIT-48-04 | KIT-48-04 | Coverage evidence tồn tại (shots/specs/contrast) nhưng chưa tập hợp thành coverage report phát hành. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | shots/; tool/ui_kit_shots/contrast.mjs | — |
| ISS-KIT-48-05 | KIT-48-05 | Không có changelog, migration/deprecation notes hay version metadata cho release. | `P1` | Design System team | v4.1 kit freeze | `OPEN` | _ds_manifest.json không có version | — |
| ISS-KIT-01-02 | KIT-01-02 | Không có trường trạng thái Current/Future/Deprecated cho artifact; kit là một release v4 duy nhất nên mọi artifact ngầm là Current. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | _ds_manifest.json (không có field status); readme.md; SKILL.md | — |
| ISS-KIT-01-06 | KIT-01-06 | Thiếu scope matrix Supported/Not supported/Planned cho tablet, platform và accessibility; chỉ nêu mobile 390x780 portrait và target React Native. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | readme.md:3-5; ui_kits/memox-app/README.md:3 | — |
| ISS-KIT-02-06 | KIT-02-06 | Không có changelog/release-notes/version-history chứng minh snapshot v4 đóng băng; chỉ có version trong tên thư mục và policy frozen/additive-only. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | MemoX Design System_v4/ (tên thư mục); tokens/*.css header 'Names frozen'; không có changelog | — |
| ISS-KIT-04-05 | KIT-04-05 | motion.css có duration + easing nhưng không có reduced-motion value/token ở tầng primitive; reduced-motion chỉ xử lý ở 2 media-query mức component. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | tokens/motion.css:8-23; components.css:206-210,1098 | — |
| ISS-KIT-07-05 | KIT-07-05 | Regression gate (contrast.mjs light+dark) tồn tại nhưng không có new-theme onboarding checklist hay sample completed run. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | tool/ui_kit_shots/contrast.mjs; readme.md:92; SKILL.md | Add theme-onboarding checklist + one completed sample run. |
| ISS-KIT-09-04 | KIT-09-04 | Font stack phủ Vietnamese nhưng không có per-script (CJK/RTL) fallback list và không có per-script screenshots. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | tokens/typography.css:15-16 | Document script scope + fallback fonts; capture per-script shots. |
| ISS-KIT-09-05 | KIT-09-05 | Không có 200% text-scaling before/after evidence; kit dùng fixed px sizes và fixed-height controls. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | tokens/typography.css:20-28; tokens/component.css | Run 200% scaling; capture before/after; log clipping. |
| ISS-KIT-09-06 | KIT-09-06 | Truncation cục bộ có trong CSS nhưng không có wrapping/truncation/max-lines matrix per component. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | components.css:118-121,128-129,1020-1059 | Author truncation matrix; verify vs long strings. |
| ISS-KIT-10-03 | KIT-10-03 | Raw px không tag trong cappbar__badge (5/7/16/10/4px) và cappbar__search height 40px lệch scale, thiếu raw-ok exception. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | components.css:149-174,182 | Tokenize hoặc tag raw-ok; re-scan numeric vs scale. |
| ISS-KIT-11-01 | KIT-11-01 | Fluid layout + gutter 16 có, nhưng không có phone viewport range grid spec; shots single-width 390x780. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | tokens/spacing.css:22; components.css:654 | Document viewport range; capture min/default/max shots. |
| ISS-KIT-11-05 | KIT-11-05 | Không có phone-landscape evidence và không có max-readable-width cho reading/form content. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | tokens/size.css (chỉ modal max-width) | Document orientation scope; add max readable width. |
| ISS-KIT-13-05 | KIT-13-05 | Kit không có RTL support hay LTR/RTL samples; directional icons (chevron_right, arrow_back) không mirror. Product LTR-only. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | grep rtl\|direction\|dir=\|mirror\|scaleX = 0 | — |
| ISS-KIT-14-05 | KIT-14-05 | Không có brand logo/app-icon asset; chỉ Extrabold wordmark, không có clear-space/min-size/dark-bg variant spec. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | readme.md:91,67 | — |
| ISS-KIT-15-06 | KIT-15-06 | Dialog/sheet composites lặp lại >=3 feature ở feature layer mà không có candidate-promotion report vào core kit. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | readme.md:99 (_shared list) | — |
| ISS-KIT-16-04 | KIT-16-04 | Chỉ MxContextualAppBar có text/action constraints; không có kit-wide constraint matrix cho card/list. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | MxContextualAppBar.d.ts; components.css btn/chip nowrap (332,712) | — |
| ISS-KIT-16-06 | KIT-16-06 | Không có invalid-combination/nested-interactive rule; MxCard role=button+tabIndex có thể nest interactive children không guard. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | MxCard.jsx a11y block | — |
| ISS-KIT-17-05 | KIT-17-05 | Không có supported/excluded property-combination matrix; TS unions ràng buộc value nhưng combo vô nghĩa không được doc. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | .d.ts prop unions + .prompt.md | — |
| ISS-KIT-18-04 | KIT-18-04 | Chip và segmented thiếu disabled/unavailable state; không có checkbox/radio nên indeterminate N/A. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | MxSwitch disabled (components.css 830); MxChip no disabled | — |
| ISS-KIT-19-03 | KIT-19-03 | Không có drag/reorder pattern (handle, picked, drop target, cancel); ordering chỉ qua SortSheet. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | grep no drag/reorder; library sort-sheet | — |
| ISS-KIT-20-04 | KIT-20-04 | Date/time/relative-time hardcode literal trong fixtures; không có locale-format layer. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | SyncBlock.jsx:33; Library.jsx:68; appbar 'Saturday · 27 Jun' | — |
| ISS-KIT-20-06 | KIT-20-06 | Count+noun ghép từ fragment không có pluralization/composition spec (localization grammar risk). | `P2` | Design System team | v4.1 kit freeze | `OPEN` | MxContextualAppBar.jsx:76,24; dashboard '142 cards due' | — |
| ISS-KIT-24-05 | KIT-24-05 | Modal navigation có entry nhưng không có nested-modal-stack-limit rule và focus-restoration spec. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | MxContextualAppBar modal variant; shots/app-bar--modal | — |
| ISS-KIT-24-06 | KIT-24-06 | Không có rule preserve vs reset scroll/search/filter khi tab/route change. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | static kit không exercise VM-09 | — |
| ISS-KIT-26-06 | KIT-26-06 | Không có render RTL (dir=rtl). Chip overflow và long label đã xử lý; RTL out-of-scope product LTR. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | Chips.jsx:10; FlashcardList.jsx:28 | — |
| ISS-KIT-29-03 | KIT-29-03 | MenuItem thiếu disabled state và không có rule overflow cho menu dài. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | kit-helpers.jsx:127-138; _shared/SelectSheet.jsx | — |
| ISS-KIT-29-06 | KIT-29-06 | Không có approved/forbidden overlay matrix document. Thực hành mọi fixture chỉ 1 overlay/lúc. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | kit-helpers.jsx:107-113 | — |
| ISS-KIT-32-06 | KIT-32-06 | Không có support statement cho foldable/split-view/hinge. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | grep foldable/split-view/hinge = 0 | — |
| ISS-KIT-33-03 | KIT-33-03 | Reminder time dùng custom TimePickerSheet không có rationale so với OS-native picker; thiếu picker decision table. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | _features/reminder/components/TimePickerSheet.d.ts | — |
| ISS-KIT-33-05 | KIT-33-05 | Không có annotated platform comparison cho typography/icon/touch target. Type/icon/touch đồng nhất cả hai platform nên chỉ thiếu statement. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | tokens/typography.css; Material Symbols; --memox-touch-min:48px | — |
| ISS-KIT-36-05 | KIT-36-05 | Network-offline có fallback nhưng không có capability-state matrix cho device-permission (camera/biometric/notification) bị từ chối. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | SyncBlock.jsx:19 offline fallback | — |
| ISS-KIT-36-06 | KIT-36-06 | Scope phone-portrait là giả định im lặng; không có statement portrait-only hay landscape/tablet unsupported. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | readme KNOWN CAVEATS chỉ nêu logo/copy/validation | — |
| ISS-KIT-38-04 | KIT-38-04 | Không có swipe/drag gesture motion; không chứng minh follow-finger/cancel-return. Mọi action button-driven. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | components.css; specs/* | — |
| ISS-KIT-43-01 | KIT-43-01 | Component docs thiếu when-not-to-use; chỉ MxContextualAppBar có, ~16/18 component không. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | components/*/*.prompt.md; MxContextualAppBar.prompt.md:22-27 | — |
| ISS-KIT-43-03 | KIT-43-03 | Không có state matrix/platform(RN) adaptation per component trong prompt.md. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | components/*/*.prompt.md; readme.md:55 | — |
| ISS-KIT-43-04 | KIT-43-04 | Content limits, localization và RTL không ghi per component; RTL vắng toàn bộ. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | MxTextField.prompt.md:24 | — |
| ISS-KIT-43-05 | KIT-43-05 | Do/don't và edge-case examples chỉ hệ thống hoá cho MxContextualAppBar. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | components/*/*.prompt.md | — |
| ISS-KIT-43-06 | KIT-43-06 | Component doc thiếu version, owner và deprecation status. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | components/*/*.d.ts; _ds_manifest.json | — |
| ISS-KIT-44-01 | KIT-44-01 | Pattern specs thiếu entry/exit conditions tường minh. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | specs/dashboard.md:9-22 | — |
| ISS-KIT-44-02 | KIT-44-02 | Flow step-by-step và back/cancel/retry không được mô tả; spec chỉ là state gallery. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | specs/*.md | — |
| ISS-KIT-44-03 | KIT-44-03 | Không có decision table cho screen nhiều nhánh (study-session, import). | `P2` | Design System team | v4.1 kit freeze | `OPEN` | specs/study-session.md, import.md | — |
| ISS-KIT-44-05 | KIT-44-05 | Responsive/platform/localization/accessibility adaptation không được link per pattern. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | specs/dashboard.md:40-44 | — |
| ISS-KIT-45-05 | KIT-45-05 | Không có asset export spec table (dimensions/scale/fallback); thiếu logo/app-icon asset. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | _ds_manifest.json fonts; readme.md:91 | — |
| ISS-KIT-46-06 | KIT-46-06 | Ngoại lệ parity không có expiry/follow-up; không có exception register cấp kit. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | tool/parity/parity-allowlist.json; REMAINING-DIVERGENCES.md | — |
| ISS-KIT-47-04 | KIT-47-04 | Migration mô tả văn xuôi; không có migration map old→new nêu visual/behavior diffs. | `P2` | Design System team | v4.1 kit freeze | `OPEN` | readme.md:13,57 | — |
| ISS-KIT-04-06 | KIT-04-06 | Token tên theo element/component (--memox-appbar-height, --memox-bottom-nav-height, --memox-fab-size) đặt lẫn trong tầng primitive spacing. | `P3` | Design System team | v4.1 kit freeze | `OPEN` | tokens/spacing.css:26-29 | — |
| ISS-KIT-05-05 | KIT-05-05 | Feedback token --memox-success bị tái dùng làm data-viz chart tone trong Donut, vi phạm tách feedback khỏi data-visualization palette. Tác động thấp (completion ring xanh success hợp semantic) nên P3. | `P3` | Design System team | v4.1 kit freeze | `OPEN` | _features/statistics/components/Donut.jsx:7; tokens/colors.css:48 | — |
| ISS-KIT-33-02 | KIT-33-02 | Không có platform flow recordings cho back gesture/modal/navigation. | `P3` | Design System team | v4.1 kit freeze | `OPEN` | một presentation duy nhất | — |
| ISS-KIT-38-02 | KIT-38-02 | Push/pop/modal/pane transition không được implement hay ghi lại; duration scale có nhưng không có clip. | `P3` | Design System team | v4.1 kit freeze | `OPEN` | tokens/motion.css:8-23 | — |
| ISS-KIT-40-06 | KIT-40-06 | Ngoại lệ ghi lý do trong readme caveats nhưng thiếu owner/target/governance metadata; không có exception register. | `P3` | Design System team | v4.1 kit freeze | `OPEN` | readme.md KNOWN CAVEATS | — |
| ISS-KIT-46-05 | KIT-46-05 | Release cadence, changelog, sign-off và consumer notification không được định nghĩa. | `P3` | Design System team | v4.1 kit freeze | `OPEN` | không có CHANGELOG | — |
| ISS-KIT-47-06 | KIT-47-06 | Không có duplicate-resolution record/process (chọn canonical, merge, update inventory). | `P3` | Design System team | v4.1 kit freeze | `OPEN` | toàn kit | — |

Status: `OPEN`, `FIXED`, `ACCEPTED`.
