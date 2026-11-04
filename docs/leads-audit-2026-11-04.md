# Norton Park / Savills — kiểm tra chức năng đăng ký tư vấn, 04/11/2026

## A. Nguyên nhân và phạm vi đã xác nhận

### Đã xác nhận và sửa trong code

1. **Same-origin POST có thể bị từ chối 403 trên production server local.** Test ban đầu gọi API trực tiếp không có Origin vẫn pass, nhưng browser thật → API trả `403 INVALID` và UI hiện thông báo chung. Nguyên nhân là phép so sánh `Origin !== new URL(request.url).origin`: Next có thể chuẩn hóa URL nội bộ thành localhost khác với Host mà browser đang dùng. Đã so khớp theo Host thực; chỉ tin forwarded protocol khi `VERCEL=1`. Vẫn từ chối Origin ngoài, Origin null/malformed và `sec-fetch-site: cross-site`. Test hồi quy và browser → API → SMTP sink đã pass sau sửa.
2. **Thông báo lỗi che mất giai đoạn thất bại.** API bắt lỗi SMTP rồi trả chung `503 UNAVAILABLE`, không có mã theo dõi và không phân loại lỗi provider. Đã thêm code an toàn theo nhóm lỗi và `X-Request-Id`; log chỉ có event/requestId/reason. Không log message/stack của provider, request body hoặc PII.
3. **Email sai chỉ hiện lỗi tổng quát.** Hai form dùng `noValidate`; validation riêng trước submit chỉ hiển thị lỗi name/phone/consent, còn email sai rơi vào lỗi tổng quát của hook. Đã dùng shared field validation và thêm lỗi email inline accessible, VI/EN. Email là optional; khoảng trắng được trim, email/unit bị omitted được chuẩn hóa thành chuỗi rỗng. Loại căn không bắt buộc.
4. **Timeout SMTP là trạng thái chưa rõ kết quả.** Trước đây mọi lỗi đều giải phóng lock ngay. Nếu phản hồi SMTP bị mất sau acceptance, gửi lại ngay có thể trùng thư. Đã giữ lock xử lý 120 giây khi timeout, không tự retry; UI báo chưa xác nhận kết quả. Đây không phải bảo đảm exactly-once giữa Redis và SMTP.
5. Kiểm tra acceptance phải chứa đúng recipient Savills, không chỉ một recipient bất kỳ; bổ sung DNS timeout bên cạnh connection/greeting/socket timeout.

### Cấu hình local đã xác nhận thiếu

Không có `.env.local`, `.env.production` hoặc `.env.production.local`; cả 9 biến SMTP/Redis/signing secret đều không có trong process. API chạy production-mode với cấu hình này **thực sự trả 503 SERVICE_UNAVAILABLE**, diagnostic `RATE_SECRET_MISSING`, không gọi SMTP. Sau khi cung cấp cấu hình **fixture loopback**, API/form hoạt động end-to-end. Fixture không phải cấu hình dùng để gửi email thật.

### Chưa xác nhận nguyên nhân production

URL do chủ dự án cung cấp: **https://norton-park-two.vercel.app/**. Chỉ kiểm tra được trang/route bằng request không gửi đăng ký. Chưa đọc được Vercel environment/runtime logs và chưa có POST production được phép thực hiện. Không kết luận Vercel cũng thiếu 9 biến hoặc gặp chính xác lỗi Origin local. Cấu hình thiếu/sai, Redis unreachable, SMTP auth/TLS/network/timeout là các khả năng cần đối chiếu log, chưa phải nguyên nhân production được xác nhận.

## Luồng thực tế

```mermaid
flowchart LR
  U[Khách / CTA] --> F[Popup hoặc form 2 bước]
  F --> V[Shared field validation]
  V --> H[POST JSON /api/leads]
  H --> O[Origin + content type]
  O --> R[Rate limit / Redis]
  R --> S[Body limit + server validation]
  S --> D[HMAC dedupe / processing lock]
  D --> M[Nodemailer / TLS SMTP]
  M --> T[sales@savills.com.vn]
  M --> A[API acceptance hoặc lỗi phân loại]
  A --> I[UI loading / error / success]
```

