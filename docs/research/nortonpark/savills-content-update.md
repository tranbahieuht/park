# Đối chiếu nội dung tiếng Việt và tích hợp Savills

Ngày kiểm tra: 24/10/2026 (Asia/Saigon).

## Nguồn và phạm vi

- Website tham chiếu: https://www.nortonpark.com.vn/ (HTML trả về HTTP 200).
- Dữ liệu trực tiếp: `/js/page.js`, `/js/legal.js`, `/js/chat-copy.js` trên cùng website.
- Nội dung Savills: tệp `Pasted text.txt` do khách hàng đính kèm trong yêu cầu này.
- Giữ nguyên trạng thái mã nguồn tại thời điểm bắt đầu nhiệm vụ; không khôi phục hay áp dụng thêm thay đổi màu từ những nhiệm vụ trước.

## Kết quả đối chiếu trước lần sửa vị trí thông tin liên hệ

- 180 mục tiếng Việt trong HTML, gồm nhãn, nội dung, placeholder và nhãn nhóm lựa chọn, khớp với từ điển hiện tại. So sánh văn bản sau khi giải mã HTML và chuẩn hóa khoảng trắng trình bày.
- Các dữ liệu tiện ích (`LIFE`), căn hộ (`RESI`), tin tức (`NEWS`), loại tin (`CAT`) và đối tác (`TEAM`) khớp dữ liệu trực tiếp. Không cập nhật ảnh, logo hay bản dịch tiếng Anh.
- Nội dung tĩnh của đủ 14 section hiện có và footer đã được đối chiếu với HTML chính thức, không phát hiện đoạn văn bản tham chiếu bị thiếu: Hero, Design Story, Landscape Story, Story, Facts, Location Map, Position, Lifestyle, Blocks, Residences, News, Register, Developer, Calc và Footer.
- Sáu tài liệu pháp lý tiếng Việt và 32 mục nội dung chat khớp dữ liệu trực tiếp.
- Vì nội dung hiện tại đã khớp, không sửa lại từ điển, dữ liệu dự án hoặc nội dung các section cũ.
- Đây là kiểm tra độ khớp với nguồn tham chiếu, không phải xác thực độc lập các tuyên bố pháp lý hoặc thương mại trong nguồn.

## Nội dung hiện tại sau yêu cầu sửa footer

- Thêm duy nhất một section `#savills`, sau `#calc`, trước footer hiện có; chỉ hiển thị ở phiên bản tiếng Việt.
- Section Savills chỉ còn tiêu đề, hai đoạn giới thiệu và ba cam kết. Đã bỏ toàn bộ bảng pháp lý/liên hệ khỏi section; giữ nguyên dữ liệu cần hiển thị trong footer. Chuẩn hóa khoảng trắng trong tiêu đề “Savills Residential Sales – Chuyên Gia Bất Động Sản Nhà Ở Cao Cấp” đúng yêu cầu sửa.
- Footer gốc: thay hotline/email, thay hàng địa chỉ dự án trong cột liên hệ bằng website Savills; giữ Fanpage hiện có. Hàng doanh nghiệp phía dưới chứa nhãn đơn vị phân phối, tên pháp nhân Savills, mã số thuế, địa chỉ và văn phòng tư vấn. Bảy giá trị Savills xuất hiện đúng một lần trong footer, không còn trong section giới thiệu.
- Xóa địa chỉ/hotline liên hệ cũ ở hàng doanh nghiệp và hotline cũ trong đoạn nguồn thông tin ẩn của footer. FAQ số 6 ở cả VI/EN trỏ tới `#footer-contact` thay vì tiếp tục lặp lại hotline/email cũ. Các thông tin mô tả vị trí dự án, chủ đầu tư và nguồn chính thức vẫn được bảo toàn.
- Hotline: `tel:+84969696201`, hiển thị `(+84) 96 96 96 201`.
- Email: `mailto:sales@savills.com.vn`.
- Website: `https://sav.li/resi`.
- Giữ nguyên token màu, font, cỡ chữ, animation và cấu trúc footer. Dùng lại các class `f-ct`, `f-k`, `f-v`, `f-by-name`, `f-by-row` đang có. Chỉ bổ sung khoảng trống mobile cho thông tin doanh nghiệp dài để tránh cụm nút nổi. Không thay đổi các nút liên hệ ngoài footer.

