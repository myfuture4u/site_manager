# Deploy Site Manager lên Vercel

Ứng dụng hiện dùng **SQLite** (file local) và **lưu file upload vào local filesystem** — cả hai đều không hoạt động được trên Vercel (serverless, stateless). Cần migrate trước khi deploy.

## Tóm tắt thay đổi cần làm

| # | Vấn đề | Giải pháp | Trạng thái |
|---|--------|-----------|------------|
| 1 | SQLite không chạy trên Vercel | Migrate sang **PostgreSQL** (Neon.tech) | ✅ Hoàn thành |
| 2 | File upload lưu local | Dùng **Vercel Blob** | ✅ Hoàn thành |
| 3 | Environment variables | Cấu hình trên Vercel dashboard | ✅ Hoàn thành |
| 4 | Custom domain | Trỏ domain công ty | ⏳ Tạm hoãn (Dùng Vercel domain) |

> [!IMPORTANT]
> Anh sẽ cần tự làm một số bước cần tài khoản trên trình duyệt (tạo DB Neon, kết nối Vercel với GitHub repo). Em sẽ hướng dẫn từng bước rõ ràng.

---

## Proposed Changes

### 1. Database — SQLite → PostgreSQL (Neon)

**[DONE] Anh cần làm (browser):**
- Đăng ký / đăng nhập tại [neon.tech](https://neon.tech) → tạo project mới → copy **Connection String**

**[DONE] Em sẽ làm (code):**

#### [MODIFY] [schema.prisma](file:///c:/SRC/site_manager/prisma/schema.prisma)
- Đổi `provider = "sqlite"` → `provider = "postgresql"`

#### [MODIFY] [package.json](file:///c:/SRC/site_manager/package.json)
- Thêm `"@vercel/blob": "latest"` vào dependencies

#### [MODIFY] [.env](file:///c:/SRC/site_manager/.env)
- Đổi `DATABASE_URL` sang PostgreSQL connection string (local dev dùng Neon URL luôn cho tiện)

---

### 2. File Upload — Local → Vercel Blob [DONE]

#### [MODIFY] [attachments/route.ts](file:///c:/SRC/site_manager/src/app/api/sites/[id]/attachments/route.ts)
- Đã thay thế logic lưu local bằng `@vercel/blob` thông qua lệnh `put()`.
- FileUrl hiện tại trỏ trực tiếp đến Vercel Storage.

---

### 3. Vercel Configuration [DONE]

#### [NEW] [vercel.json](file:///c:/SRC/site_manager/vercel.json)
- Đã cấu hình lệnh build bao gồm `prisma generate` để đảm bảo client luôn khớp với schema mới nhất trên Vercel.

---

### 4. Environment Variables trên Vercel Dashboard

Sau khi deploy, anh cần set các biến sau trong **Vercel → Project → Settings → Environment Variables:**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | PostgreSQL URL từ Neon |
| `NEXTAUTH_SECRET` | Một chuỗi random dài (em generate cho) |
| `NEXTAUTH_URL` | `https://site-manager.qsrvietnam.app` |
| `ALLOWED_EMAIL_DOMAIN` | `qsrvietnam.com` |
| `BLOB_READ_WRITE_TOKEN` | Token từ Vercel Blob (tạo trong Vercel Storage) |

---

### 5. Domain [IN PROGRESS]

- Hiện tại đang sử dụng domain mặc định của Vercel theo yêu cầu của anh để test nhanh.
- Khi nào anh muốn trỏ `site-manager.qsrvietnam.app`, em sẽ hỗ trợ cập nhật `NEXTAUTH_URL` và cấu hình bản ghi DNS.

---

## Verification Plan

### Tự động
- `npx prisma migrate deploy` — chạy migration lên PostgreSQL (em chạy)
- `npm run build` — verify không có compilation error (em chạy)

### Kiểm tra thủ công (anh kiểm tra)
1. Truy cập `https://site-manager.qsrvietnam.app` → trang login hiện ra
2. Đăng nhập bằng tài khoản admin → vào dashboard thành công
3. Upload một file ảnh vào một site → file hiển thị bình thường (từ Vercel Blob URL)
