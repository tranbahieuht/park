# Norton Park — báo cáo triển khai feedback Savills 03/11/2026

Đã triển khai tại local trong `D:\norton-park-master`. Không commit, push, merge hoặc deploy. Giữ nguyên thứ tự 16 section, các asset logo Norton Park/Savills, hình ảnh, dữ liệu căn hộ, diện tích, mức giá và nội dung pháp lý dự án.

## A. Kết quả từng feedback

| Feedback | Trạng thái | Kết quả và giới hạn |
| --- | --- | --- |
| 1 — Font | [PARTIAL] | Playfair Display cho heading; Montserrat làm fallback hình học cho body/UI. Đồng bộ trang, menu, form, modal, chat và iframe bản đồ. Có file Gotham trong repo nhưng không có bằng chứng quyền dùng webfont, nên không kích hoạt. Cần bộ Gotham được cấp phép và có tiếng Việt. |
| 2 — Bản đồ | [PASS] | Xóa đúng 5 chip tiện ích và state/filter của chúng. Giữ metadata danh mục cho tooltip, toàn bộ chú giải lớp, presets, đường giao thông, zoom, pan/drag, toàn cảnh và replay/reset. |
| 3 — Chuyển section | [PASS] | Thay vòng quét DOM mỗi lần cuộn bằng IntersectionObserver chạy một lần; bỏ đo layout xen kẽ khi gắn animation; rút ngắn chuyển động; thay clip-path reveal bằng transform/opacity; cleanup RAF và count-up; tạm dừng animation bản đồ khi ngoài viewport/tab ẩn. Giữ native section snap desktop và hành vi mobile gốc; hỗ trợ reduced motion. Đã thử anchor/snap với CPU slowdown 4x. Chưa đo trên thiết bị cấu hình trung bình vật lý. |
| 4 — Form tư vấn | [PARTIAL] | Hai form hiện có dùng chung hook và `POST /api/leads`. Validation, loading, chống gửi trùng, lỗi/timeout và success được kiểm thử bằng mock. Chưa có cấu hình SMTP/Redis local để xác nhận gửi thật. |
| 6 — View 360 | [PARTIAL] | Giữ URL hiện hành `https://360.nortonpark.com.vn/` ở header, drawer, footer và FAQ; các link mở tab riêng với `noopener noreferrer`. Repo không có player/loading/consent screen 360 nội bộ hoặc câu đồng ý điều khoản được phản ánh. URL tour trả HTTP 403 trong lượt kiểm tra; chưa thể xác nhận nội dung, loading, fullscreen hoặc redirect bên trong nền tảng ngoài. |
| 7 — Flow bảng tính giá | [PASS] | CTA chính, 9 thẻ loại căn, drawer và link FAQ mở popup tư vấn hiện có ngay trên website. Metadata `pricing_calculator`; thẻ truyền đúng loại căn. CTA chung chỉ lấy loại căn khi khách đã chọn; không tự gán Studio mặc định. Close/Escape/Back và focus trap hoạt động. Gửi thật vẫn phụ thuộc cấu hình email ở mục D. |
| 8 — Footer | [PASS] | Xóa riêng liên kết bảng tính giá. Giữ section giới thiệu, các thẻ sản phẩm và CTA tư vấn giá. |
| 9 — WhatsApp sidebar/mobile | [PASS] | Nhãn CHAT WHATSAPP, icon WhatsApp chuẩn và component dùng chung đã thay Zalo. Đã kích hoạt URL `https://wa.me/qr/ZTIBEMDEW7LZE1` do chủ dự án cung cấp; mở tab riêng với `noopener noreferrer`. |
| 10 — WhatsApp floating | [PASS] | Giữ nút gọi điện và hình học nút tròn; WhatsApp dùng cùng URL chủ dự án cung cấp với sidebar/chat, nhãn accessible VI/EN. |
| 11 — Toàn bộ CTA | [PARTIAL] | Toàn bộ CTA thu thập lead dùng lại form/API, có nguồn và sản phẩm quan tâm. Không chuyển phone, tour, navigation hoặc liên hệ ngoài thành form gửi email. Mock tests xác nhận recipient cố định Savills và không gửi email trùng trong tình huống gửi lại/concurrent. Chờ cấu hình production và xác nhận email thực tế. |

