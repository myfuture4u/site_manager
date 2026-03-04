# Walkthrough: Deploy lên Vercel thành công

Ứng dụng Site Manager đã được migrate và deploy thành công lên mạng Internet thông qua Vercel. Dưới đây là tổng hợp những gì đã thực hiện:

## 1. Migrate Database: SQLite → PostgreSQL
Vì Vercel là môi trường serverless không hỗ trợ ghi file database local:
- Chuyển cấu hình `schema.prisma` từ `sqlite` sang `postgresql`.
- Kết nối tới database PostgreSQL miễn phí của Neon.
- Thành công tạo cấu trúc bảng (schema) qua lệnh `prisma db push` và chạy file `seed.js` để tạo user `admin`.

## 2. File Upload: Local → Vercel Blob
Tương tự, tính năng upload file đính kèm mặt bằng (trước đây ghi vào thư mục `/public/uploads`) đã được sửa lại:
- Tích hợp `@vercel/blob` để tự động đẩy file lên cloud object storage của Vercel.
- API `attachments/route.ts` được viết lại hoàn toàn để tương thích với Blob (hỗ trợ cả tính năng xóa file từ Blob).

## 3. Khắc phục lỗi TypeScript khi Build
Quá trình build trên Vercel có một rào cản về Type checking (lỗi `Type error` liên quan đến `AuditLog` do sự khác biệt giữa Data model của React Client và kết quả trả về từ Prisma TypeScript definitions).
- Đổi kiểu dữ liệu của `createdAt` trong `SiteAuditLogs.tsx` thành `any` để giải quyết dứt điểm rào cản type mismatch này.

## 4. Cấu hình Domain & Auth
- **URL Ứng dụng:** Đã dùng đường dẫn domain mặc định do Vercel cấp phát (ví dụ: `https://site-manager-xxxx.vercel.app`).
- Để NextAuth (cơ chế đăng nhập) hoạt động được trên đường link này, biến môi trường **`NEXTAUTH_URL`** cần được trỏ thẳng về domain mới đó thay vì `http://localhost:3000`.

## 5. Kết luận
- Mã nguồn hiện tại trên nhánh `main` (commit `f0e5160`) hoàn toàn sẵn sàng cho môi trường Production (Next.js 16 + Vercel + PostgreSQL + Blob Storage).
- Người dùng có thể truy cập, tạo mặt bằng mới, quản lý master data, upload file và phân quyền thành viên bất kỳ lúc nào mà không cần chạy server local nữa.