| Bước | Input / output | Thành công / thất bại |
| --- | --- | --- |
| CTA | Context source, unit và trigger | Mở popup hiện có; không thêm form khác |
| Frontend | Name, phone, optional email/unit, consent, honeypot | Field errors chặn request; dữ liệu giữ nguyên |
| HTTP | POST `/api/leads`, application/json, timestamp ISO | Ref lock + disabled pending; không gửi trùng khi double click |
| Origin | Browser Origin, Host, sec-fetch-site | Foreign/cross-site → 403 FORBIDDEN; không gọi email |
| Abuse | HMAC từ IP ở trusted Vercel proxy; Redis counters | 5 request/10 phút; 429 Retry-After 600; production fail-closed khi cấu hình/store lỗi |
| Server validation | JSON tối đa 8 KiB, schema chung, consent true | Invalid → 400; quá lớn → 413; không tin recipient do client gửi |
| Dedupe | Name/phone/email/unit chuẩn hóa, không dùng source/timestamp để bypass | Done 24 giờ → 200 không gửi lại; processing → 409; known failure nhả lock; timeout giữ lock 120 giây |
| SMTP | Server env, sender được provider cho phép, recipient cố định | TLS bắt buộc; optional Reply-To đã validate; HTML escaped + plain text + thời gian server Việt Nam |
| Response/UI | HTTP + ok + code phải cùng xác nhận accepted | Chỉ 200/ok true/ACCEPTED mới success/analytics; lỗi không xóa field và không tự retry |

Payload thực tế: `name`, `phone`, `email`, `unit`, `language`, `source`, `consent`, `website`, `registeredAt`. Email và unit có thể rỗng; consent là boolean true. Time trong email lấy từ server, không tin thời gian client làm thời gian tiếp nhận.

### CTA audit

| Vị trí | Form / source |
| --- | --- |
| Hero | Popup / `hero_consultation` |
| Header desktop | Popup / `header_consultation` |
| Header mobile | Popup / `mobile_consultation` |
| Drawer desktop / mobile | Popup / `sidebar_consultation` hoặc `mobile_consultation` |
| Calculator chính, 9 thẻ và drawer calculator | Popup / `pricing_calculator`; giữ đúng unit nếu đã chọn |
| Residence detail | Popup / `residence_consultation`, đúng căn đang xem |
| Footer đăng ký | Popup / `contact_form` |
| Form 2 bước ở Contact | `leadForm` / `contact_form` |
| Popup tự mở | `popForm` / `popup` |

Chỉ hai form và một endpoint/service. Không thấy endpoint gửi lead cũ khác trong source ứng dụng. Link pricing hiện dùng `#register` tại website hiện tại. Phone vẫn là tel, WhatsApp giữ URL cấu hình, navigation giữ anchor; không bị chuyển thành gửi lead. Không sửa Header/Footer/360/map hoặc cấu hình môi trường trong lượt này.

## B. Các file đã sửa

| File | Mục đích |
| --- | --- |
| `src/app/api/leads/route.ts` | Fix Origin/Host, request ID, diagnostic an toàn, code lỗi, giữ timeout lock |
| `src/lib/leads/validation.ts` | Field validation dùng chung; optional email/unit và trim email |
| `src/lib/leads/mail.ts` | Phân loại lỗi SMTP, acceptance đúng recipient, DNS timeout |
| `src/lib/leads/abuse.ts` | Thêm reason enum nội bộ cho signing/Redis; giữ cơ chế hạn chế/dedupe |
| `src/lib/leads/errors.ts` (mới) | Lỗi delivery có enum; loại bỏ nội dung lỗi provider khỏi response/log |
| `src/components/sites/nortonpark/lib/useLeadSubmission.ts` | UI phân biệt forbidden/service/delivery/network/timeout; giữ busy ref và xác nhận acceptance |
| `src/components/sites/nortonpark/overlays/Popup.tsx` | Field errors chung, inline optional-email error |
| `src/components/sites/nortonpark/sections/Register.tsx` | Cùng validation/email error; giữ form 2 bước và lựa chọn căn |
| `src/components/sites/nortonpark/data/i18n.ts` | Thông báo an toàn VI/EN theo từng nhóm lỗi |
| `scripts/leads.test.mjs` | Behavior tests Origin, validation, provider classification, privacy, timeout lock, recipient |
| `scripts/feedback-flows.test.mjs` | Browser behavior: email inline, HTTP code, network/AbortSignal, CTA metadata và retry |
| `scripts/check-lead-config.mjs` (mới) | Chỉ liệt kê tên biến thiếu/sai format ở local, không in secret |
| `scripts/leads-integration.mjs` (mới) | Real production Next HTTP + real Nodemailer/TLS + SMTP sink/Redis protocol fixture; browser submit hai form |
| `docs/smtp-leads.md` | Cấu hình/diagnostics/test commands cập nhật |
| `docs/leads-audit-2026-11-04.md` (mới) | Báo cáo này |

Không đổi package/lockfile, provider credentials, recipient, Supabase, tài nguyên branding hay các section không liên quan. Không tạo API giả hoặc bỏ qua TypeScript/ESLint. Không tự stage/commit/push/merge/deploy.

## C. Kết quả test