## B. File đã chỉnh sửa/thêm

Các đường dẫn dưới đây tương đối so với root repository.

| File | Mục đích |
| --- | --- |
| `.env.example` | Thay thông tin đăng nhập bằng placeholder; liệt kê SMTP, Redis và signing secret. |
| `docs/smtp-leads.md` | Cấu hình SMTP/Vercel, recipient cố định, mock/sandbox, giới hạn deduplication và cách kiểm tra. |
| `docs/savills-feedback-2026-11-03.md` | Báo cáo này. |
| `src/app/globals.css` | Đồng bộ font utility heading/body. |
| `src/app/layout.tsx` | Preload Playfair Display và Montserrat thay font cũ. |
| `public/sites/nortonpark/typography.css` | Nguồn typography dùng chung cho Next.js và map iframe. |
| `public/sites/nortonpark/fonts/README.md` | Nguồn font, giấy phép và hướng dẫn thay bằng Gotham được cấp phép. |
| `public/sites/nortonpark/fonts/playfair-display.woff2` | Font Latin Playfair Display chính thức, giữ nguyên binary từ Google Fonts. |
| `public/sites/nortonpark/fonts/playfair-display-latin-ext.woff2` | Font Latin Extended Playfair Display chính thức. |
| `public/sites/nortonpark/fonts/playfair-display-vietnamese.woff2` | Font tiếng Việt Playfair Display chính thức. |
| `public/sites/nortonpark/fonts/playfair-display-OFL.txt` | Giấy phép Playfair Display. |
| `public/sites/nortonpark/fonts/montserrat.woff2` | Fallback body có Latin, tiếng Việt và dấu tổ hợp. |
| `public/sites/nortonpark/fonts/montserrat-OFL.txt` | Giấy phép Montserrat. |
| `public/sites/nortonpark/assets/icons/whatsapp.svg` | Glyph WhatsApp vector từ Bootstrap Icons. |
| `public/sites/nortonpark/assets/icons/bootstrap-icons-LICENSE.txt` | Giấy phép icon. |
| `public/sites/nortonpark/assets/map/location-map.html` | Font dùng chung, xóa chip/state danh mục, giữ chú giải và tooltip; sleep/wake animation. |
| `src/components/sites/nortonpark/WhatsAppLink.tsx` | Một component WhatsApp cho sidebar/floating/chat; disabled khi thiếu URL. |
| `src/components/sites/nortonpark/Icons.tsx` | Bỏ glyph Zalo cũ. |
| `src/components/sites/nortonpark/NortonParkPage.tsx` | Đăng ký launcher tư vấn chung. |
| `src/components/sites/nortonpark/data/contact.ts` | Một cấu hình `whatsappUrl` dùng URL do chủ dự án cung cấp. |
| `src/components/sites/nortonpark/data/i18n.ts` | Nhãn WhatsApp, timeout và link tư vấn giá VI/EN. |
| `src/components/sites/nortonpark/data/chat-copy.ts` | Bỏ copy Zalo trong chat. |
| `src/components/sites/nortonpark/lib/useConsultationLaunchers.ts` | Điều phối CTA và metadata tới popup hiện có. |
| `src/components/sites/nortonpark/lib/ui.tsx` | Ghi nhận khách đã chọn loại căn. |
| `src/components/sites/nortonpark/lib/dom.ts` | Xóa helper tạo URL calculator ngoài website. |
| `src/components/sites/nortonpark/lib/motion.ts` | IntersectionObserver và cleanup theo breakpoint/reduced motion. |
| `src/components/sites/nortonpark/lib/useLeadSubmission.ts` | Timeout, lock gửi, reset cho yêu cầu tiếp theo; chỉ nhận success thật từ API. |
| `src/components/sites/nortonpark/overlays/Popup.tsx` | Nhận source/unit, Back/Close/Escape, focus, accessible input labels; giữ form và dữ liệu đã nhập. |
| `src/components/sites/nortonpark/overlays/Drawer.tsx` | CTA calculator local, WhatsApp và inert khi đóng. |
| `src/components/sites/nortonpark/overlays/Fab.tsx` | Thay nút Zalo bằng WhatsApp dùng chung. |
| `src/components/sites/nortonpark/overlays/ChatWidget.tsx` | Thay quick action Zalo bằng WhatsApp. |
| `src/components/sites/nortonpark/sections/Calc.tsx` | Giữ thẻ sản phẩm, mở form local và truyền loại căn. |
| `src/components/sites/nortonpark/sections/Footer.tsx` | Bỏ riêng menu calculator; giữ tour/liên hệ. |
| `src/components/sites/nortonpark/sections/Nav.tsx` | Cleanup RAF; link tour an toàn. |
| `src/components/sites/nortonpark/sections/Register.tsx` | Source `contact_form`, focus success; dùng cùng API/hook. |
| `src/components/sites/nortonpark/sections/Facts.tsx` | Hủy RAF count-up khi cleanup/chạy lại; cập nhật text node thay innerHTML mỗi frame. |
| `src/components/sites/nortonpark/sections/LocationMap.tsx` | Locale, origin kiểm tra và sleep/wake theo visibility/viewport. |
| `src/components/sites/nortonpark/styles/fonts.css` | Import typography dùng chung. |
| `src/components/sites/nortonpark/styles/page.css` | Giảm thời gian/stagger animation, transform reveal và tên class WhatsApp. |
| `src/components/sites/nortonpark/styles/feedback.css` | Typography UI, chữ mobile, nút WhatsApp, reduced motion. |
| `src/components/sites/nortonpark/styles/chat-widget.css` | Font tokens và tên class WhatsApp. |
| `src/components/sites/nortonpark/styles/interactions.css` | Đồng bộ selector WhatsApp. |
| `src/components/sites/nortonpark/styles/legal.css` | Heading modal dùng Playfair; giữ nguyên nội dung pháp lý. |
| `src/lib/leads/validation.ts` | Allowlist nguồn đăng ký. |
| `src/lib/leads/mail.ts` | Recipient cố định, sender khớp tài khoản SMTP; giữ TLS, Reply-To và kiểm tra acceptance. |
| `scripts/leads.test.mjs` | Mock SMTP auth/timeout/rejected recipient, sender, source và giữ kiểm thử API/abuse hiện có. |
| `scripts/location-map-i18n.test.mjs` | Kiểm thử tooltip sử dụng hàm tra cứu thời gian thật. |
| `scripts/feedback-ui.test.mjs` | Regression browser/viewport/language với API mock và ảnh chụp. |
| `scripts/feedback-flows.test.mjs` | CTA toàn bộ loại căn, hai form, lỗi HTTP/timeout, focus, pan và CPU slowdown. |

