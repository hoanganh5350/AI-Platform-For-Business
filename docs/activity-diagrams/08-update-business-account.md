# Sơ đồ hoạt động - Cập nhật tài khoản BUSINESS

```mermaid
flowchart TD
  subgraph User [Người dùng]
    direction TB
    A(Chọn tài khoản BUSINESS cần cập nhật)
    C(Thay đổi trạng thái, email, số điện thoại)
    D(Xác nhận Cập nhật)
  end
  subgraph System [Hệ thống]
    direction TB
    B(Hiển thị biểu mẫu cập nhật)
    E{Kiểm tra thông tin}
    F(Hiển thị cảnh báo lỗi)
    G(Tạo Yêu cầu chờ phê duyệt)
    H(Thông báo yêu cầu đã được ghi nhận)
  end
  
  start(( )) --> A
  A --> B
  B --> C
  C --> D
  D --> E
  E -- Không hợp lệ --> F
  F --> C
  E -- Hợp lệ --> G
  G --> H
  H --> stop((( )))
```