## Tài liệu còn thiếu và thông tin cần khách hàng xác nhận

- Chưa tìm thấy ảnh chứng nhận Savills gốc trong tệp đính kèm, tài nguyên công khai hoặc tài liệu dự án. Chưa thêm ảnh chứng nhận hay ảnh thay thế; cần khách hàng cung cấp ảnh gốc để hoàn tất phần này.
- Theo xác nhận cập nhật của khách hàng, pháp nhân chủ đầu tư/phát triển dự án là Công ty TNHH Skybridge (Skybridge Company Limited, MSDN: 3700755234), thuộc tập đoàn Gamuda Land Việt Nam. Thương hiệu phát triển là Gamuda Land; đơn vị phân phối là Công ty TNHH Savills Việt Nam - Chi nhánh Thành phố Hồ Chí Minh. Cam kết Savills được đồng bộ theo thông tin này ở cả VI và EN.
- Những cam kết về giỏ hàng, căn view sông, chiết khấu và toàn bộ thông tin pháp lý/liên hệ Savills được nhập theo tài liệu bàn giao; chưa được xác minh độc lập qua website dự án.

## Kiểm tra

- `npm run check`: ESLint, TypeScript và production build đều đạt sau lần chỉnh sửa mã nguồn cuối cùng.
- Chrome headless: 1440×900, 768×1024, 390×844 và 320×740.
- Không tràn ngang trang hoặc section Savills; nội dung không bị cắt bởi giới hạn `100dvh` của giao diện desktop.
- Kiểm tra hình ảnh phần đầu/cuối section; chừa khoảng trống để nút nổi không che văn bản mới trên tablet/mobile.
- Bảy giá trị thông tin Savills được kiểm tra bằng DOM: mỗi giá trị xuất hiện đúng một lần trong footer và không còn trong section Savills. Ba href đúng nội dung khách hàng. Không còn hotline/email cũ trong footer, kể cả FAQ và nội dung ẩn. Không có ảnh chứng nhận giả, ký tự Unicode thay thế hoặc section Savills trùng lặp.
- Menu đóng/mở, tab căn hộ và chuyển VI → EN → VI hoạt động. Section Savills ẩn ở EN và trở lại ở VI; không tạo bản dịch chưa được cung cấp.
- Không ghi nhận ngoại lệ JavaScript trong các lượt kiểm tra. Không gửi form, tin nhắn hoặc thực hiện cuộc gọi thật.
- Đối chiếu SHA-256 trước/sau lần sửa footer: chỉ năm tệp mã nguồn liệt kê bên dưới thay đổi. Header, bố cục trang, palette, font, ảnh, logo, dữ liệu dự án, các nút nổi và các section khác giữ nguyên. Hai logo footer, bảy mục điều hướng, sáu liên kết pháp lý và bản quyền vẫn tồn tại; popup pháp lý mở được.
- Máy chủ kiểm tra dùng `next start` in cảnh báo sẵn có do cấu hình `output: "standalone"`; không sửa cấu hình triển khai ngoài phạm vi. Lệnh build vẫn thành công.
- Không cài thư viện; không commit, push hoặc deploy.

## Tệp chỉnh sửa trong lần sửa footer

1. `src/components/sites/nortonpark/sections/Savills.tsx` — bỏ bảng liên hệ, giữ phần giới thiệu và cam kết.
2. `src/components/sites/nortonpark/sections/Footer.tsx` — chuyển dữ liệu vào các trường footer gốc, thay liên hệ cũ, giữ thành phần khác.
3. `src/components/sites/nortonpark/data/i18n.ts` — FAQ số 6 VI/EN dẫn tới cột liên hệ để tránh thông tin cũ/trùng lặp.
4. `src/components/sites/nortonpark/styles/savills.css` — xóa CSS bảng liên hệ không còn dùng.
5. `src/components/sites/nortonpark/styles/clone.css` — chừa khoảng trống mobile cho thông tin doanh nghiệp mới.
6. `docs/research/nortonpark/savills-content-update.md` — cập nhật báo cáo này.