Không thay `package.json`, lockfile, mức giá, asset logo hoặc dữ liệu pháp lý. Playwright chỉ cài ở thư mục `temp/qa-tools` được Git ignore, không thêm dependency runtime. Giữ nguyên thay đổi có sẵn của người dùng tại `New folder/input-extracted/a/a`.

## C. CTA audit

“Đã kiểm tra” trong bảng là kiểm tra tại local bằng browser và mock transport; không có email thật được gửi.

| CTA / nhóm | Vị trí | Hành động sau sửa | Đã kiểm tra |
| --- | --- | --- | --- |
| `hero` — A | Hero | Popup chung; `hero_consultation` | Chrome/Edge, VI/EN, 8 viewport |
| `nav` — A | Header | Popup; `header_consultation` hoặc `mobile_consultation` | Browser chi tiết |
| Liên hệ/tư vấn — A | Drawer | Đóng menu, mở popup; `sidebar_consultation` hoặc `mobile_consultation`; trả focus về burger | Browser, Back/Escape |
| `resi` — A | Chi tiết căn hộ | Popup; `residence_consultation`, lấy loại căn đang xem | Browser chi tiết |
| `calc_open` — B | Section calculator | Popup; `pricing_calculator`; giữ lựa chọn căn nếu khách đã chọn | Browser chi tiết |
| `calc_type` × 9 — B | Thẻ calculator | Popup; `pricing_calculator`; đúng loại căn của từng thẻ | Đã click cả 9 thẻ, VI/EN |
| `calc_drawer` — B | Drawer | Popup tại website hiện tại; không URL chủ đầu tư | Audit markup và launcher chung |
| Link tư vấn giá — B | FAQ translation | Popup qua `data-calc`, cùng source pricing | Audit cả VI/EN |
| Submit popup — A/B | Popup hiện có | `POST /api/leads`; loading/disable; báo theo response thật | Mock 400/409/429/503, timeout, retry, success, double click |
| Submit `leadForm` — A/C | Section register | Form 2 bước; `contact_form`; API chung | Back/Next, lựa chọn căn, submit, success VI/EN |
| Liên hệ — A/C | Footer | Popup chung; `contact_form` | Browser chi tiết |
| Tour 360 — D | Header, drawer, footer, FAQ | Giữ `https://360.nortonpark.com.vn/`, mở tab riêng an toàn | Link/attributes pass; tour ngoài chưa xác minh được do HTTP 403 |
| Logo/top, hero explore — E | Header/hero | Đúng anchor `#top`, `#design-story` | Browser, native snap và CPU slowdown 4x |
| Các mục section — E | Drawer/footer | Đúng anchor vị trí, tiện ích, căn hộ, tin tức | Audit markup; giữ nguyên |
| Chọn loại căn từ Facts — E | Facts | Chọn tab Residences và cuộn tới `#residences` | Audit handler; giữ nguyên |
| Carousel/dots/tabs — E | Lifestyle, News, Residences | Giữ chuyển slide/tab và chọn căn | Audit handler; tab chọn căn được dùng trong test |
| `call`, `call_drawer`, `call_popup`, `call_contact`, `call_footer` — F | Floating, menu, popup, contact, footer | `tel:+84969696201` từ cấu hình liên hệ có sẵn | Audit toàn bộ href |
| WhatsApp — G | Floating, drawer, quick action chat | Cùng `SAVILLS_CONTACT.whatsappUrl` = `https://wa.me/qr/ZTIBEMDEW7LZE1`; mở tab riêng an toàn | Browser kiểm tra href/target/rel/accessible labels VI/EN ở floating và drawer; chat dùng cùng component/config |
| `mail_contact`, email khác — C | Contact/footer/popup | Giữ `mailto:sales@savills.com.vn`, không tự gửi lead | Audit href |
| Map/contact address — C | Contact/popup | Giữ Google Maps của dự án, mở tab riêng | Audit href |
| Fanpage/website — C | Contact/popup/footer | Giữ Facebook Savills Residential và `https://sav.li/resi` | Audit href |
| Privacy/legal links | Form/footer/modal | Giữ chính sách bảo mật Savills và các tài liệu pháp lý có sẵn | Không sửa nội dung pháp lý |
| News cards / `news_all` | News | Giữ link bài viết; `news_all` vẫn disabled như trước vì nguồn chưa mở trang tổng hợp | Audit trạng thái có sẵn |

