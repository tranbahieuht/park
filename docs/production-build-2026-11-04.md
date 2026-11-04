# Norton Park — sửa production build, 04/11/2026

## 1. Nguyên nhân

HEAD được kiểm tra: `d0cede8`. Các file mới của lượt Savills đã tồn tại trong working tree nhưng chưa được Git theo dõi. Vì Vercel build từ commit Git, chúng không có trong checkout của deployment. Build trên máy Windows trước đó vẫn tìm thấy các file local này.

| Lỗi | Kiểm tra trực tiếp và cách xử lý |
| --- | --- |
| `styles/fonts.css` không tìm được typography | Relative path cũ đúng trên working tree, nhưng đích `public/sites/nortonpark/typography.css` chưa tracked. Chuyển import global CSS trực tiếp sang root layout bằng `../../public/sites/nortonpark/typography.css`; xóa wrapper `fonts.css` không còn cần thiết. Cùng file vẫn được public URL `/sites/nortonpark/typography.css` phục vụ cho iframe bản đồ. |
| ChatWidget không resolve `./WhatsAppLink` | Component thực tế ở thư mục cha `nortonpark/WhatsAppLink.tsx`, chưa tracked. Source hiện tại đã dùng đúng `../WhatsAppLink`; không còn import `./WhatsAppLink` trong overlays. Nếu log ghi `./WhatsAppLink`, đó không phải nội dung file đang có ở working tree này. |
| Drawer không resolve `../WhatsAppLink` | Import hiện tại đúng; module đích chưa tracked. Giữ nguyên component thật và interface đang dùng. |
| Fab không resolve `./WhatsAppLink` | Import source hiện tại đúng là `../WhatsAppLink`; cùng nguyên nhân thiếu file đích trong Git. |
| NortonParkPage không resolve `./lib/useConsultationLaunchers` | Import và tên file đúng; hook đầy đủ có trên máy nhưng chưa tracked. Popup cũng import type từ hook này. |
| Font/icon có thể 404 sau khi build | Bốn font WOFF2 mới và icon WhatsApp cũng chưa tracked; phải đưa lên Git cùng CSS, component và giấy phép. |

Không thay component/hook bằng mock. `WhatsAppLink` dùng `SAVILLS_CONTACT.whatsappUrl = https://wa.me/qr/ZTIBEMDEW7LZE1`, target `_blank`, rel `noopener noreferrer`, label VI/EN, disabled an toàn nếu cấu hình rỗng. Hook tiếp tục mở popup tư vấn hiện có qua `np:consultation`, đóng drawer, giữ nguồn hero/sidebar/mobile/header/contact/residence/pricing và loại căn phù hợp.

Typography giữ Playfair Display và fallback Montserrat có giấy phép. Gotham chưa có bằng chứng quyền dùng webfont nên tiếp tục không được kích hoạt; không tải thêm font hoặc thay logo.

## 2. Thay đổi trong lượt này

| File | Thay đổi |
| --- | --- |
| `src/app/layout.tsx` | Import trực tiếp typography dùng chung trong root layout để Next bundle CSS. |
| `src/components/sites/nortonpark/styles/fonts.css` | Xóa wrapper import cũ; không xóa font hoặc tính năng typography. |
| `tsconfig.json` | Bật rõ `forceConsistentCasingInFileNames`; giữ strict TypeScript. |
| `scripts/check-production-paths.mjs` | Script mới: kiểm tra import local của toàn bộ source/build config, CSS được tham chiếu, font/icon và asset public tĩnh, đúng từng ký tự hoa/thường ngay cả trên Windows. `--git` yêu cầu các dependency này có trong Git index. |
| `package.json` | Chạy kiểm tra đường dẫn trước `next build`; không thay dependency hoặc lockfile. |
| `.github/workflows/ci.yml` | Thêm job production build riêng trên Ubuntu + Node 24 + `npm ci`, Git-index audit và test mock SMTP/bản đồ. Giữ nguyên job quality hiện có. |
| `docs/production-build-2026-11-04.md` | Báo cáo này và danh sách bàn giao. |

Hai module và bộ font/icon bên dưới đã có từ lượt trước; lượt này kiểm tra và đưa vào danh sách cần add, không tạo lại module giả. Chưa chạy `git add`, commit, push, merge hoặc deploy.

