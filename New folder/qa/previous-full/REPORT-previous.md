# REPORT — Ba website Huỳnh Hoàng Minh

Thời điểm kiểm tra: 16/10/2026 20:23 (Asia/Saigon).

## Tệp bàn giao

| Gói | Kích thước | Số tệp | Trang HTML | Ảnh/logo nguồn riêng biệt |
|---|---:|---:|---:|---:|
| website-a-final.zip | 30,259,949 byte | 142 | 35 | 61 |
| website-b-final.zip | 30,490,242 byte | 143 | 35 | 61 |
| website-c-final.zip | 30,599,357 byte | 137 | 35 | 61 |

Mỗi ZIP chứa một thư mục `website-a`, `website-b` hoặc `website-c`; trang bắt đầu là `index.html`. Có thể đưa nguyên thư mục lên hosting tĩnh. Dùng HTTP tĩnh khi kiểm tra các module JavaScript, không cần đổi framework hoặc chạy bước build.

Các thư mục `website-a`, `website-b`, `website-c` trong workspace là bản bàn giao sạch. Bản giải nén ban đầu và tệp demo không dùng đã được chuyển sang `input-extracted/` để đối chiếu, không nằm trong ZIP đầu ra. Ba ZIP đầu vào được giữ nguyên.

## Nguồn và phương pháp xác minh

