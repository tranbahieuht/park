# Tối ưu hệ thống logo Norton Park / Savills

Thực hiện ngày 30/10/2026 (Asia/Saigon), tiếp nối các feedback đã triển khai. Không commit, push, merge hoặc deploy.

## Phân loại toàn bộ vị trí

| Vị trí | Nhận diện áp dụng | Thực hiện |
| --- | --- | --- |
| Header | Norton Park và Savills | Cụm co-brand: Norton Park giữ vai trò chính, Savills vuông nhỏ hơn, có nét dọc 1px và khoảng trắng cân đối. |
| Popup đăng ký | Chỉ Savills | Thay biểu tượng quả chò đang còn ở popup bằng file Savills chính thức; logo căn giữa, rộng 60px. |
| Footer | Chỉ Savills | Component dùng chung, kích thước theo ngữ cảnh 72–88px; giữ liên hệ, privacy và copyright hiện tại. |
| Bảng thông tin bản đồ | Chỉ Savills | Cùng asset và stylesheet hình học với component React; 52px desktop, 44px mobile khi mở bảng. |
| Sidebar | Norton Park | Giữ nhận diện đã xác nhận; chuyển sang component dùng chung, không thêm Savills vào sidebar. |
| Dấu vị trí trên SVG bản đồ | Norton Park | Không sửa SVG, tên hoặc biểu tượng địa lý của dự án. |
| Ảnh vị trí và chứng nhận | Nhận diện trong ảnh gốc | Giữ nguyên ảnh chính thức, không phủ thêm logo hoặc sửa màu trong ảnh. |
| Các section dự án | Biểu tượng quả chò | Giữ các họa tiết/biểu tượng Norton Park ở Facts, Blocks, Lifestyle, Position, Residences, News, Calc và Developer. |
| Gamuda Land và đối tác | Logo chính thức từng đơn vị | Giữ nguyên logo Gamuda Land và các đối tác ở section Developer. |

## Cách thiết kế và tái sử dụng

- Thêm `BrandLogo` với ba biến thể `norton`, `savills`, `cobrand`.
- Hỗ trợ nền `dark`, `light`, `auto`; `auto` theo đúng class `is-solid` sẵn có của header. Chỉ chuyển giữa hai file Norton Park chính thức, không dùng filter đổi màu. Logo Savills giữ nguyên nền vàng và chữ đỏ.
- Hỗ trợ `nortonWidth`, `savillsSize`, `gap`, `className`, `loading`, `hidden`; giữ tỷ lệ artwork bằng width/height gốc và `object-fit: contain`.
- Norton Park có tên truy cập qua wrapper `role="img"`; Savills có `alt="Savills"`. Link về đầu trang có tên “Norton Park — Savills”. Divider bị ẩn khỏi cây accessibility.
- Header desktop: Norton Park rộng 160–216px, Savills 36px, nét phân cách cao 22–30px và opacity .22. Chiều cao header vẫn dùng token cũ.
- Mobile: ưu tiên chiều rộng Norton Park 88–118px, Savills 28px; tại màn ≤360px, Savills 25px và gap 3px. Không ẩn logo; thu gọn padding CTA ở ngưỡng này để nhãn EN “Enquire” không chạm cụm thương hiệu.
- Không thêm nền vàng ngoài artwork, shadow/glow, border-radius, zoom, xoay hoặc animation riêng cho logo. Hai logo nằm trong một cụm; hiệu ứng nền và nhận diện header khi cuộn giữ nguyên.
- Bản đồ là HTML độc lập trong iframe, không mount React. Markup tương ứng sử dụng chung `public/sites/nortonpark/brand-logo.css` và asset để đồng bộ thay vì tạo bản sao bộ quy tắc kích thước/tỷ lệ.

## File chỉnh sửa trong lần tối ưu này

