# Sơ đồ hoạt động - Tìm kiếm tài khoản ADMIN

```mermaid
flowchart TD
  subgraph User [Người dùng]
    direction TB
    A(Truy cập danh sách ADMIN)
    C(Nhập từ khóa hoặc chọn bộ lọc)
  end
  subgraph System [Hệ thống]
    direction TB
    B(Truy xuất và hiển thị toàn bộ danh sách)
    D(Lọc dữ liệu theo điều kiện)
    E(Cập nhật kết quả hiển thị)
  end
  
  start(( )) --> A
  A --> B
  B --> C
  C --> D
  D --> E
  E --> stop((( )))
```