## D. Email audit

- Frontend: chỉ hai form gốc `popForm` và `leadForm`; CTA mới tái sử dụng `popForm`, không thêm bản form.
- Endpoint: `POST /api/leads`, JSON, Node.js runtime, giới hạn body 8 KiB, cùng hook `useLeadSubmission`.
- Payload: name, phone, email tùy chọn, unit, source allowlist, language VI/EN, consent boolean, honeypot trống, registeredAt ISO. Không đưa thông tin khách vào URL, analytics, console hoặc server logs.
- Server: validate lại; từ chối cross-site, nội dung sai kiểu/độ dài, consent giả, email header injection và honeypot.
- SMTP: Nodemailer; TLS/STARTTLS bắt buộc, connection/greeting/socket timeout, không debug/log credentials; `SMTP_FROM` phải khớp mailbox `SMTP_USER`. Không giả mạo người gửi Savills.
- Recipient: cố định `sales@savills.com.vn`, không thể đổi qua payload hoặc `LEAD_RECEIVER_EMAIL`.
- Reply-To: email khách sau validation; bỏ nếu không cung cấp.
- Nội dung email: subject Norton Park rõ ràng, tên, điện thoại, email, loại căn, source, ngôn ngữ, thời gian server theo `Asia/Ho_Chi_Minh`. Nội dung HTML được escape, có plain text.
- Rate limit và dedupe hiện có được giữ: 5 request/IP/10 phút, 429 có Retry-After; HMAC key và lock Redis; cùng contact/interest chỉ gửi một lần trong 24 giờ. Production fail-closed khi thiếu shared state/signing secret. Không tuyên bố SMTP + Redis có thể đảm bảo exactly-once khi process crash hoặc provider mất phản hồi sau DATA; xem tài liệu SMTP.
- Success chỉ khi SMTP xác nhận accepted và không rejected, hoặc bản ghi duplicate đã có trạng thái hoàn tất. Browser tests chỉ mô phỏng response để kiểm tra UI; mock transport kiểm tra server acceptance/rejection thật trong code.
- Mock đã kiểm tra: auth failure, timeout, recipient rejection, retry, validation, concurrent duplicate, throttle và thiếu cấu hình production. Không gửi thư đến hộp thư Savills trong phiên này.