## 3. Kết quả kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run build` | PASS production compile, TypeScript, prerender; `/` static, `/api/leads` dynamic. |
| `node scripts/check-production-paths.mjs` | PASS, 77 source/import/asset files đúng tên và casing. Không phát hiện thêm import local không resolve trong source/build config. |
| Kiểm tra guard bằng fixture tạm | PASS: import sai casing bị từ chối ngay trên Windows; import thiếu module bị từ chối. Fixture đã xóa trong finally. |
| `node scripts/check-production-paths.mjs --git` | FAIL có chủ đích: chỉ ra các dependency chưa nằm trong Git index; đây là blocker còn lại trước khi push. Chạy lại sau khi add các file bàn giao phải PASS. |
| `npm run lint -- src scripts` | PASS. Không tắt ESLint. |
| `npm run typecheck` | PASS. Không bỏ qua TypeScript errors. |
| `node --test scripts/leads.test.mjs scripts/location-map-i18n.test.mjs` | PASS, 14/14, SMTP được mock; không gửi email thật. |
| Production browser regression | PASS, Chrome/Edge × 1440/390px × VI/EN = 8 tổ hợp, không pageerror. |
| `git diff --check` | PASS. |

Browser chạy bản build qua `npm run start`, không dùng `npm run dev`. Đã kiểm tra typography/font load, không tràn ngang, WhatsApp href/target/rel/labels, menu, popup/Close/Escape/Back/focus, hero/sidebar/mobile/pricing source và loại căn, loading/error/retry/success/double submit, anchor/snap/reduced motion, ngôn ngữ và bản đồ legend/zoom/reset. Tests API xác nhận recipient Savills cố định, validation, SMTP rejection, retry, concurrent dedupe và rate limit. Nội dung external 360 không bị đổi; không tuyên bố đã kiểm tra bên trong dịch vụ tour ngoài.

**Giới hạn:** máy hiện tại là Windows, không có Linux distro trong WSL và không có Docker. Chưa thực thi build trực tiếp trên Linux/Vercel; job Ubuntu mới chưa chạy vì chưa push. Casing audit và build production local đã pass, nhưng cần xem kết quả job Ubuntu/Vercel sau khi các file được đưa vào Git. Audit asset chỉ kiểm tra đường dẫn tĩnh, không cố suy diễn URL được ghép động. Browser regression bổ sung kiểm tra asset/font thực tế.

Job quality cũ vẫn dùng lint toàn repository, có lỗi archive/vendor/local artifacts đã ghi trong báo cáo Savills trước. Job production build mới chạy độc lập để thể hiện rõ build Linux; không vô hiệu hóa job quality hoặc rule ESLint.

## 4. Toàn bộ file mới cần add vào Git

Danh sách lấy từ `git ls-files --others --exclude-standard` sau lượt sửa này. Bao gồm cả file đã có local từ lượt trước:

```text
docs/production-build-2026-11-04.md
docs/savills-feedback-2026-11-03.md
public/sites/nortonpark/assets/icons/bootstrap-icons-LICENSE.txt
public/sites/nortonpark/assets/icons/whatsapp.svg
public/sites/nortonpark/fonts/README.md
public/sites/nortonpark/fonts/montserrat-OFL.txt
public/sites/nortonpark/fonts/montserrat.woff2
public/sites/nortonpark/fonts/playfair-display-OFL.txt
public/sites/nortonpark/fonts/playfair-display-latin-ext.woff2
public/sites/nortonpark/fonts/playfair-display-vietnamese.woff2
public/sites/nortonpark/fonts/playfair-display.woff2
public/sites/nortonpark/typography.css
scripts/check-production-paths.mjs
scripts/feedback-flows.test.mjs
scripts/feedback-ui.test.mjs
src/components/sites/nortonpark/WhatsAppLink.tsx
src/components/sites/nortonpark/lib/useConsultationLaunchers.ts
```

File tracked cần đưa vào cùng commit:

```text
.github/workflows/ci.yml
package.json
src/app/layout.tsx
tsconfig.json
src/components/sites/nortonpark/styles/fonts.css (deletion)
```

Không add `.env.local`, credential, thư mục `temp`, `.next`, `node_modules`, hoặc thay đổi có sẵn trong nested repository `New folder/input-extracted/a/a`. Không dùng `git add .` để gom các thay đổi không liên quan.

## 5. Trước khi push/deploy

1. Add đúng 17 file mới và 5 thay đổi tracked trên, bao gồm deletion của wrapper CSS.
2. Chạy `node scripts/check-production-paths.mjs --git`; phải PASS. Lệnh chỉ kiểm tra index, không tự stage hoặc commit.
3. Chạy `npm run build`, xem staged diff và xác nhận không có secret.
4. Chủ dự án tự commit/push; xác nhận job `Production build (Linux)` trên Ubuntu và build Vercel thành công.
5. Sau deploy, kiểm tra font/icon không 404, WhatsApp, các CTA/form metadata, menu, map và VI/EN. Email thật vẫn cần SMTP/Redis production hợp lệ và xác nhận nhận thư riêng; không có email thật được gửi trong lượt kiểm tra này.
