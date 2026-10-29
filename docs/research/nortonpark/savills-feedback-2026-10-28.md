# Bàn giao feedback Savills ngày 28/10/2026

Thực hiện và kiểm tra ngày 29/10/2026, múi giờ Asia/Saigon. Thay đổi tại repository local, chưa commit, push, merge hoặc deploy.

## Kết quả 10 yêu cầu

Đường dẫn component trong bảng tính từ `src/components/sites/nortonpark/`.

| STT | Yêu cầu | File đã sửa | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Logo Savills trên header | `sections/Nav.tsx`, `styles/feedback.css`, asset logo | COMPLETED | Giữ logo Norton Park, VI/EN, Tour, CTA và hamburger; logo Savills giữ màu và tỷ lệ gốc. |
| 2 | Bản đồ VI/EN | `sections/Position.tsx`, `data/i18n.ts`, hai asset `location-place-*.webp` | COMPLETED | Thay ảnh chứa nhãn tiếng Việt bằng cặp ảnh VI/EN chính thức. Bản đồ SVG tương tác riêng giữ nguyên cơ chế i18n và trạng thái iframe. |
| 3 | Contact, Fanpage, privacy | `data/contact.ts`, `data/i18n.ts`, `sections/Register.tsx`, `sections/Footer.tsx`, `overlays/LegalDoc.tsx` | COMPLETED | Hotline/email Savills dùng chung; Fanpage có tên và URL đã được người dùng xác nhận trong phiên làm việc; chính sách thuộc Savills. |
| 4 | Chèn ảnh Savills | `sections/Savills.tsx`, `styles/feedback.css`, `assets/images/drive/savills-official.png` | COMPLETED | Ảnh chứng nhận chính thức, hiển thị đầy đủ, không crop, không chèn chữ trùng lên ảnh. Có thể mở ảnh gốc để xem chi tiết. |
| 5 | Thu gọn footer | `sections/Footer.tsx`, `data/i18n.ts`, `styles/feedback.css` | COMPLETED | Bỏ khối doanh nghiệp/phát triển và mô tả hệ thống vận hành; giữ FAQ, điều hướng, liên hệ và liên kết pháp lý cần thiết. Footer Savills đúng nguyên văn VI/EN. |
| 6 | Xóa copyright Skybridge | `sections/Footer.tsx`, `data/i18n.ts` | COMPLETED | Một dòng copyright Savills trong giao diện mỗi ngôn ngữ. Không xóa dữ liệu pháp lý dự án ở các module khác. |
| 7 | Popup tư vấn | `overlays/Popup.tsx`, `overlays/LegalDoc.tsx`, `data/contact.ts`, `data/i18n.ts`, `styles/feedback.css` | COMPLETED | Logo/liên hệ/privacy Savills; giữ dropdown và API lead hiện tại; bổ sung vòng focus bàn phím gồm cả input và select. Kiểm thử gửi mail thật còn phụ thuộc credentials. |
| 8 | Floating actions | `overlays/Fab.tsx`, `data/contact.ts`, `styles/feedback.css` | COMPLETED | Chính xác hai nút Điện thoại/Zalo, aria-label VI/EN; ẩn khi dialog/menu hoặc form được focus để tránh che thao tác. |
| 9 | Sidebar | `overlays/Drawer.tsx`, `data/i18n.ts`, `data/contact.ts` | COMPLETED | Giữ 6 mục điều hướng, 4 CTA và logo Norton Park; bỏ nút chatbot; cập nhật Zalo, giữ gọi Savills và animation/focus/Escape. |
| 10 | Navy Savills | `public/sites/nortonpark/interaction-colors.css`, bản sao trong `assets/map/`, `styles/feedback.css` | COMPLETED | Token `--savills-navy: #25273A`; sửa màu cũ `#2527A3`. Áp dụng vào CTA header/popup, active, hover, focus và điểm nhấn; giữ palette kiến trúc hiện tại. |

## Nguồn tài nguyên và dữ liệu