| Kiểm tra | Kết quả |
| --- | --- |
| `node --test scripts/leads.test.mjs scripts/location-map-i18n.test.mjs` | PASS 18/18: 12 lead/API/SMTP tests và 6 map regressions |
| `node scripts/leads-integration.mjs temp/lead-test-cert.pem temp/lead-test-key.pem` | PASS production-mode local HTTP/TLS; missing config, auth failure, DATA rejection, retry, concurrency/dedupe, optional fields, đúng recipient và SMTP socket timeout thật |
| Browser → real API → TLS sink | PASS Chrome, 1440/390px × VI/EN; cả popup và Contact, email/unit optional, inline errors, checkbox, pending, auth error, retry, double click, radio state và source payload |
| `node scripts/feedback-flows.test.mjs` + Edge (`QA_CHANNEL=msedge`) | PASS 8 tổ hợp desktop/mobile/VI/EN; cả 9 thẻ calculator, source/unit, HTTP 400/409/429/503, network abort, AbortSignal timeout, retry, focus, map/CPU regressions |
| `npm run build` | PASS production compilation + prerender, `/api/leads` dynamic Node handler |
| `npm run typecheck` | PASS |
| `npm run lint -- src scripts` | PASS |
| `npm run lint` toàn repository | FAIL 669 lỗi / 35718 warnings; 622 errors ở `New folder`, 47 ở `temp`; source và scripts không có lỗi. Không sửa/xóa archive để che kết quả |
| Import/path audit | PASS 78 source/import/asset files, đúng casing; `errors.ts` mới phải add khi bàn giao |
| `npm ls --omit=dev --depth=0` | PASS, runtime dependencies có Next/React/Nodemailer; không thêm dependency runtime |
| `node scripts/check-lead-config.mjs` | FAIL có chủ đích vì thiếu 9 biến local; không có giá trị secret trong output |

Tất cả automated tests dùng dữ liệu synthetic. SMTP sink chỉ bind loopback, không forward ra ngoài; Redis là HTTPS protocol mock, không phải bằng chứng về Upstash thật. Child test process chỉ tin localhost CA được tạo tạm, không tắt TLS verification. Script integration từ chối chạy nếu có file env local/production để tránh lấy nhầm tài khoản thật. Không gửi email tới inbox Savills.

Các code mới: 403 FORBIDDEN; 503 SERVICE_UNAVAILABLE / DELIVERY_FAILED / DELIVERY_UNCONFIRMED. 400/413 INVALID, 409 BUSY, 429 RATE_LIMITED và 200 ACCEPTED được giữ. Frontend vẫn hiểu UNAVAILABLE cũ để không báo success sai khi gặp backend phiên bản cũ.

## D. Email configuration

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

Cả 9 tên trên thiếu ở local hiện tại. Không có quyền đọc giá trị/status của chúng ở Vercel, nên **chưa biết biến nào thiếu ở Production/Preview**. Provider SMTP thật chưa xác định; không tự chọn Gmail, host, username hoặc password. Recipient luôn `sales@savills.com.vn`; sender là mailbox cấu hình khớp SMTP_USER, không giả mạo Savills. Email khách optional chỉ làm Reply-To sau validation.