Local không có `.env.local`; các biến sau đều chưa có trong process dùng kiểm tra:

```text
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
LEAD_RATE_LIMIT_SECRET
```

Cấu hình chúng tại Vercel Project → Settings → Environment Variables cho environment cần dùng; không đặt prefix `NEXT_PUBLIC_`. Dùng tài khoản SMTP đã xác minh và Redis có REST API. Hướng dẫn đầy đủ, safe local sink và giới hạn vận hành: [smtp-leads.md](smtp-leads.md). Không kiểm tra được biến môi trường của deployment đang chạy từ môi trường local này.

`.env.example` trước đây chứa một mật khẩu SMTP có vẻ là thông tin thật. Đã thay bằng placeholder; chủ tài khoản cần thu hồi/đổi mật khẩu đó vì dữ liệu cũ có thể còn trong Git history. Không dùng lại thông tin đã lộ.

## E. Build và QA

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run lint -- src scripts` | PASS, không error/warning |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; `/` static và `/api/leads` dynamic |
| `node --test scripts/leads.test.mjs scripts/location-map-i18n.test.mjs` | PASS, 14/14 |
| Browser regression | PASS, Chrome + Edge × 8 viewport × VI/EN = 32 tổ hợp; không pageerror |
| Browser flow chi tiết | PASS, Chrome + Edge, 1440/390px, VI/EN; 9 thẻ, metadata, form, lỗi/timeout, keyboard/focus và pan bản đồ |
| CPU slowdown | PASS anchor và native snap tại 1366×768 với mức mô phỏng 4x; không đại diện cho benchmark thiết bị thực |
| Font | Tất cả heading H1/H2/H3 dùng Playfair; font tự host; kiểm tra glyph tiếng Việt và dấu tổ hợp; giữ logo gốc |
| Visual QA | Đã chụp/rà các section ở 375/768/1440px; kiểm tra popup tại toàn bộ viewport, không tràn ngang |
| `npm run dev` | Đã khởi động và chạy QA thành công tại loopback port 3100 |
| `git diff --check` | PASS |
| `npm run lint` toàn repository | FAIL do ESLint quét cả website/vendor đã giải nén trong `New folder`, public vendor và local `temp`. Lượt audit trả 669 errors/35719 warnings ở phạm vi này. Không tắt ESLint hoặc sửa website ngoài phạm vi để che lỗi; source/test ứng dụng pass riêng. |

Viewport: **1920, 1440, 1366, 1024, 768, 430, 390, 375px**, cả VI và EN trên Chrome và Edge headless. Kiểm tra không tràn ngang, font load, thứ tự section, menu, popup/history, form loading/error/success, calculator context, map legend/zoom/reset và reduced motion. Kiểm tra chi tiết thêm drag, sleep khi ra khỏi map và focus trap. Ảnh và JSON kết quả lưu tại `temp/feedback-qa/` (Git ignored).

Cập nhật sau khi chủ dự án cung cấp URL WhatsApp: đã kích hoạt URL chung, cập nhật assertion từ disabled sang href/target/rel/nhãn accessible; chạy lại thành công 8 tổ hợp Chrome/Edge × 1440/390px × VI/EN, không pageerror. Lint `src/scripts`, typecheck và build tiếp tục PASS. Việc xác nhận tài khoản đích trong ứng dụng WhatsApp thuộc bước nghiệm thu thủ công.

Chạy lại browser QA sau khi khởi động `npm run dev -- --hostname 127.0.0.1 --port 3100`:

```sh
npm install --prefix temp/qa-tools --no-save --package-lock=false playwright
node scripts/feedback-ui.test.mjs
node scripts/feedback-flows.test.mjs
```

Máy cần cài Chrome và Edge. Có thể dùng `QA_CHANNELS`, `QA_WIDTHS`, `QA_CHANNEL` và `QA_BASE_URL` để chọn phạm vi. `/api/leads` được intercept trong browser QA; không gửi email thật.

## F. Phần cần bổ sung từ bên ngoài

1. Bộ Gotham được cấp phép dùng web, có tiếng Việt; hoặc xác nhận entitlement cho các file đang có. Khi đủ, thêm font-face vào `typography.css`, thay token body và preload theo README font.
2. WhatsApp đã được bổ sung bằng URL chủ dự án cung cấp: `https://wa.me/qr/ZTIBEMDEW7LZE1`. Không còn thiếu URL; cần chủ dự án xác nhận tài khoản đích trên ứng dụng WhatsApp của mình khi nghiệm thu.
3. Cấu hình SMTP/Redis/signing secret trên environment chạy website. Chủ tài khoản cần đổi mật khẩu từng xuất hiện trong `.env.example`.
4. Bên cung cấp tour cần cho phép kiểm tra `https://360.nortonpark.com.vn/` và xử lý consent/link chủ đầu tư bên trong tour, hoặc khách hàng cung cấp URL tour thay thế chính thức. Không inject CSS/JS hoặc bypass iframe/403.
5. Full-repository lint còn lỗi từ kho website mẫu/vendor/local artifacts, nằm ngoài phần source ứng dụng được sửa trong nhiệm vụ này.

