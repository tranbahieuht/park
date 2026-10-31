# Bàn giao 5 feedback Savills ngày 30/10/2026

Đã triển khai trong repository local, giữ bố cục tổng thể và hai màn Savills hiện có. Chưa commit, push, merge hoặc deploy.

| STT | Feedback | File chỉnh sửa | Trạng thái |
| --- | --- | --- | --- |
| 1 | Thêm logo Savills chính thức cạnh Norton Park trên header | `sections/Nav.tsx`, `styles/feedback.css`, asset logo | COMPLETED |
| 2 | Thay logo trong bảng thông tin bản đồ | `public/sites/nortonpark/assets/map/location-map.html`, asset logo | COMPLETED |
| 3 | Đổi nguyên văn tiêu đề/nội dung cam kết 02 VI/EN | `data/i18n.ts` | COMPLETED |
| 4 | Cam kết 01 dùng Chủ đầu tư Gamuda Land / Developer Gamuda Land | `data/i18n.ts` | COMPLETED |
| 5 | Logo Savills ở footer, bỏ FAQ, chỉ giữ Chính sách bảo mật trong cột pháp lý | `sections/Footer.tsx`, `styles/feedback.css`, asset logo | COMPLETED |

Các đường dẫn `sections/`, `styles/`, `data/` trong bảng tính từ `src/components/sites/nortonpark/`.

## Logo chính thức

