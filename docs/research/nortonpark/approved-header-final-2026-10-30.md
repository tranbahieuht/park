# Hoàn thiện cụm logo header theo phương án đã chốt

Ngày kiểm tra: 30/10/2026, Asia/Saigon. Chỉ hoàn thiện phương án `Norton Park | Savills` trên nền navy #25273A. Không thêm bố cục khác, nội dung doanh nghiệp hoặc hiệu ứng mới.

## Kết quả

- Norton Park nằm bên trái, dùng đúng SVG sáng hiện có; Savills bên phải dùng PNG chính thức từ file AI khách hàng cung cấp, nguyên nền vàng/chữ đỏ.
- Cụm ngang trên nền navy phẳng, padding hai bên cân đối; nét dọc 1px cao 24px ở desktop, 18–20px ở mobile, màu trung tính và opacity .22.
- Bỏ hoàn toàn hàng nhãn phân phối, markup endorsement, khóa i18n tương ứng và CSS từ phương án hai tầng. Không thêm slogan, border, shadow, glow, gradient, bo góc hoặc animation riêng.
- Dùng lại `BrandLogo`, rút gọn lựa chọn nền sáng/tối thành chọn đúng asset, bỏ hai ảnh chồng nhau và CSS đổi logo theo header vốn không còn cần thiết.
- Grid header có hai cột biên cân nhau để cụm thương hiệu nằm chính giữa phần viewport hiển thị, không bị nội dung các nút bên phải đẩy lệch. Giữ nguyên token chiều cao header và cơ chế `is-solid` khi cuộn.
- Tại màn hẹp, logo thu nhỏ đúng tỷ lệ, khoảng cách và padding CTA được điều chỉnh vừa đủ; không ẩn Savills, nút VI/EN, 360 Tour, Tư vấn hoặc Menu.
- Các vị trí chỉ dùng Savills (popup, footer, bảng bản đồ) giữ nguyên. Sidebar giữ Norton Park. Hero, section, nội dung cam kết, bản đồ, 360 Tour và backend SMTP không thay đổi trong lần này.

## File thay đổi trong lần hoàn thiện này

1. `src/components/sites/nortonpark/BrandLogo.tsx` — bố cục ngang, bỏ nhãn và API của phương án endorsement; tái sử dụng asset sáng chính thức.
2. `public/sites/nortonpark/brand-logo.css` — nền navy, divider, kích thước và khoảng cách responsive; loại CSS hai tầng và tự đổi màu logo.
3. `src/components/sites/nortonpark/sections/Nav.tsx` — dùng biến thể sáng, khôi phục tên truy cập Norton Park — Savills, bỏ nhãn phụ.
4. `src/components/sites/nortonpark/data/i18n.ts` — chỉ bỏ hai khóa nhãn phân phối không còn dùng. Giữ các bản dịch/nội dung khác từ feedback trước.
5. `src/components/sites/nortonpark/styles/page.css` — định nghĩa grid cân giữa tại một nơi; bỏ các selector `.brand`, `.brand-light`, `.brand-dark` cũ không còn sử dụng.
6. `src/components/sites/nortonpark/styles/feedback.css` — bỏ grid lặp; điều chỉnh khoảng đệm ở các ngưỡng hẹp để giữ đủ logo và controls.
7. `docs/research/nortonpark/approved-header-final-2026-10-30.md` — báo cáo này.

Không tạo, đổi màu hoặc ghi đè asset logo. Những thay đổi chưa commit từ các feedback trước được giữ nguyên; danh sách Git hiện tại có thể bao gồm các file của những lượt đó.

## Kiểm thử

- `npm run lint -- src scripts`: PASS cho mã nguồn ứng dụng và scripts; không bao gồm archive/đầu vào ngoài phạm vi.
- `npm run typecheck`: PASS.
- `npm run build`: PASS, Next.js 16.3.5, trang `/` và API `/api/leads`.
- `git diff --check`: PASS.
- `node --test scripts/location-map-i18n.test.mjs scripts/leads.test.mjs`: PASS, 12/12.
- Chrome headless tại 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844 và 375×812, VI/EN, trước/sau cuộn: 32 tổ hợp yêu cầu PASS. Kiểm tra thêm 320×740 ở cả hai ngôn ngữ/trạng thái: 4 tổ hợp bổ sung PASS.
- Kiểm tra bằng DOM: đúng navy `rgb(37,39,58)`, không shadow/gradient, không còn nhãn; Norton Park dùng SVG sáng ở cả hai trạng thái; hai logo cùng trục dọc, khoảng cách hai bên divider bằng nhau, Savills vuông, cụm nằm gọn chiều cao header.
- Cụm được căn giữa header ở toàn bộ 8 kích thước yêu cầu; không chồng controls, không tràn ngang, không mất VI/EN hoặc nút chức năng. Ở màn bổ sung 320px, dùng cột thương hiệu còn lại để giữ cả hai nhận diện và tất cả controls.
- Đối chiếu các kích thước có trong kết quả lượt trước: chiều cao header không tăng. Nền Hero và hiệu ứng nền header khi cuộn được giữ nguyên.
- Kiểm tra sidebar có đủ 6 mục và logo Norton Park; footer vẫn chỉ Savills; URL 360 Tour được giữ. Không ghi nhận ngoại lệ JavaScript hoặc HTTP lỗi trong các lượt kiểm tra.
- Không kiểm thử gửi SMTP thật; không sửa API/mail/env. Các test lead dùng SMTP stub như bộ test hiện có.

Ảnh và dữ liệu QA local trong `temp/` (Git ignore): `approved-header-1440-vi-light.png`, `approved-header-1440-vi-dark.png`, `approved-header-375-en-light.png`, `approved-header-results.json`, `qa-approved-header.cjs`.

Preview local tại cổng 3109. `next start` có cảnh báo sẵn có với cấu hình `output: standalone`, không ảnh hưởng các lượt kiểm tra local. Chưa commit, push, merge hoặc deploy. Nghiệm thu thiết bị iOS/Android thật chưa nằm trong lượt Chrome headless này.