Thiết lập tại Vercel Project → Settings → Environment Variables, chọn đúng **Production** và **Preview** theo nhu cầu; không đặt prefix NEXT_PUBLIC_. Kiểm tra host/port/secure theo provider (465 implicit TLS; 587 STARTTLS), SMTP credentials và quyền sender; Redis REST endpoint HTTPS/write token và signing secret độc lập ít nhất 32 ký tự. Khi chủ dự án thay env, cần redeploy thủ công để deployment mới dùng cấu hình. Xem [SMTP guide](smtp-leads.md) và [Vercel environment variables](https://vercel.com/docs/environment-variables).

## E. Production status — tách riêng năm tầng

| Tầng | Trạng thái | Bằng chứng / giới hạn |
| --- | --- | --- |
| A. Local production build | **[PASS]** | `npm run build` thành công |
| B. Local API với fixture hợp lệ | **[PASS]** | Browser thực → API → Nodemailer TLS → loopback sink; không phải SMTP production |
| B. Local API với env thật hiện có | **[FAIL]** | Thiếu biến, trả 503 trước SMTP; không đổi thành success giả |
| C. Vercel build cho code sửa lần này | **[BLOCKED]** | Chưa deploy theo yêu cầu; không có quyền đọc build logs/dashboard. Trang hiện tại 200 không chứng minh code mới đã build trên Vercel |
| D. Vercel route tồn tại | **[PASS]** | GET `/` 200; GET `/api/leads` 405; OPTIONS `/api/leads` 204, Allow `OPTIONS, POST`, server Vercel |
| D. Vercel POST/API đăng ký end-to-end | **[BLOCKED]** | POST chưa được gửi; auto-review từ chối cả request JSON rỗng vì có thể tạo log/tác động limiter/dedupe. Cần cho phép rõ bước này trước khi thử lại |
| E. Giao email thật tới Savills | **[NOT TESTED]** | Không gửi thư thật; chưa có SMTP/Redis production được kiểm chứng, không có provider delivery/inbox report |

Không có Vercel connector/CLI credential/project link trong workspace để đọc environment hoặc runtime logs. Truy cập mạng chỉ đọc ban đầu bị sandbox chặn; sau khi được hệ thống cho phép, các GET/OPTIONS nói trên đã thực hiện thành công. Riêng POST production đã bị từ chối bởi automatic approval review, không được thực hiện qua cách khác.

## F. Kiểm tra thủ công trên Vercel

1. Chủ dự án review/add/commit những file ở mục G; deploy theo quy trình của mình. Phiên này không commit/deploy. Xác nhận commit và deployment URL đang kiểm tra.
2. Kiểm tra Build Logs hoàn tất và function `/api/leads` dùng Node.js, `maxDuration=60`, không bị cấu hình project override không phù hợp. Kiểm tra riêng Production/Preview env; xác nhận kết nối Redis, outbound SMTP, TLS và sender permissions với provider.
3. Mở DevTools → Network, bật Preserve log; vào popup bằng Hero/Header/Drawer/Pricing và form Contact. Kiểm tra source/unit/language; không chia sẻ screenshot payload có PII.
4. Thử thiếu tên, phone sai, email sai, chưa consent: có lỗi đúng trường, không có request gửi. Thử email và unit rỗng: đây là input hợp lệ. Không submit hợp lệ vào production nếu chưa được phép gửi thư thật hoặc chưa có môi trường test cô lập.
5. Với một lượt gửi đã được chủ dự án cho phép: kiểm tra đúng POST JSON `/api/leads`; loading/disabled; response status/code và header `X-Request-Id`. Không dùng double click/retry liên tiếp để thử inbox production. Các bài test này đã có ở local sink.
6. Vercel Project → Logs, chọn đúng deployment/environment/time, lọc path `/api/leads` và requestId. Mã mới log event `lead_service_error` với reason enum. Không gửi raw logs có email/password/token. Hướng dẫn chính thức: [Vercel Runtime Logs](https://vercel.com/docs/logs/runtime).
7. Đối chiếu reason: RATE_SECRET_MISSING → signing secret; REDIS_CONFIGURATION/UNAVAILABLE → env/REST/token/kết nối; SMTP_CONFIGURATION → env/format/sender; SMTP_AUTH → provider credential/quyền gửi; SMTP_TIMEOUT → kết nối/provider và kết quả chưa rõ; SMTP_REJECTED/UNAVAILABLE → sender/recipient/provider/connectivity. Không tắt TLS hoặc rate limit để ép success.
8. 200 ACCEPTED chỉ chứng minh SMTP acceptance/duplicate done; đối chiếu provider delivery/bounce report và inbox Savills để xác nhận giao thật. Nếu timeout, chờ khóa xử lý thay vì gửi lại ngay; không khẳng định request chưa gửi thư.
9. Thông tin cần cung cấp để chẩn đoán production tiếp: deployment/commit/environment, thời điểm + timezone, status/code/requestId và **reason đã lọc PII**, danh sách tên biến được cấu hình (không cần giá trị), provider và port/TLS được dùng. Không gửi credentials.

## G. Git status / bàn giao

**Modified — cần đưa vào commit sau review:**

```text
docs/smtp-leads.md
scripts/feedback-flows.test.mjs
scripts/leads.test.mjs
src/app/api/leads/route.ts
src/components/sites/nortonpark/data/i18n.ts
src/components/sites/nortonpark/lib/useLeadSubmission.ts
src/components/sites/nortonpark/overlays/Popup.tsx
src/components/sites/nortonpark/sections/Register.tsx
src/lib/leads/abuse.ts
src/lib/leads/mail.ts
src/lib/leads/validation.ts
```

**New — cần add đầy đủ:**

```text
docs/leads-audit-2026-11-04.md
scripts/check-lead-config.mjs
scripts/leads-integration.mjs
src/lib/leads/errors.ts
```

**Deleted:** không có. **Thay đổi có sẵn giữ nguyên:** nested repository `New folder/input-extracted/a/a`.

Không add `temp/`, localhost certificate/private key, `.env.local`, `.next` hoặc credentials. Chứng chỉ test và dữ liệu sink là local/synthetic, nằm ở thư mục ignored. Không có file env hoặc password thật được thêm vào source.