- [Tài liệu khách hàng có feedback 28/10](https://docs.google.com/document/d/12kOHI90qXGxlKOGJKBEgc8eduGTRzvEiC1wND0CvYDU/edit): xác nhận Zalo `https://zalo.me/1092029419951822931`, thông tin Savills và đường dẫn ảnh gốc.
- [Thư mục landing page](https://drive.google.com/drive/folders/1LMWBTySkG6L06m1Nxp1zeq5b1xdd4BNP), [thư mục bản đồ](https://drive.google.com/drive/folders/1w2_j3cZSsJYr10bbmNuSApOQLftjj_X4), thư mục ảnh dự án thứ hai đã được kiểm tra.
- [Ảnh chứng nhận](https://drive.google.com/file/d/1EhSPfdAq57c8hMoMDh4tIFacRpoYqIzR/view): `Template social post-25.png`, 1920×1920. Link trong tệp dán bị nhầm chữ `I/l`; ID đúng được lấy từ tài liệu và danh sách file Drive, không đoán ID.
- Logo Savills được trích nguyên pixel từ logo vuông có sẵn trong chính ảnh khách hàng cung cấp, vùng 158×158 tại (1598,156). Không vẽ lại, tạo chữ hay đổi màu logo. Dùng ở 30–64px; nên thay bằng bản vector độc lập nếu khách hàng cung cấp thêm sau này.
- Hai ảnh vị trí: `GMDL_NortonPark_place-01.png` (VI, ID `1bmXFAFLt9IO_U9XXLM2kVk7oJYLvfDpc`) và `GMDL_NortonPark_place-02.png` (EN, ID `1vRs1T3LrqodbODipn_OeC1L7eeoxMmr_`). Kiểm tra trực quan nhãn ngôn ngữ, xuất WebP rộng 3200px, quality 94, không crop; giữ khung hiển thị và `object-fit: contain` của section.
- Fanpage do người dùng xác nhận trực tiếp: `https://www.facebook.com/savillsresidentialsales`. Cả Contact, popup và footer dùng cùng cấu hình.
- Địa chỉ dự án vẫn là Số 5 Đại lộ Bình Dương, Phường Thuận Giao, TP. Hồ Chí Minh. Văn phòng tư vấn Savills vẫn là dữ liệu riêng, không dùng thay địa chỉ dự án.

## Danh sách file thay đổi

1. `src/app/layout.tsx` — import CSS feedback sau các stylesheet hiện có.
2. `src/components/sites/nortonpark/data/contact.ts` — Fanpage, Zalo, privacy dùng chung.
3. `src/components/sites/nortonpark/data/i18n.ts` — privacy/footer/nhãn và alt VI/EN.
4. `src/components/sites/nortonpark/sections/Nav.tsx` — hai logo, nhãn truy cập VI/EN.
5. `src/components/sites/nortonpark/sections/Position.tsx` — chọn ảnh theo ngôn ngữ.
6. `src/components/sites/nortonpark/sections/Register.tsx` — Fanpage Savills.
7. `src/components/sites/nortonpark/sections/Savills.tsx` — ảnh chứng nhận chính thức.
8. `src/components/sites/nortonpark/sections/Footer.tsx` — bỏ khối cũ, cập nhật liên hệ và copyright.
9. `src/components/sites/nortonpark/overlays/Popup.tsx` — logo, Fanpage, focus, nhãn VI/EN.
10. `src/components/sites/nortonpark/overlays/Drawer.tsx` — bỏ launcher chatbot, URL Zalo mới, nhãn VI/EN.
11. `src/components/sites/nortonpark/overlays/Fab.tsx` — hai nút liên hệ.
12. `src/components/sites/nortonpark/overlays/LegalDoc.tsx` — bookmark privacy cũ chỉ tới policy Savills, giữ nội dung tài liệu pháp lý khác.
13. `src/components/sites/nortonpark/overlays/ChatWidget.tsx` — đồng bộ URL Zalo trong component hiện có, không xóa module.
14. `src/components/sites/nortonpark/styles/feedback.css` — bố cục hai logo, navy có chọn lọc, ảnh chứng nhận và responsive.
15. `public/sites/nortonpark/interaction-colors.css` — token navy chính xác.
16. `public/sites/nortonpark/assets/map/interaction-colors.css` — token tương ứng trong iframe độc lập.
17. `public/sites/nortonpark/assets/logos/savills-official.png` — logo từ tài nguyên khách hàng.
18. `public/sites/nortonpark/assets/images/drive/savills-official.png` — ảnh chứng nhận gốc.
19. `public/sites/nortonpark/assets/images/drive/location-place-vi.webp` — ảnh vị trí VI.
20. `public/sites/nortonpark/assets/images/drive/location-place-en.webp` — ảnh vị trí EN.
21. `docs/research/nortonpark/savills-feedback-2026-10-28.md` — báo cáo này.

## Build và kiểm thử

- `npm run lint -- src scripts`: PASS. Lint toàn repository không giới hạn quét cả các thư mục đầu vào/lưu trữ lớn như `New folder` và đã được dừng; không thay cấu hình ESLint ngoài phạm vi. Không coi đây là kết quả PASS cho lint toàn bộ archive.
- `npm run typecheck`: PASS.
- `npm run build`: PASS với Next.js 16.3.5, gồm trang `/` và route `/api/leads`.
- `node --test scripts/leads.test.mjs scripts/location-map-i18n.test.mjs`: PASS, 12/12.
- `git diff --check`: PASS; đã xem diff theo phạm vi.
- Kiểm tra trình duyệt Chrome headless trên 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844, 375×812, mỗi kích thước ở cả VI và EN: 16/16 tổ hợp PASS.
- Kiểm tra header không tràn/chồng các bounding box, đủ logo/controls; nút nổi đúng hai; sidebar đủ mục và CTA; iframe cập nhật locale; ảnh vị trí đúng file; ảnh chứng nhận tải được; footer đúng ngôn ngữ; không tràn ngang trang.
- Popup vừa viewport tại cả 8 kích thước, có vùng cuộn khi nội dung dài, không tràn ngang, nút đóng hoạt động. Kiểm tra thêm drawer sau khi kết thúc animation, Escape, Tab và Shift+Tab trong popup, bookmark privacy cũ.
- Chuyển VI → EN → VI: giữ nội dung form landing, dropdown popup và component; Fanpage đúng tên/href tại cả 3 vị trí sau cập nhật cuối cùng.
- Không ghi nhận `pageerror` JavaScript hoặc asset 404 trong lượt kiểm tra. Hai phản hồi 503 trong lượt form là lỗi API được giả lập có chủ đích.
- Các URL privacy Savills, Zalo, `sav.li/resi` (redirect sang Savills Residential), 360 Tour, calculator và Fanpage được kiểm tra GET từ môi trường hiện tại, đều HTTP 200. Không thực hiện cuộc gọi, gửi tin nhắn, đăng Facebook hay giao dịch.
- `next start` có cảnh báo sẵn có với cấu hình `output: standalone`; không đổi cách đóng gói/deploy. Máy chủ local vẫn phục vụ các lượt smoke test thành công.

## Form, SMTP và giới hạn kiểm thử

- Popup và form trên trang giữ `useLeadSubmission` → `/api/leads` → Nodemailer ở server. Không sửa các file API, mail, validation, abuse, hook gửi lead hay biến môi trường.
- Kiểm tra UI của cả hai form bằng dữ liệu tổng hợp thuộc miền `example.test`: validation rỗng, chấp thuận privacy, dropdown, lỗi 503, thử lại và thành công với `{ ok: true, code: "ACCEPTED" }`. Form không báo thành công khi thất bại, giữ giá trị đã nhập; popup khóa nút khi đang gửi.
- Bộ test server kiểm tra email/phone/consent, honeypot, field length, chống chèn header, HTML escaping, SMTP rejection, retry, duplicate, lock đồng thời, rate limit và fail-closed production.
- Các kiểm thử SMTP ở trên dùng stub trong test server và mock API trong browser; **chưa thử kết nối SMTP/Nodemailer đến máy chủ mail thật hoặc xác nhận thư vào inbox**.
- Không có `.env.local` hay giá trị server SMTP trong môi trường hiện tại: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `LEAD_RECEIVER_EMAIL` đều chưa được đặt. Không in giá trị, tạo credential hay gửi email thật.
- Cấu hình production chống lạm dụng hiện tại còn cần secret/shared state theo `.env.example`, gồm `LEAD_RATE_LIMIT_SECRET` và Redis URL/token; các giá trị này cũng chưa có trong môi trường kiểm thử. Đây là điều kiện vận hành sẵn có, không phải cấu hình mới do feedback thêm vào.

## Cần khách hàng/vận hành hoàn tất

- Không còn thiếu URL Fanpage hay Zalo cho phạm vi giao diện.
- Trước bàn giao production, vận hành chạy một lead có kiểm soát với SMTP và shared-state thực tế, xác nhận email tới đúng hộp thư; thử lỗi gửi và thử lại. Không gửi credential vào chat hoặc source control.
- Duyệt thủ công trên thiết bị iOS/Android thực tế và trình duyệt mục tiêu; kiểm tra bước sâu bên trong dịch vụ 360 Tour/calculator bên ngoài. Lượt kiểm thử hiện tại chỉ xác nhận CTA/href được giữ và endpoint ngoài truy cập được, không thay thế kiểm thử toàn bộ dịch vụ đó.
- Logo vector Savills riêng là nâng cấp tài nguyên tùy chọn; logo đang dùng là bản có sẵn trong ảnh khách hàng, không phải placeholder.

## Xác nhận bảo toàn và khác biệt trước/sau

| Thành phần | Bảo toàn / kiểm chứng |
| --- | --- |
| Bản đồ tương tác | Không sửa HTML/JS SVG, giữ pan/zoom/filter, iframe và messaging. Các test dịch/map parse PASS; smoke test chuyển locale và điều khiển panel PASS. |
| 360 Tour | Giữ CTA header/sidebar/footer và URL cũ; endpoint HTTP 200. |
| Bảng tính | Giữ section Calc, CTA và helper `calcHref`; endpoint HTTP 200. |
| Navigation | Giữ 6 mục sidebar, anchor section và animation đóng/mở; kiểm tra desktop/mobile. |
| Hiệu ứng cuộn | Không sửa `lib/motion.ts`, `InlineScript.tsx` hay logic scroll snap; ảnh mới nằm trong section hiện có. Đã quan sát section reveal và cuộn trong browser. |
| Responsive | 8 kích thước, 2 ngôn ngữ; bổ sung CSS chỉ cho các thành phần feedback. |
| SMTP | Không thay backend hoặc credentials; kiểm thử cấu trúc và lỗi/thành công giả lập PASS; gửi mail thật chưa kiểm chứng vì thiếu môi trường. |
| Dữ liệu/Git | Giữ thay đổi có sẵn tại `New folder/input-extracted/a/a`; không reset, commit, push, merge hay deploy. Giữ Gamuda Land ở vai trò phát triển dự án và nội dung pháp lý khác. |

Trước: header một logo, ảnh vị trí không đổi ngôn ngữ, Fanpage dự án cũ, privacy Gamuda, footer dài/copyright Skybridge, popup logo Norton Park và 5 nút nổi. Sau: hai logo, ảnh vị trí VI/EN chính thức, liên hệ/Fanpage/privacy Savills thống nhất, footer Savills ngắn gọn, popup Savills, hai nút nổi và navy #25273A có chọn lọc.

Ảnh QA và script kiểm tra cục bộ ở thư mục `temp/` (được Git ignore): `header-mobile.png`, `popup-mobile.png`, `drawer-mobile.png`, `savills-mobile.png`, `location-desktop-en.png`, `qa-results.json`, `qa-browser.cjs`, `qa-visual.cjs`, `qa-final.cjs`, `qa-fanpage.cjs`. Đây là bằng chứng kiểm thử local, không phải asset production.
