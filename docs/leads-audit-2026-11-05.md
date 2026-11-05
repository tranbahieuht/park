# Kiểm tra lại form Norton Park sau PR #9 — 05/11/2026

Đã sửa các lỗi tái hiện được trong code. **Chưa xác nhận nguyên nhân sự cố trên Vercel Production và chưa thể khẳng định sự cố Production đã hết.** Không gửi POST Production/email thật, không thay `.env`, không commit/push/merge/deploy. Mọi dữ liệu kiểm thử là synthetic; SMTP sink và Redis HTTPS fixture chỉ chạy loopback.

## Đối chiếu PR và phiên bản

- GitHub xác nhận [PR #9](https://github.com/Linhyum/norton-park/pull/9), repo `Linhyum/norton-park`, đã merge lúc 08:17:24 ngày 05/11/2026 (UTC+7), head `7dd6e71131851172c3af6f57783864b6f4deb653`, merge commit `60640c1cac153d06822e0a8271ccd033bf13052f`.
- HEAD local chính là head của PR: 15 file, 640 additions, 53 deletions; đã đối chiếu patch GitHub với lịch sử local. Remote origin local lại là `tranbahieuht/park`; truy vấn PR #9 ở remote đó trả 404, không dùng nó làm bằng chứng cho PR này.
- PR sửa so sánh Origin theo Host, thêm phân loại lỗi SMTP/request ID, validation email dùng chung, giữ khóa khi SMTP timeout. PR không cung cấp SMTP/Redis/secret cho Vercel; cơ chế fail-closed khi thiếu secret đã tồn tại trước PR.
- Chưa có bằng chứng deployment đang phục vụ Production chứa head/merge commit này, hoặc bundle frontend và API cùng phiên bản.

## Toàn bộ luồng hiện tại

1. Các CTA desktop/mobile mở `Popup.tsx` (`#popForm`); form Contact hai bước là `Register.tsx` (`#leadForm`). Hero/header/mobile/sidebar/calculator/residence/footer truyền source/unit qua launcher; chỉ có hai form và một endpoint gửi lead.
2. Hai form kiểm tra honeypot, pending/sent và `leadFieldErrors`: tên, điện thoại, email optional, consent. Contact giữ lựa chọn căn khi next/back. Không có fetch khi validation client thất bại.
3. `useLeadSubmission` gọi lại `validateLead`, thêm thời gian ISO, khóa bằng ref trước fetch để chặn double click, POST JSON tương đối `/api/leads`, timeout 45 giây, không tự retry. Lỗi giữ field; chỉ HTTP thành công + `ok:true` + `code:ACCEPTED` mới bật success/analytics/local marker.
4. API Node.js, `maxDuration=60`: tạo request ID → Origin/Fetch Metadata → Content-Type → rate limit → body tối đa 8192 byte/JSON/schema → HMAC dedupe → SMTP → hoàn tất marker → response no-store.
5. Origin được so với authority Host thật và protocol; chỉ tin `x-forwarded-proto` khi `VERCEL=1`, không tin `x-forwarded-host`. Origin ngoại lai/null/malformed, sai scheme/port hoặc `sec-fetch-site:cross-site` → 403. Request không có Origin vẫn được phép nếu không cross-site; đây không phải cơ chế xác thực client, limiter vẫn bắt buộc.
6. Rate limit 5 request/600 giây/IP; chỉ dùng IP forwarding trên Vercel, nơi khác dùng bucket chung. Lua INCR/EXPIRE nguyên tử, khóa chỉ chứa HMAC. Limiter chạy **trước** schema: khi cấu hình thiếu, ngay cả JSON có nội dung không hợp lệ cũng có thể nhận 503 thay vì 400.
7. Dedupe theo name/phone/email/unit, bỏ qua source/language/timestamp: processing → 409; done → 200 không gửi thêm; TTL processing 120 giây, done 24 giờ. SMTP thất bại xác định nhả khóa; timeout giữ khóa vì kết quả có thể chưa rõ.
8. Nodemailer lấy sáu biến SMTP ở server, sender là mailbox khớp SMTP_USER, recipient cố định `sales@savills.com.vn`, email khách optional chỉ dùng Reply-To; TLS/STARTTLS bắt buộc, có DNS/connection/greeting/socket timeout. Chỉ accepted đúng recipient và không rejected mới xác nhận gửi.
9. Redis hoàn tất marker thất bại sau SMTP acceptance vẫn trả 200 kèm warning nội bộ, tránh yêu cầu gửi lại thư đã được chấp nhận. Không bảo đảm exactly-once khi SMTP và Redis không thể commit cùng một giao dịch; acceptance không chứng minh thư đã vào inbox.

## Những nhánh tạo thông báo đang báo lỗi

UI hiện tại hiện “Dịch vụ đăng ký đang tạm gián đoạn” khi API trả `SERVICE_UNAVAILABLE` hoặc `UNAVAILABLE` tương thích phiên bản cũ. Các nhánh hiện tại:

| HTTP/code | Reason nội bộ | Kết quả |
| --- | --- | --- |
| 503 SERVICE_UNAVAILABLE | RATE_SECRET_MISSING / RATE_SECRET_INVALID | Thiếu/secret quá ngắn; dừng trước Redis/SMTP |
| 503 SERVICE_UNAVAILABLE | REDIS_CONFIGURATION | Thiếu URL/token, endpoint hoặc token sai định dạng |
| 503 SERVICE_UNAVAILABLE | REDIS_UNAVAILABLE | HTTP 401/403/5xx, lỗi Redis, JSON/result sai, network/timeout/redirect |
| 503 SERVICE_UNAVAILABLE | SMTP_CONFIGURATION / SMTP_AUTH | Cấu hình SMTP thiếu/sai, sender không khớp, provider từ chối auth |
| 503 SERVICE_UNAVAILABLE | ABUSE_UNAVAILABLE / UNEXPECTED_SERVICE_ERROR | Bảo vệ local không khả dụng hoặc lỗi ngoài các nhánh đã phân loại |
| 403 FORBIDDEN | ORIGIN_FORBIDDEN / FETCH_SITE_FORBIDDEN | UI hiển thị lỗi forbidden riêng; vẫn cần kiểm tra status thực trên Production |
| 503 DELIVERY_FAILED | SMTP_REJECTED / SMTP_UNAVAILABLE | UI hiển thị lỗi gửi thư riêng |
| 503 DELIVERY_UNCONFIRMED | SMTP_TIMEOUT | UI chưa xác nhận kết quả; không báo thành công, không retry tự động |
| 400/413/415 INVALID | Validation/body/content type | Không gửi thư |
| 409 BUSY / 429 RATE_LIMITED | BUSY / RATE_LIMITED | Chống trùng/chống spam; 429 có Retry-After 600 |

Vì vậy, không thể dùng riêng câu thông báo để suy ra “vẫn lỗi Origin 403” hoặc “chắc chắn SMTP sai”. Cần status/code/request ID/reason từ đúng deployment.

## Lỗi đã tái hiện và thay đổi

Bốn bài kiểm thử bổ sung đã FAIL trên code PR #9, sau sửa đều PASS. Đây là lỗi code/config validation đã xác nhận, **không phải bằng chứng chúng đang gây sự cố Production**.

| Vấn đề đã xác nhận | Trước sửa | Sau sửa |
| --- | --- | --- |
| Redis counter nhận null/false/rỗng hoặc sai kiểu | Number(null)=0; có thể vượt qua limiter | Chỉ chấp nhận số nguyên dương an toàn, sai kiểu → 503 REDIS_UNAVAILABLE |
| Claim Redis sai kiểu hoặc hoàn tất không giữ được owner | Giá trị falsy có thể được coi là đã chiếm khóa; completion=0 bị bỏ qua | Kiểm tra empty/done/UUID owner; finish phải trả 1; không gọi SMTP khi claim sai |
| Kiểm tra URL/token Redis thiếu | Chỉ startsWith https; checker và runtime không đồng nhất, có thể gửi request tới path/dashboard sai | Parse HTTPS database root, cấm userinfo/path/query/fragment, token whitespace, redirect; cấu hình dở dang không fallback local |
| Secret ngắn và thiếu cùng reason; chuỗi 32 dấu cách vượt kiểm tra | Khó phân biệt thiếu với không hợp lệ | Missing/invalid riêng; trim-length tối thiểu 32, vẫn dùng secret gốc cho HMAC |
| Host sai làm URL.host setter im lặng bỏ qua | `[broken]` có thể rơi về localhost; request đi tiếp thay vì 403 | Parse authority hoàn chỉnh và kiểm tra cú pháp, giữ Origin protection |
| Log thiếu status/code và không có diagnostic 403/409/429 | Khó ghép lỗi UI/API với nguyên nhân | Thêm status/code và reason an toàn, dùng request ID sinh ở server; không log PII/provider text |

Các file thay đổi: `src/lib/leads/abuse.ts`, `src/app/api/leads/route.ts`, `scripts/check-lead-config.mjs`, `scripts/leads.test.mjs`, `scripts/leads-integration.mjs`, `scripts/feedback-flows.test.mjs`, tài liệu này và `docs/smtp-leads.md`. Không thay nội dung thông báo UI, recipient hay credentials.

## Cấu hình bắt buộc và trạng thái xác minh

`node scripts/check-lead-config.mjs` xác nhận **local thiếu cả chín biến** dưới đây; không có file `.env`, `.env.local`, `.env.production`, `.env.production.local`. Chỉ in tên/trạng thái, không đọc ra giá trị bí mật. Đây là kiểm tra local, không phản ánh Vercel.

| Biến | Điều kiện runtime bắt buộc | Production |
| --- | --- | --- |
| SMTP_HOST | Host không rỗng, không whitespace/control; provider có thể kết nối | Chưa xác minh |
| SMTP_PORT | Số nguyên 1–65535, đúng cổng provider | Chưa xác minh |
| SMTP_SECURE | true/false; 465 phải true; false bắt buộc STARTTLS | Chưa xác minh |
| SMTP_USER | Mailbox hợp lệ, có quyền gửi | Chưa xác minh |
| SMTP_PASSWORD | Không rỗng, provider chấp nhận | Chưa xác minh |
| SMTP_FROM | Mailbox hợp lệ, khớp SMTP_USER, provider cho phép | Chưa xác minh |
| UPSTASH_REDIS_REST_URL | HTTPS root database, không phải console/command URL | Chưa xác minh |
| UPSTASH_REDIS_REST_TOKEN | Write token đúng database, hỗ trợ EVAL và các lệnh trong Lua | Chưa xác minh |
| LEAD_RATE_LIMIT_SECRET | Secret ngẫu nhiên độc lập, tối thiểu 32 ký tự sau trim | Chưa xác minh |

**Thiếu LEAD_RATE_LIMIT_SECRET trên NODE_ENV=production hoặc VERCEL=1:** trả 503 `SERVICE_UNAVAILABLE`, log `RATE_SECRET_MISSING`; không gọi Redis hay SMTP, không dùng secret development, không trả thành công giả. Nếu secret hợp lệ nhưng thiếu Redis, reason là `REDIS_CONFIGURATION`.

Cấu hình phải thuộc đúng Project và scope Production; Preview có thể khác. Biến thay đổi chỉ áp dụng cho deployment mới, không tự cập nhật deployment cũ. Cần runtime Node.js, outbound HTTPS Redis và SMTP/TLS, thời lượng function phù hợp `maxDuration=60`. Việc deploy/cập nhật env do chủ dự án thực hiện ngoài phiên này. [Vercel environment variables](https://vercel.com/docs/environment-variables), [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

## Bằng chứng kiểm thử lần này

| Kiểm tra | Kết quả |
| --- | --- |
| Baseline PR #9: node --test scripts/leads.test.mjs scripts/location-map-i18n.test.mjs | PASS 18/18 trước khi thêm test |
| Bốn test hồi quy mới chạy trước sửa | FAIL 4/4, tái hiện Redis result/config, secret classification, Host malformed |
| Bộ unit/API cuối: cùng lệnh trên | PASS 27/27: 21 lead tests + 6 map tests |
| node scripts/leads-integration.mjs temp/lead-test-cert.pem temp/lead-test-key.pem | PASS Next production HTTP + Nodemailer/TLS thật trên loopback; thiếu secret, Origin 403, Redis 401/result null, validation, SMTP 535 auth, DATA rejection, retry, accepted/done duplicate, 429, concurrent 409, socket timeout thật và khóa retry |
| Browser trong integration | PASS Chrome 1440/390 × VI/EN, cả popup và Contact → API thật → TLS sink; validation, optional fields, pending, lỗi auth, retry, double click, source/language/unit |
| Browser mock: scripts/feedback-flows.test.mjs trên server loopback | PASS Chrome và Edge, mỗi browser 1440/390 × VI/EN; hai form với 400/403/409/429/503, SERVICE_UNAVAILABLE/DELIVERY_FAILED/DELIVERY_UNCONFIRMED, giữ fields, không success sai; popup network/timeout/retry; CTA và map regressions |
| npm run typecheck | PASS (exit 0) |
| npm run lint -- src scripts | PASS (exit 0), mã ứng dụng và kiểm thử không có lỗi/warning |
| npm run lint -- --format json --output-file temp/leads-followup-lint.json | FAIL (exit 1): 669 errors, 35718 warnings có sẵn; New folder 622 errors/35716 warnings, temp 47 errors/2 warnings, application/other 0/0 |
| npm run build | PASS (exit 0), production compile/typecheck/prerender, /api/leads dynamic Node route |
| node scripts/check-lead-config.mjs | FAIL (exit 1) vì local thiếu chín biến; không thử auth/connectivity |

Lần typecheck/build đầu trong lúc sửa phát hiện kiểu URL có thể undefined; đã sửa và chạy lại PASS. Browser mock lần khởi động đầu thất bại ERR_CONNECTION_REFUSED vì server 3100 chưa chạy; khởi động local server rồi chạy lại PASS. Không che hoặc tính các lần thử này thành PASS.

Unit tests xóa biến dịch vụ kế thừa khỏi process kiểm thử; SMTP được stub. Integration từ chối chạy nếu có file env thật, chỉ dùng credentials synthetic và CA localhost trên child process, không tắt TLS verification. Redis là fixture giao thức, không phải Upstash thật. Báo cáo cũ ngày 04/11 là lịch sử; các kết quả ở bảng trên là chạy lại trong phiên này.

## Runtime Logs cần xem để khép lại sự cố Production

Chưa có Vercel connector/project link (`.vercel/project.json` không có) để đọc env/log Production trong phiên này. Không suy đoán giá trị hay biến thiếu tại Vercel.

Lấy dữ liệu từ **lượt lỗi đã có**, không cần gửi POST mới:

1. Project, environment Production, deployment URL/id, commit đang phục vụ frontend và API, thời điểm lỗi (ghi timezone UTC+7; log Vercel hiển thị UTC), method POST, path `/api/leads`.
2. HTTP status, JSON response `code`, header `X-Request-Id` từ Network của lượt lỗi nếu còn, và Vercel platform Request Id trong log details. Hai ID này khác nhau; tìm custom ID trong **nội dung log**, không coi nó là metadata Request Id của Vercel.
3. Đọc `event`, `reason`, `status`, `code` của log ứng dụng có cùng custom requestId. Code PR #9 chỉ log event/requestId/reason cho lỗi dịch vụ; status/code bổ sung và diagnostic 403/409/429 chỉ xuất hiện sau khi bản sửa này được chủ dự án triển khai.
4. 403 có `ORIGIN_FORBIDDEN`/`FETCH_SITE_FORBIDDEN`: đối chiếu authority/scheme/port thực tế của Origin, Host và trusted proxy với route; kiểm tra custom domain/rewrite. Không bỏ Origin protection hoặc tin tùy ý forwarded-host để ép pass.
5. 503 đối chiếu reason trong bảng trên. Với Redis cần tình trạng database/token/quyền EVAL/HTTP/connectivity; SMTP cần config/auth/quyền sender/connectivity/TLS. Chỉ cung cấp tên biến và trạng thái configured/missing, không cung cấp giá trị.
6. Nếu response không có JSON/X-Request-Id hoặc không có log ứng dụng tương ứng, ghi status + error code do Vercel/Firewall/Deployment Protection trả về trong log details, duration và deployment; chưa thể gán nó cho nhánh SMTP/Redis của route. Không tự kết luận mọi 403 đều do code Origin.

Log mới chỉ gồm metadata/enum an toàn, ví dụ cấu trúc `{event, requestId, status, code, reason}`. Không chia sẻ body form, thông tin khách, raw provider error, password hoặc Redis token. [Vercel Runtime Logs](https://vercel.com/docs/logs/runtime).

## Kết luận

| Hạng mục | Kết luận |
| --- | --- |
| Nguyên nhân đã xác nhận | Local thiếu cả chín biến → production-mode API 503 trước SMTP; các nhánh secret/Redis/SMTP đều tái hiện được. Có thêm lỗi validation Redis/Host trên code PR #9. Chưa xác định nhánh thực tế tại Vercel |
| Thay đổi đã làm | Chặn Redis response/config sai, bảo toàn chống spam/claim, sửa parse Host, secret invalid riêng, diagnostic status/code/request ID và thêm regression tests |
| Điều kiện Vercel bắt buộc | Chín biến đúng scope/deployment, Node.js, Redis HTTPS/write/EVAL và SMTP auth/TLS hoạt động; code/bundle đúng phiên bản |
| Bằng chứng | 27/27 unit/API, production build/typecheck/scoped lint và local HTTP/TLS/browser PASS; lint toàn repository FAIL đã nêu riêng |
| Chưa xác minh Production | Commit đang chạy, env/status, runtime logs/status/code/reason, proxy/Origin, Redis thật, SMTP thật và inbox delivery |