Nguồn duy nhất: [https://huynhhoangminh.com/index](https://huynhhoangminh.com/index).

Trang `/index` và 34 trang con đã được tải trực tiếp với HTTP 200, gồm giới thiệu, quy trình, liên hệ, danh mục, tám nhóm sản phẩm, giá thị trường, tin tức, 17 chi tiết sản phẩm và ba bài viết. Đã kiểm tra thêm trang `san-pham?page=2` để đưa đủ 17 sản phẩm vào danh mục. Bản HTML nhận được lưu trong `source-evidence/`; nhật ký yêu cầu nằm tại `requests.json`, `detail-requests.json` và bản trang 2 trong `pagination/`.

63 URL ảnh được ghi trong manifest, tương ứng 61 tệp riêng biệt do một số kích thước thumbnail dẫn về cùng tệp gốc. Đã ưu tiên URL `/upload/` gốc; khi URL gốc không trả được ảnh, giữ đúng bản ảnh công khai được website phục vụ. Không tạo ảnh, không dùng AI, không tìm ảnh ở nguồn khác. Các tệp tải về không qua nén lại, đổi định dạng hoặc chỉnh sửa ảnh. `assets/SOURCE-MANIFEST.json` trong mỗi bản ghi URL, kết quả tải và SHA-256.

## Cấu trúc và thay đổi theo template

| Bản | Template đầu vào | Công nghệ và thư viện giữ lại | Thay đổi chính |
|---|---|---|---|
| A | Manufex | HTML/CSS/JS tĩnh, Webflow, jQuery, GSAP, ScrollTrigger, SplitText, Lenis, Lottie | Thay hero, giới thiệu, danh mục ảnh/cuộn, khối sản phẩm, tab quy trình, tin tức và liên hệ; bỏ logo đối tác, thành tích và lời chứng thực demo. |
| B | Rewaste | HTML/CSS/JS tĩnh, Webflow, jQuery, GSAP và các JS chunk gốc | Thay hero, giới thiệu, sáu thẻ sản phẩm, marquee, bốn nội dung quy trình, tin tức và footer; bỏ số liệu, case study, đối tác và lời chứng thực demo. |
| C | Greeninterior/Zenvira | HTML/CSS/JS tĩnh, Webflow, jQuery, Lottie | Thay hero, slider ảnh, bốn thẻ sản phẩm, portfolio, giá trị doanh nghiệp, quy trình, tin tức, CTA và footer; bỏ giỏ hàng, giá dịch vụ nội thất, thành tích, đối tác, FAQ và lời chứng thực demo. |

Toàn bộ tệp JavaScript gốc được giữ nguyên byte ở cả ba bản. CSS gốc giữ selectors, breakpoint, hiệu ứng và animation; thay URL ảnh nền và thêm `css/official.css` cho logo, trang nội dung và khả năng đọc trên mobile. Danh sách toàn bộ tệp HTML/CSS/JS/JSON đầu vào, dung lượng và hash nằm trong `qa/template-analysis.json`.

Template đầu vào chỉ có trang chủ và các bản sao lưu; 34 trang con mỗi bản được bổ sung bằng header, footer, font và tài nguyên của chính template đó. Nội dung bài viết/giới thiệu/quy trình được chép từ HTML nguồn; chỉ bỏ style, class và mã điều khiển riêng của website nguồn khi đưa vào template. Không diễn giải lại nội dung doanh nghiệp.

Đã thay tên doanh nghiệp, tiêu đề trang, metadata mô tả/chia sẻ, logo, ảnh raster, phần giới thiệu, sản phẩm, thông tin liên hệ, tin tức và các liên kết nội bộ. Các icon giao diện SVG/Lottie như mũi tên, menu và biểu tượng thao tác được giữ để bảo toàn thiết kế.

Các trang chính: `index.html`, `gioi-thieu.html`, `hoat-dong.html`, `san-pham.html`, `lien-he.html`, `gia-thi-truong.html`, `tin-tuc.html`; thêm tám trang nhóm và các trang chi tiết đã kiểm tra. Các đường dẫn dùng `.html` tương đối, không cần cấu hình rewrite máy chủ.

## Thông tin liên hệ đã xác minh

- CÔNG TY TNHH HUỲNH HOÀNG MINH.
- Địa chỉ: 213A/2, đường Nguyễn Văn Tiên, khu phố 11A, Phường Tân Triều, TP Đồng Nai.
- Hotline: 0964 717 686; liên kết `tel:0964717686`.
- Email: huynhhoangminh.corp@gmail.com; có liên kết `mailto:` tương ứng.

Thông tin trên đối chiếu từ trang chủ và trang liên hệ nguồn.

## Phần thiếu hoặc giới hạn cần biết

1. Nguồn chưa liệt kê sản phẩm cụ thể cho Thép Không Gỉ, Chì, Kẽm và Khác; giữ nguyên câu “Đang cập nhật nội dung...” mà nguồn hiển thị. Không tạo sản phẩm, mô tả, mã hàng hay giá. Các dòng dạng “NỘI DUNG Đồng” chỉ là nội dung mẫu tại nguồn nên không dùng làm mô tả thật.
2. Không có dữ liệu nguồn cho đội ngũ, đánh giá khách hàng, đối tác, số năm hoạt động, tỷ lệ hài lòng hoặc gói giá dịch vụ của template. Các khối/đường dẫn demo tương ứng được loại bỏ.
3. Không lấy được video doanh nghiệp chính thức từ các trang đã kiểm tra. Video demo sản xuất của A được thay bằng ảnh chính thức trong cùng vùng nền; không giữ nội dung video của thương hiệu mẫu. Vì vậy không thể giữ phần phát video demo.
4. Các template xuất tĩnh không có backend gửi thư/đăng ký bản tin. Đã bỏ form Webflow demo và thay bằng liên kết đến `https://huynhhoangminh.com/lien-he`, đồng thời cung cấp gọi điện/email. Không giả lập thông báo gửi thành công và không thử gửi thông tin tới doanh nghiệp. Giỏ hàng/thanh toán demo được bỏ vì nguồn là danh mục liên hệ, không có dữ liệu giao dịch để cấu hình.
5. Giá, đơn vị và mốc thời gian trên trang thị trường được giữ theo dữ liệu nguồn chụp tại thời điểm tải. Chưa xác minh đây là báo giá mới nhất; không gọi dữ liệu này là giá thời gian thực và không bổ sung giá ngoài nguồn.
6. Liên kết Zalo trong nguồn dùng số khác hotline; chưa xác minh số này thuộc doanh nghiệp nên không đưa vào ba bản. Các tài khoản Facebook/X/Instagram/LinkedIn demo đều được bỏ.
7. Chỉ dùng thông tin công khai. Không xác minh các số liệu hoặc nhận định doanh nghiệp bằng nguồn bên ngoài, theo yêu cầu dùng một nguồn duy nhất.

## Kết quả kiểm tra

- Kiểm tra tĩnh cả 105 trang: không thiếu đường dẫn HTML/ảnh/CSS/JS/font nội bộ; không có fragment bị thiếu; không tìm thấy các tên thương hiệu mẫu và lời chứng thực demo trong văn bản HTML sau thay.
- SHA-256 của các tài nguyên chính thức đóng gói khớp dữ liệu tải về; JavaScript gốc không bị sửa.
- Trang chủ A/B/C được mở trên Edge headless tại 1440px và 390px, cuộn toàn trang để kích hoạt animation và tải ảnh lazy-load: không ghi nhận lỗi JavaScript, HTTP >=400, ảnh tải hỏng hoặc tràn ngang.
- 36 lượt kiểm tra trang con: sáu trang đại diện × ba bản × hai kích thước. Bao gồm giới thiệu, quy trình, danh mục, liên hệ, một chi tiết sản phẩm và tin tức; không ghi nhận lỗi JavaScript, HTTP >=400, ảnh hỏng hoặc tràn ngang. Danh mục mỗi bản hiển thị đủ 17 sản phẩm.
- Đã mở/đóng menu mobile ở cả ba bản, kể cả menu tùy biến B; tab quy trình A đổi đúng trạng thái; accordion thị trường mở được trên mobile; kiểm tra đích gọi điện, email và trang liên hệ chính thức.
- Đã đọc lại từng ZIP, kiểm tra CRC và so sánh từng byte đóng gói với thư mục cuối; cả ba PASS. Không đóng gói `.git`, metadata macOS, backup hoặc ảnh demo không dùng. Kiểm tra toàn bộ `src`, `href`, `data-src` trong HTML của ZIP: không thiếu tham chiếu nội bộ, không có ảnh raster ngoài thư mục tài nguyên chính thức.
- Đã giải nén lại chính ba ZIP và mở trang chủ/danh mục ở 390px bằng trình duyệt: PASS.

Chứng cứ kiểm tra: `qa/browser-results.json`, `qa/subpage-results.json`, `qa/interaction-results.json`, `qa/static-audit.json`, `qa/package-verification.json`, `qa/delivery-check.json`, `qa/zip-browser-check.json` và ảnh chụp PNG trong `qa/`. Đây là kiểm tra tại hai viewport và trình duyệt nêu trên, không phải chứng nhận trên mọi thiết bị/trình duyệt hoặc kiểm thử backend chưa có.

## SHA-256 các ZIP bàn giao

- `website-a-final.zip`: `8153ddf6ca1e3c2ada45cf69927af8a2a7893e541dbe082f64b155669dc42106`
- `website-b-final.zip`: `9d366a3610b115d5b0818240684bf29e087dc6349f119324045651324e80dfbf`
- `website-c-final.zip`: `2d9e58b45e672ff50bb5c93c0d55f2939e9a5dda72c3a00fafcdd36d496efdd8`
