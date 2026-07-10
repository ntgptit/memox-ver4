# Mobile UI Construction Contract

Bạn không được chỉ xây dựng UI bằng cách ghép token, theme và shared widget. Trước khi
code mỗi màn hình, phải hoàn thành đầy đủ các bước dưới đây.

> Contract này ràng buộc mọi màn hình mobile trong dự án. Nó bổ sung cho — không thay
> thế — `docs/design/MemoX Design System_v4/` (bộ kit là single source of truth cho token,
> component `Mx*`, typography, spacing, radius, màu). Contract này quy định **quy trình**;
> design kit quy định **giá trị và component**.

## 1. Xác định mục tiêu màn hình

Ghi rõ:

- Primary user objective.
- Primary CTA duy nhất.
- Tối đa hai secondary actions hiển thị trực tiếp.
- Nội dung nào là primary, secondary và metadata.

Nếu không xác định được primary objective, không được bắt đầu code.

## 2. Chọn screen archetype

Chọn một trong các archetype đã có:

- List.
- Detail.
- Form.
- Dashboard.
- Search.
- Selection.
- Settings.
- Focused task/study flow.

Không tự tạo layout đặc biệt nếu một archetype hiện tại đã đáp ứng được.

## 3. Lập composition map

Mô tả màn hình theo thứ tự:

1. App bar hoặc top context.
2. Primary content.
3. Supporting content.
4. Secondary sections.
5. Primary action.
6. Feedback area.

Mỗi section phải có lý do tồn tại. Không thêm card, divider, icon hoặc màu chỉ để trang trí.

## 4. Tuân thủ layout rules

- Screen horizontal padding: 16.
- Section gap: 24 hoặc 32.
- Item gap trong cùng nhóm: 8 hoặc 12.
- Spacing chỉ được dùng: 4, 8, 12, 16, 24, 32, 48.
- Tối đa ba cấp surface lồng nhau.
- Không đặt card trong card nếu không có semantic grouping riêng.
- Touch target tối thiểu 44×44.
- Không hard-code màu, radius, typography hoặc spacing ngoài design system.
- Một màn hình chỉ có một heading cấp cao nhất.
- Một màn hình tối đa năm typography roles.
- Một màn hình tối đa một primary CTA.

## 5. Tuân thủ hierarchy rules

- Primary content phải có visual weight cao nhất.
- Metadata không được cạnh tranh với title.
- Primary CTA phải nổi bật hơn secondary CTA.
- Không dùng quá nhiều bold.
- Không dùng primary color cho decoration.
- Không dùng shadow nếu border hoặc surface contrast đã đủ để phân nhóm.
- Không tạo mọi section thành card.

## 6. Xây dựng state matrix

Mỗi màn hình phải có các fixture phù hợp:

- Loading.
- Loaded normal.
- Loaded minimum data.
- Loaded dense data.
- Empty.
- Recoverable error.
- Long text.
- Large font.
- Narrow device.
- Dark mode nếu được hỗ trợ.

Form phải có thêm:

- Validation error.
- Disabled submit.
- Submitting.
- Submit failure.
- Submit success.

Không được đóng task nếu chỉ triển khai happy path.

## 7. Kiểm tra dữ liệu biên

Phải render và kiểm tra:

- Title dài ba dòng.
- Text tiếng Việt, tiếng Anh và tiếng Hàn.
- Số bằng 0 và số rất lớn.
- Badge hoặc label dài.
- Không có ảnh hoặc ảnh lỗi.
- Danh sách một item và danh sách nhiều item.
- Font scale 1.3 và 1.5.
- Màn hình rộng 320, 360, 390 và 430 px.
- Keyboard mở.
- Safe area có notch và bottom gesture inset.

Không được che nội dung quan trọng bằng ellipsis.

## 8. Visual verification

Sau khi triển khai:

1. Render từng fixture.
2. Chụp screenshot.
3. So sánh với reference screen.
4. Tạo danh sách lỗi có ID.
5. Sửa từng lỗi.
6. Chụp lại screenshot.
7. Chỉ đánh dấu hoàn thành khi đạt toàn bộ visual gate.

Visual gate:

- Không overflow.
- Không spacing ngoài scale.
- Không hard-coded style ngoài token.
- Không touch target dưới chuẩn.
- Không có hai primary actions cạnh tranh.
- Alignment giữa các section nhất quán.
- Typography hierarchy rõ ràng.
- Empty, loading và error state phù hợp với cùng composition.
- Long text không phá vỡ layout.
- Primary action vẫn truy cập được khi keyboard mở.

## 9. Definition of Done

Một màn hình chỉ được coi là hoàn thành khi có đủ:

- Screen plan.
- Chosen archetype.
- Composition map.
- Component map.
- State matrix.
- Fixture data.
- Responsive verification.
- Accessibility verification.
- Screenshots.
- Visual defect report.
- Kết quả sửa defect.
- Test hoặc guard tương ứng.

Không được tự đánh giá bằng các câu như "clean", "modern", "polished" hoặc "looks good".
Mọi kết luận phải chỉ ra rule, fixture hoặc visual gate cụ thể đã đạt.