## G. Checklist kiểm tra thủ công

- [ ] Mở VI/EN ở desktop/tablet/mobile: Playfair heading, body fallback rõ dấu, logo đúng asset, chữ không bị cắt/tràn.
- [ ] Hero, header, drawer/mobile, residence, footer và 9 thẻ calculator mở đúng form; loại căn/source đúng; không chuyển sang website chủ đầu tư.
- [ ] Thử Back, Escape, Close, Tab/Shift+Tab; đóng form xong trang cuộn lại bình thường.
- [ ] Thử bỏ trống/sai email/số điện thoại/consent; lỗi giữ dữ liệu. Double click chỉ tạo một request đang xử lý.
- [ ] Với mock/local SMTP sink: kiểm tra loading → lỗi → retry → success; popup và contact đều dùng API chung. Khi cấu hình production đầy đủ, thực hiện smoke test được chủ dự án cho phép và xác nhận inbox/provider report riêng.
- [ ] Bản đồ: không còn 5 chip; chú giải, point tooltip, ngôn ngữ, zoom, drag, toàn cảnh và replay vẫn chạy. Cuộn ra khỏi bản đồ không bị giữ wheel.
- [ ] Cuộn từng section, click anchor, bật reduced motion; thử trực tiếp trên thiết bị cấu hình trung bình.
- [ ] Footer không có menu calculator; section và các thẻ calculator còn nguyên.
- [ ] Mở WhatsApp từ sidebar/floating, xác nhận đúng tài khoản đích của URL đã cung cấp và mở tab an toàn; nút gọi điện vẫn dùng hotline hiện hành.
- [ ] Sau khi nhà cung cấp xử lý tour: thử Start, loading/progress, fullscreen và thao tác mobile; kiểm tra không redirect ngoài ý muốn.

Không xác nhận đã nhận email thật hoặc đã sửa nội dung bên trong nền tảng 360 ngoài khi các phụ thuộc này chưa được kiểm chứng.
