# BÁO CÁO — Chỉnh nội dung trang chủ ba template

Bản cập nhật theo yêu cầu mới: chỉ thay nội dung, hình ảnh và logo bằng dữ liệu từ https://huynhhoangminh.com/index, dùng tiếng Việt. Không bổ sung trang con.

## Cấu trúc bàn giao

- website-a-final.zip: mở a/index.html.
- website-b-final.zip: mở b/index.html.
- website-c-final.zip: mở c/index.html.

Giữ lớp thư mục a/b/c và các thư mục tài nguyên chính của template gốc: css, js, fonts, images; bản A có thêm lottie và videos như ban đầu. Ảnh chính thức được thêm vào images. Các điều chỉnh CSS cần thiết được ghép vào stylesheet hiện có, không thêm framework hoặc bước build. Toàn bộ tệp JavaScript gốc giữ nguyên byte.

Mỗi ZIP chỉ có một trang HTML là index.html. Các liên kết giới thiệu, sản phẩm, quy trình và liên hệ dẫn về website nguồn; không còn 34 trang con được thêm ở bản trước. Bản trước được lưu riêng trong qa/previous-full để đối chiếu.

## Nội dung đã thay

- Tên công ty, logo, tiêu đề và metadata.
- Nội dung giới thiệu và quy trình lấy từ trang chủ nguồn.
- Tên và hình ảnh nhóm sản phẩm lấy từ trang chủ nguồn.
- Địa chỉ, số điện thoại và email chính thức.
- Các nhãn hiển thị dùng tiếng Việt; loại bỏ chữ và thương hiệu demo hiển thị.
- Chỉ hiển thị ảnh doanh nghiệp đã tải từ trang chủ nguồn; không tạo ảnh và không bổ sung ảnh ngoài nguồn. Ảnh có tên shutterstock trên nguồn không được sử dụng.

Giữ phong cách, font, màu, responsive và các hiệu ứng của phần template còn sử dụng. Những khối chứa đánh giá, thành tích, đối tác hoặc giá dịch vụ giả không có dữ liệu nguồn tương ứng được bỏ nội dung demo. Các thẻ trước đây dành cho tin tức được dùng cho sản phẩm từ trang chủ nguồn. Tài nguyên template gốc không được trang chủ gọi vẫn giữ trong thư mục tài nguyên để bảo toàn cấu trúc tệp; chúng không được dùng thay ảnh doanh nghiệp hiển thị.

## Giới hạn

- Không có backend gửi thư trong template xuất tĩnh. Nút liên hệ dẫn đến trang liên hệ chính thức; không giả lập gửi thành công.
- Trang chủ nguồn không cung cấp video chính thức, nên không hiển thị video demo của template A; dùng ảnh nguồn trong vùng nền đó.
- Không tự tạo số liệu thành tích, đánh giá khách hàng, thông tin đối tác hoặc mô tả sản phẩm còn thiếu.

## Kiểm tra

- Đã đọc lại ba ZIP, kiểm tra CRC, xác nhận mỗi gói chỉ có một index.html và đối chiếu từng byte với thư mục bàn giao: đạt.
- Đã kiểm tra đường dẫn ảnh, CSS, JavaScript, font và Lottie: không thiếu tài nguyên nội bộ.
- Đã kiểm tra bằng trình duyệt tại 1440px và 390px, cuộn trang để tải ảnh và kích hoạt hiệu ứng. Kết quả chi tiết: qa/homepage-browser-results.json.
- Kết quả kiểm tra ZIP và mã SHA-256: qa/homepage-delivery-check.json.

## SHA-256

- website-a-final.zip: `c9dde262fb5c65d40bc0d37f020b5f6cb3530a5901fa8dc1fbcc68f2e1689ab9`
- website-b-final.zip: `3f4322bb9d6170ce1de33a58293f9044578d16ac91247aa2ee618f52744ef80f`
- website-c-final.zip: `2b68ef5228d00cce81d67e8e93f48c4d3b1bf95cfa855b2389142a8c830aa3bd`

## Đối chiếu lại nội dung theo yêu cầu

Đã tải lại trang chủ nguồn và đối chiếu văn bản hiển thị, thông tin liên hệ, logo, ảnh và liên kết của các thẻ sản phẩm. Không tìm thấy văn bản doanh nghiệp không có trong nguồn; ảnh doanh nghiệp hiển thị khớp hash tài nguyên trang chủ nguồn. Đã sửa các nhãn khối chưa khớp, mục menu rỗng ở B, nút xem sản phẩm ở C và ảnh desktop/mobile trong cùng thẻ. Các hình nét/shape thuần trang trí được giữ theo template gốc. Cả 11 liên kết website nguồn được kiểm tra đều trả HTTP 200. Chi tiết: qa/content-recheck.json. Sau sửa đã đóng gói lại, kiểm tra CRC và đối chiếu từng byte của cả ba ZIP: đạt.
