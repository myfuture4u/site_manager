# Site Manager - Development Track

_File này dùng để theo dõi toàn bộ quá trình phát triển (track record) của dự án Site Manager, từ những ngày đầu khởi tạo cho đến các tính năng đang phát triển hiện tại._

## 📌 Thông tin chung
- **Dự án:** Site Manager (Quản lý mặt bằng)
- **Framework & Libraries:**
  - Frontend: Next.js (App Router), React, Tailwind CSS, Lucide Icons, react-hot-toast cho thông báo.
  - Backend: Next.js API Routes.
  - Database: PostgreSQL (Neon.tech) thông qua Prisma ORM.
  - File Storage: Vercel Blob.
  - Authentication: NextAuth.js (Credentials Provider).
- **Môi trường Deploy:** Vercel
- **URL Hiện tại:** https://site-manager-teal.vercel.app/

---

## 🚀 Giai đoạn 1: Khởi tạo và Core Features (Đã hoàn thành)
- Khởi tạo Next.js App với Tailwind CSS.
- Thiết lập Prisma với SQLite ban đầu (dùng cho local dev).
- Xây dựng hệ thống xác thực người dùng (Login/Logout) với NextAuth.
- Xây dựng giao diện cơ bản (Layout, Sidebar, TopHeader).
- Xây dựng tính năng quản lý Users (Admin Dashboard).
- Thiết kế model `Site` và API CRUD cơ bản.
- Xây dựng form Thêm/Sửa mặt bằng (SiteForm) và giao diện xem chi tiết.
- Tính năng bình luận (Comments) trên từng Site.
- Tính năng upload ảnh và file đính kèm (Lưu local) vào Site.
- Lịch sử thay đổi (Audit Logs) cơ bản: Ghi nhận ai sửa trường nào.

---

## ✨ Giai đoạn 2: Nâng cấp UI/UX và Mở rộng tính năng (Đã hoàn thành)
- Thêm hiệu ứng transition, hover scale mượt mà cho Sidebar và TopHeader.
- Staggered animation cho bảng Danh sách Mặt bằng khi load (cảm giác mượt và cao cấp).
- Tích hợp `react-hot-toast` hiển thị thông báo đẹp mắt (Success/Error).
- Bổ sung Thumbnail (ảnh đại diện) cho Site ở danh sách mặt bằng (lấy ảnh đầu tiên tải lên).
- Cải tiến tính năng Upload: Cho phép tải lên nhiều file cùng lúc ngay ở màn hình tạo Site.
- Sửa quyền upload cho các đội nhóm phòng ban khác (Brand Team / Other) để họ có thể upload tài liệu mở rộng.
- Nâng cấp màn hình Dashboard:
  - Cho phép click trực tiếp vào Recent Activities để chuyển đến trang chi tiết Site.
- Thêm chi tiết địa chỉ (Số nhà, Đường, Phường/Xã độc lập) cho Site model.
- Time-based Filters: Bộ lọc thời gian (7 ngày qua, 14 ngày, 1 quý, 1 năm) ở trang danh sách Sites.
- Master Data Management: Giao diện cho Admin quản lý cấu hình các Tỉnh/Thành phố, Quận/Huyện, Loại hình cửa hàng, Trạng thái (MasterData model).

---

## ☁️ Giai đoạn 3: Migration lên Vercel Serverless (Đã hoàn thành)
- Vấn đề: SQLite và Local Uploads không hoạt động trên kiến trúc serverless của Vercel.
- Giải pháp:
  - Migrate Database từ SQLite sang **PostgreSQL (Neon)**. Cập nhật `schema.prisma`.
  - Migrate tính năng Upload từ local (fs) sang **Vercel Blob Storage**. Sửa lại API `/api/sites/[id]/attachments/route.ts`.
  - Thiết lập Environment Variables trên Vercel.
  - Cấu hình `vercel.json` để tự động chạy `prisma generate` khi build.

---

## 🔒 Giai đoạn 4: System Roles & Visibility Workflow (Đang triển khai)
**Mục tiêu:** Cấu trúc lại toàn bộ các nhóm quyền người dùng theo quy trình thực tế của công ty và xây dựng luồng phê duyệt đóng/mở quyền xem mặt bằng.

### 4.1. Hệ thống Phân quyền mới (Roles)
- **Admin**: Quản trị viên (Toàn quyền hệ thống).
- **Site_Manager**: Quản lý bộ phận Site (Có quyền duyệt mặt bằng mở cho các team khác).
- **Site_Developer**: Nhân viên phát triển mặt bằng (Tạo mặt bằng mới).
- **BOD**: Ban Giám đốc (CEO, COO, ...).
- **GM**: Head của các thương hiệu (Brand).
- **BOM**: Board of Manager (Các bộ phận liên quan).
- **Project Team**: Bộ phận thiết kế, xây dựng và khảo sát Site.
- **Brand Team**: Bộ phận khảo sát Trade Zone (Khu vực thương mại) của Site.

### 4.2. Luồng làm việc (Visibility Workflow)
1. `Site_Developer` tạo mới một mặt bằng.
    - Lúc này mặt bằng chỉ có `Site_Developer` đó và `Site_Manager` (hoặc `Admin`) thấy được.
2. `Site_Manager` vào đối chiếu (Review).
3. `Site_Manager` duyệt: 
    - Chuyển trạng thái Site thành "New Arrival" (hoặc trạng thái tương ứng).
    - Chủ động **chọn/tích** các phòng ban/Roles được phép nhìn thấy mặt bằng này (Ví dụ: Dành riêng cho brand ABC thì mở cho GM, Brand Team tương ứng...).
    - **(Mới)** Có khả năng tìm kiếm và **chọn đích danh các cá nhân (User cụ thể)** để cấp quyền xem mặt bằng, kể cả khi họ không thuộc các Role được cấp phép.
    - **(Mới)** Gắn Thẻ Thương hiệu (**Brand**) cho mặt bằng.
    - Bấm nút **"Submit Site"**.
4. Lúc này những người thuộc Role hoặc Cá nhân được cấp phép mới:
    - Nhận được **Notification** (thông báo) về Site mới.
    - Được quyền truy cập để xem, bình luận, và upload hình ảnh/file.

---

## 🏢 Giai đoạn 5: Master Data Mở Rộng & Cấp Quyền Cá Nhân (Đã hoàn thành)
- Thêm hạng mục quản lý **Thương hiệu (Brand)** vào trang cài đặt Master Data. Admin có thể tùy ý sửa chữa, thêm bớt thương hiệu của công ty.
- Bổ sung thanh tìm kiếm `Users` vào Form duyệt (Submit/Edit) mặt bằng để `Site_Manager` và `Admin` cấp quyền truy cập vào xem Site riêng biệt cho 1 danh sách cá nhân.
- Tự động gửi thông báo (Notification) trực tiếp và cấp quyền riêng rẽ song song với quyền xem theo Nhóm/Phòng ban.

