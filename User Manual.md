# Hoàn thiện & Khởi tạo dự án (Polishing & Setup)

Môi trường dự án Site Manager đã được khởi tạo thành công cùng với các tinh chỉnh nâng cao về UI/UX.

## Những thay đổi đã thực hiện
- **Khởi tạo Database**: Chạy `npm install` và `npx prisma db push` để tạo file CSDL SQLite (`dev.db`) và cấu hình Prisma.
- **Tạo User Mẫu (Seed)**: Đã tạo 3 tài khoản test với các Role khác nhau (Mật khẩu chung cho tất cả là `123456`):
  - **Site Manager (Site Team)**: `huong.h.vo@qsrvietnam.com`
  - **Brand Manager (Brand Team)**: `thuong.t.pham@qsrvietnam.com`
  - **COO (Admin)**: `nam.h.le@qsrvietnam.com`
- **Tinh chỉnh giao diện (UI/UX)**:
  - Thêm hiệu ứng transition, hover scale mượt mà cho `Sidebar` và `TopHeader`.
  - Thêm hiệu ứng `slideUp` lần lượt (staggered animation) cho bảng Danh sách Mặt bằng, tạo cảm giác app load rất nhanh và cao cấp.
  - Tích hợp thư viện `react-hot-toast` vào `SiteForm` để hiển thị khung thông báo (toast) đẹp mắt khi người dùng Thêm mới hoặc Cập nhật mặt bằng thành công/thất bại.
  - Sửa một số lỗi TypeScript nhỏ liên quan đến NextAuth session.

## Bảng Phân Quyền Người Dùng (Role Definitions)

| Vai trò (Role) | Chức năng & Quyền hạn |
| :--- | :--- |
| **Admin** | Quản trị viên hệ thống. Có toàn quyền: Quản lý Users (Thêm, Sửa, Vô hiệu hoá), toàn quyền quản lý Sites (Thêm, Xóa, Sửa, Duyệt), xoá tài liệu/hình ảnh do người khác tải lên. |
| **Site_Manager** | Quản lý bộ phận Site. Quyền hạn chính: Xem tất cả mặt bằng, "Submit Site" và chỉ định hiển thị cho các phòng ban khác xem. |
| **Site_Developer** | Nhân viên phát triển mặt bằng. Quyền hạn: Thêm mới mặt bằng, xem mặt bằng do chính mình tạo ra. Khi tạo xong cần báo Manager hoặc tạo form duyệt để được publish. |
| **BOD / GM / BOM** | Ban Giám đốc, Board of Manager, Group Manager. Chỉ thấy các mặt bằng đã được Site Manager duyệt và cấp quyền hiển thị cho phòng ban của mình. Mới được comment. |
| **Project Team** | Bộ phận dự án xây dựng. Có quyền xem, tải tệp tin và bình luận trên những site được chia sẻ. |
| **Brand Team** | Đại diện nhãn hàng. Có quyền xem, tải tệp tin và bình luận trên những site được Site Manager chia sẻ. |

## Hướng dẫn kiểm tra (Verification)
1. Hiện tại máy chủ đang chạy ở địa chỉ: **[http://localhost:3000](http://localhost:3000)**.
2. Anh có thể sử dụng các tài khoản test trong danh sách trên (Mật khẩu chung: `123456`) để kiểm tra.
3. **Thử nghiệm Edit User**: Đăng nhập bằng `nam.h.le@qsrvietnam.com` (Admin), vào trang Người dùng và thử Edit một bạn khác.
4. **Thử nghiệm Form mới & Upload**: Đăng nhập bằng `huong.h.vo@qsrvietnam.com` (Site Team), ấn Thêm Mặt Bằng. Tại đây anh có thể tải lên cùng lúc nhiều hình ảnh ngay ở bước tạo.
5. **Thử nghiệm quyền Brand Team**: Đăng nhập bằng `thuong.t.pham@qsrvietnam.com` (Brand Team), mở một Site lên và ấn "Tải lên" ở mục Hình ảnh & Tài liệu. Kiểm tra lịch sử (Audit Log) để xem hệ thống ghi nhận ai là người tải lên.

## Các tính năng mới - Vòng 2
- **Dashboard**: Các hoạt động gần đây giờ đây có thể click trực tiếp để dẫn tới trang chi tiết mặt bằng liên quan.
- **Quản lý Hình ảnh/Tài liệu**: Sửa quyền cho Nhóm Brand Team, hiện tại Brand Team/Other đã có thể chủ động tải lên các ảnh và file đính kèm nếu đăng nhập thành công.
- **Thông tin Mặt bằng chi tiết hơn**: Trong danh sách và chi tiết, cũng như lúc tạo mới mặt bằng đã bổ sung riêng trường số nhà, Đường, Phường/Xã độc lập.
- **Ảnh đại diện (Thumbnail)**: Danh sách mặt bằng sẽ lấy hình ảnh đầu tiên được tải lên để làm ảnh đại diện hiển thị nhỏ ở cột đầu tiên. Giúp nhận biết nhanh vị trí.
- **Bộ lọc (Filter) Thời gian**: Đã có thêm tuỳ chọn bộ lọc nâng cao để xem mặt bằng theo mốc thời gian (7 ngày qua, 14 ngày, 1 quý, 1 năm).
- **Cấu hình Master Data**: Dành riêng cho User có quyền `Admin` và `Site_Manager`, hệ thống cho phép người quản trị tự định nghĩa Dữ liệu chuẩn cho toàn hệ thống: Danh sách Tỉnh/Thành phố, Phường, Loại hình mặt bằng, Trạng thái, và Thương hiệu (Brand). Truy cập qua menu con Master Data.
- **Phân Giao Bất Động Sản (Specific Assignments)**: Trong lúc duyệt mặt bằng, `Site_Manager` giờ đây hoàn toàn có quyền thêm độc lập các User (cá nhân) vào danh sách cho phép Nhìn Thấy và Bình Luận ở mặt bằng (Visibility scope), thay vì chỉ phân phối hiển thị theo tổ chức nhóm. Khi cập nhật thành công, các User cá nhân đó sẽ nhận được chuông thông báo bình thường.