1. `src/components/sites/nortonpark/BrandLogo.tsx` — component mới.
2. `public/sites/nortonpark/brand-logo.css` — stylesheet mới, dùng chung cho trang và iframe.
3. `src/app/layout.tsx` — import stylesheet logo.
4. `src/components/sites/nortonpark/sections/Nav.tsx` — cụm co-brand và link home chung.
5. `src/components/sites/nortonpark/overlays/Drawer.tsx` — tái sử dụng biến thể Norton Park.
6. `src/components/sites/nortonpark/overlays/Popup.tsx` — Savills chính thức qua component.
7. `src/components/sites/nortonpark/sections/Footer.tsx` — Savills qua component.
8. `src/components/sites/nortonpark/styles/feedback.css` — bỏ các kích thước logo lặp, căn giữa popup và điều chỉnh ngưỡng hẹp.
9. `public/sites/nortonpark/assets/map/location-map.html` — markup logo và import CSS chung; không sửa JS/SVG.
10. `docs/research/nortonpark/cobrand-logo-review-2026-10-30.md` — báo cáo này.

Không tạo asset ảnh mới. Tái sử dụng `savills-client.png` từ file AI chính thức đã tải trong feedback trước, cùng hai SVG Norton Park hiện có. Các thay đổi chưa commit từ feedback trước được giữ nguyên, gồm nội dung cam kết và footer đã rút gọn.

## Kiểm thử

- `npm run lint -- src scripts`: PASS cho mã nguồn ứng dụng và scripts; không khẳng định đã lint toàn bộ archive/đầu vào ngoài phạm vi.
- `npm run typecheck`: PASS.
- `npm run build`: PASS, gồm `/` và `/api/leads`.
- `node --test scripts/location-map-i18n.test.mjs scripts/leads.test.mjs`: PASS, 12/12.
- `git diff --check`: PASS.
- Responsive trên Chrome headless: 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844, 375×812, 320×740. Kiểm tra VI/EN ở cả nền ảnh tối và nền header sáng: 36 tổ hợp header qua các lượt kiểm tra.
- Đã phát hiện chạm nhẹ ở bản EN trên 320px, điều chỉnh riêng ngưỡng ≤360px và kiểm tra lại cả VI/EN, hai trạng thái sáng/tối. Không còn chồng logo/controls hoặc tràn ngang; không ẩn Savills hay nút chức năng.
- Kiểm tra header chuyển đúng file Norton Park sáng/tối, Savills giữ hình vuông, divider không chiếm vùng nút; cụm logo căn giữa khu vực thương hiệu, chiều cao header không tăng.
- Kiểm tra sidebar giữ logo Norton Park và kích thước hợp lệ; footer chỉ Savills; bảng bản đồ mobile được mở bằng handle gốc và hiển thị Savills đúng ngôn ngữ. Các ảnh được decode thành công, không lỗi asset trong các lượt kiểm tra.
- Popup kiểm tra cả desktop/mobile: chỉ logo Savills, căn giữa theo cột form, giữ nút đóng và không có logo Norton Park còn sót ở vị trí logo popup.
- Không ghi nhận ngoại lệ JavaScript trong lượt kiểm tra. Bộ test lead và bản đồ vẫn PASS. Không sửa nội dung cam kết, contact, API SMTP, logic scroll/reveal, điều hướng section hoặc 360 Tour trong lần tối ưu này.
- Bằng chứng local ở `temp/` (Git ignore): `cobrand-header-1440-light.png`, `cobrand-header-1440-dark.png`, `cobrand-header-375-light.png`, `cobrand-header-320-light.png`, `cobrand-popup-desktop.png`, `cobrand-popup-mobile.png`, `qa-cobrand.cjs`.

## Giới hạn

Kiểm thử responsive được thực hiện bằng Chrome headless, chưa nghiệm thu trực tiếp trên iOS/Android. Không gửi mail SMTP thật hoặc kiểm thử lại toàn bộ dịch vụ 360 Tour bên ngoài vì các chức năng đó không thay đổi. Cảnh báo `next start` với cấu hình `output: standalone` là cảnh báo sẵn có; preview local phục vụ được tại cổng 3107.
