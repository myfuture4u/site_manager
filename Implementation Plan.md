# Implementation Plan History

## Kế hoạch triển khai (Implementation Plan) - Vòng 2 (04/03/2026)
**Trạng thái**: Hoàn thành (Completed)
Mục tiêu: Hoàn thiện các góp ý từ lần báo cáo gần nhất về giao diện (link, thumbnail, lọc thời gian) và tính năng nâng cao (Master Data).

### 1. Dashboard - Clickable "Hoạt động gần đây"
- Sửa đổi UI của phần Lịch sử thay đổi (AuditLogs) trong Dashboard để toàn bộ một dòng hoạt động có thể bấm vào được (Link) -> dẫn tới `/dashboard/sites/[siteId]`.

### 2. Sửa UI Upload cho Brand Team
- Hủy bỏ các logic chặn nút "Tải lên" đối với role Brand Team/Other trong `AttachmentSection.tsx`. Cấp quyền cho toàn bộ User đã đăng nhập đều có thể thấy và bấm nút "Tải lên".

### 3. Bổ sung "Đường" (Street) & "Phường/Xã" (Ward)
- Thêm trường `street` vào model `Site`. `ward` hiện đã có sẵn. Thêm 2 input cho Tên đường và Phường/Xã vào form tạo mới/cập nhật.
- Thêm `MasterData` model để chuẩn bị cho Task 6. Cập nhật logic API để nhận thêm trường `street` khi lưu.

### 4. Hiển thị Thumbnail trong Danh sách
- API load danh sách Site cần include 1 ảnh đầu tiên làm đại diện.
- Thêm một cột hình nhỏ trong bảng mặt bằng.

### 5. Bộ lọc (Filter) theo thời gian
- Thêm filter dropdown chọn khoảng thời gian (7 ngày qua, tháng trước...). 

### 6. Quản lý Master Data
- Thiết kế CSDL cho MasterData lưu trữ danh mục.
- Tạo màn hình cài đặt danh mục cho Admin.

---

## Kế hoạch triển khai (Implementation Plan) - Vòng 1 (04/03/2026)
* Sửa lỗi Hydration Error.
* Thêm Edit User cho Admin.
* Upload Hình ảnh ngay trong Form tạo mới mặt bằng.