- File tải về: `SAV_Logo_RGB.ai`, 83.154 byte, từ [link trong tài liệu khách hàng](https://drive.google.com/file/d/1-v392j8gepGHwilplIlfDLtB6CuAvqIb/view).
- Link trong tệp yêu cầu dán bị nhầm một số ký tự và trả 404. ID đúng được đọc từ [tài liệu gốc có feedback 30/10](https://docs.google.com/document/d/12kOHI90qXGxlKOGJKBEgc8eduGTRzvEiC1wND0CvYDU/edit), không tự đoán hoặc tìm logo thay thế.
- Asset mới: `public/sites/nortonpark/assets/logos/savills-client-original.ai` (bản gốc) và `public/sites/nortonpark/assets/logos/savills-client.png` (1181×1181, 35.922 byte).
- File AI có lớp PDF tương thích. Dùng Poppler render ở 300dpi và chỉ loại phần giấy trắng bên ngoài logo. Không vẽ lại logo, tái tạo chữ, đổi màu bằng CSS hoặc kéo giãn ảnh.
- Cả ba vị trí được yêu cầu dùng cùng PNG. Header giữ logo Norton Park và tất cả controls; logo trên bản đồ địa lý đánh dấu Norton Park giữ nguyên.
- Logo trong popup giữ nguyên theo yêu cầu đã thực hiện trước đó; lần này chỉ sửa đúng ba vị trí logo được nêu trong 5 feedback mới.

## Nội dung đã xác nhận

Cam kết 02 VI: **Đặc quyền giỏ hàng đẹp nhất:** — “Khách hàng được tiếp cận sớm nhất với các quỹ căn ở vị trí tầng đẹp nhất dự án.”

Cam kết 02 EN: **Exclusive Access to the Best Units:** — “Early access to select apartments on the most desirable floors of the development.”

Cam kết 01 chỉ thay cụm chủ đầu tư theo yêu cầu, giữ tiêu đề và phần câu còn lại. Mục 03, nội dung giới thiệu Savills, tài liệu pháp lý khác, dữ liệu liên hệ và copyright không thay đổi.

Footer giữ bốn cột, điều chỉnh tỷ lệ cho logo vuông; mobile vẫn xếp theo thứ tự logo, liên hệ, khám phá/pháp lý. Dòng copyright mobile có khoảng trống bên phải để hai nút nổi không che chữ. Cột pháp lý chỉ còn link `https://savills-hub.com.vn/privacy-policy/`; không xóa module pháp lý hoặc FAQ ở nơi khác.

## Danh sách file thay đổi

1. `src/components/sites/nortonpark/sections/Nav.tsx`
2. `src/components/sites/nortonpark/sections/Footer.tsx`
3. `src/components/sites/nortonpark/data/i18n.ts`
4. `src/components/sites/nortonpark/styles/feedback.css`
5. `public/sites/nortonpark/assets/map/location-map.html`
6. `public/sites/nortonpark/assets/logos/savills-client-original.ai` — mới.
7. `public/sites/nortonpark/assets/logos/savills-client.png` — mới.
8. `docs/research/nortonpark/savills-feedback-2026-10-30.md` — báo cáo này.

## Kiểm thử

- `npm run lint -- src scripts`: PASS, kiểm tra mã nguồn ứng dụng và scripts; không coi đây là lint cho toàn bộ thư mục archive/đầu vào trong repository.
- `npm run typecheck`: PASS.
- `npm run build`: PASS, trang `/` và route `/api/leads`.
- `node --test scripts/leads.test.mjs scripts/location-map-i18n.test.mjs`: PASS, 12/12 test.
- `git diff --check`: PASS. Thay đổi có sẵn trong `New folder/input-extracted/a/a` giữ nguyên.
- Chrome headless: 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844, 375×812, 320×740, mỗi kích thước ở VI và EN: tổng 18 tổ hợp. Kiểm tra hai logo và controls header không chồng/tràn, tỷ lệ logo vuông, nội dung cam kết chính xác, footer không FAQ và chỉ một link pháp lý, không tràn ngang.
- Bản đồ mobile: mở bảng thông tin bằng handle gốc để kiểm tra logo; không thay hành vi thu gọn mặc định. Logo hiển thị đúng trong bảng đã mở, cả VI/EN.
- Bản đồ: đã bấm zoom in, zoom out, reset, tab thời gian/bộ lọc/nổi bật và một địa điểm để mở thẻ thông tin. Fullscreen API của iframe vào/thoát được; thuộc tính `allow="fullscreen"` giữ nguyên.
- So sánh với Git HEAD: toàn bộ script/data của bản đồ không đổi sau chuẩn hóa CRLF/LF; SVG địa lý không đổi. Chỉ đổi thẻ logo bảng thông tin và CSS cho kích thước logo đó.
- Navigation/sidebar vẫn đủ 6 mục; link 360 Tour header/sidebar và 7 link khám phá footer được giữ. Không thay implementation của 360 Tour hoặc calculator bên ngoài.
- Cả popup và form đăng ký trên trang: validation rỗng, lỗi API 503, không báo thành công sai, giữ dữ liệu, thử lại và thành công với `{ok:true, code:"ACCEPTED"}` đều PASS bằng mock API. Đổi EN vẫn giữ dữ liệu form. Không gửi lead/email thật.
- Không ghi nhận ngoại lệ JavaScript hoặc asset HTTP lỗi trong các lượt kiểm tra giao diện. Kiểm tra thêm dòng copyright mobile không giao với vùng nút nổi sau chỉnh sửa cuối.
- Hình QA và scripts cục bộ nằm trong `temp/` (Git ignore), gồm `header-30-desktop.png`, `map-30-1440-vi.png`, `map-30-375-en.png`, `footer-30-1440-vi.png`, `footer-30-mobile-final.png`, `qa-feedback-30.cjs`, `qa-map-30.cjs`, `qa-forms-30.cjs`.

## Giới hạn còn lại

- Backend SMTP, validation, chống lạm dụng, các biến môi trường và hook gửi lead không bị sửa. Test server dùng SMTP stub; browser dùng mock API. Chưa kiểm chứng gửi thư thật/inbox vì môi trường local không có cấu hình SMTP thực tế.
- Cần nghiệm thu trên thiết bị iOS/Android thực tế; lượt responsive hiện tại chạy trên Chrome headless. Chưa kiểm thử toàn bộ hành trình bên trong dịch vụ 360 Tour bên ngoài.
- `next start` có cảnh báo sẵn có do cấu hình `output: standalone`; không thay cấu hình triển khai ngoài phạm vi. Preview local phục vụ các lượt kiểm tra bình thường tại cổng 3106.
- Không còn asset hoặc nội dung khách hàng bị thiếu cho 5 feedback này.
