# KIT-42 — Accessibility End-to-End

## Phạm vi

Audit task flow hoàn chỉnh, không lặp semantics từng component của KIT-21.

## Checklist

- [ ] **KIT-42-01 — Representative create/edit/list/detail task có reading order và headings hợp lý.**
  - **Cách kiểm:** VM-10 + VM-09 — walkthrough bằng screen-reader model/spec.
  - **Evidence mong đợi:** Bằng chứng thứ tự đọc của tác vụ.
  - **Severity mặc định nếu không đạt:** `P0`

- [ ] **KIT-42-02 — Toàn bộ task hoàn thành được bằng focus/keyboard profile mà không dead end.**
  - **Cách kiểm:** VM-10 + VM-09 — keyboard-only walkthrough.
  - **Evidence mong đợi:** Video hoặc log thứ tự focus.
  - **Severity mặc định nếu không đạt:** `P0`

- [x] **KIT-42-03 — Critical task không phụ thuộc gesture precision, color, haptic hoặc motion duy nhất.**
  - **Cách kiểm:** VM-10 — disable each cue and retry task.
  - **Evidence mong đợi:** Ma trận tín hiệu thay thế.
  - **Severity mặc định nếu không đạt:** `P0`

- [ ] **KIT-42-04 — Form error, progress, success và failure được announce ở đúng thời điểm.**
  - **Cách kiểm:** VM-10 + VM-09 — force task outcomes.
  - **Evidence mong đợi:** Bằng chứng thời điểm thông báo accessibility.
  - **Severity mặc định nếu không đạt:** `P0`

- [ ] **KIT-42-05 — 200% text, dark/high contrast và reduced motion vẫn hoàn thành task.**
  - **Cách kiểm:** VM-08 + VM-15 — rerun representative flows.
  - **Evidence mong đợi:** Video kiểm tra theo các profile accessibility.
  - **Severity mặc định nếu không đạt:** `P1`

- [ ] **KIT-42-06 — P0/P1 accessibility issues có owner, retest evidence và release gate.**
  - **Cách kiểm:** VM-13 — inspect issue register/sign-off.
  - **Evidence mong đợi:** Biên bản phê duyệt accessibility.
  - **Severity mặc định nếu không đạt:** `P1`

## Evidence Log

| Checklist ID | Evidence link / file | Kết quả | Ghi chú |
|---|---|---|---|
| KIT-42-01 | `components/surfaces/MxContextualAppBar.jsx:72-76` (title là div, không heading); screens không phát heading landmark; `readme.md` (no navigation logic yet) | FAIL | Reading order theo DOM nhưng screen thiếu heading role; không có screen-reader walkthrough của task lắp ráp. |
| KIT-42-02 | `components/**` keyboard-operable (Enter/Space handler MxCard/MxSectionHeader); nhưng không có routing/nav để chạy task hoàn chỉnh | FAIL | Không thể chứng minh task hoàn thành bằng keyboard mà không dead end; không có focus-order log. |
| KIT-42-03 | `shots/flashcard-list--offline--light.png` (badge "Due/Mastered/New" text+màu); `MxTextField.jsx:47` (role=alert text); mọi action là button | PASS | Có tín hiệu thay thế non-color; không có critical path chỉ dựa gesture/haptic/motion/color. |
| KIT-42-04 | `flashcard-editor/**` (3 role=status/alert); `export/`,`import/`,`study-result/` = 0 aria-live/role; timing không kiểm chứng được ở kit tĩnh | FAIL | Announcement chỉ có ở editor; success/failure/progress của các flow khác không announce. |
| KIT-42-05 | Không có high-contrast profile (KIT-39-05); không có shot 200% text; reduced-motion không đủ (KIT-38-06) | FAIL | Không xác nhận được task hoàn thành dưới 200% text / high-contrast / reduced-motion. |
| KIT-42-06 | Không có accessibility issue register / sign-off / release gate trong kit | FAIL | Thiếu biên bản phê duyệt accessibility với owner, retest và release gate. |

## Kết luận nhóm

```text
Final status: BLOCKED
Open P0: ISS-KIT-42-01, ISS-KIT-42-02, ISS-KIT-42-04
Open P1: ISS-KIT-42-05, ISS-KIT-42-06
Open P2:
Open P3:
Reviewed by: Claude (automated kit audit)
Reviewed date: 2026-07-16
```
