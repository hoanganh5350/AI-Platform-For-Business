# Sơ đồ tuần tự - Phê duyệt yêu cầu (Maker-Checker)

Actors tham gia: `ADMIN_SYSTEM` (Duyệt mọi Request), `ADMIN` (Chỉ duyệt Request BUSINESS).  
Actors không tham gia: `BUSINESS`, `WEBSITE USER`.

```mermaid
sequenceDiagram
autonumber

actor Approver as ADMIN_SYSTEM / ADMIN
participant RequestUI as Giao diện quản lý Request
participant RequestControl as Control quản lý phê duyệt
participant System as Hệ thống

Approver->>RequestUI: Truy cập danh sách yêu cầu cần duyệt
RequestUI->>RequestControl: Yêu cầu lấy danh sách chờ xử lý
RequestControl->>System: Truy vấn các yêu cầu đang ở trạng thái Pending
System-->>RequestControl: Trả về danh sách yêu cầu
RequestControl-->>RequestUI: Cung cấp danh sách hiển thị
RequestUI-->>Approver: Trình bày danh sách các yêu cầu

Approver->>RequestUI: Chọn xem chi tiết một yêu cầu
RequestUI-->>Approver: Hiển thị chi tiết thay đổi (So sánh cũ / mới)
Approver->>RequestUI: Đưa ra quyết định (Phê duyệt hoặc Từ chối)
RequestUI->>RequestControl: Gửi quyết định xử lý
RequestControl->>System: Xác thực quyền hạn người duyệt đối với yêu cầu này

alt Không đủ thẩm quyền
  System-->>RequestControl: Từ chối thao tác
  RequestControl-->>RequestUI: Báo lỗi giới hạn quyền
  RequestUI-->>Approver: Hiển thị thông báo từ chối
else Thẩm quyền hợp lệ
  RequestControl->>System: Cập nhật trạng thái của Yêu cầu (Đã duyệt / Từ chối)
  opt Quyết định là Phê duyệt
    alt Yêu cầu loại tạo mới
      System->>System: Kích hoạt tài khoản đích để bắt đầu sử dụng
    else Yêu cầu loại cập nhật
      System->>System: Ghi đè thông tin mới vào hồ sơ hệ thống
    end
  end
  System-->>RequestControl: Hoàn tất quá trình xử lý đồng bộ
  RequestControl-->>RequestUI: Xác nhận xử lý thành công
  RequestUI-->>Approver: Đóng biểu mẫu và cập nhật danh sách
end
```
