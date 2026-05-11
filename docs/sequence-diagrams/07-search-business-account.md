# Sơ đồ tuần tự - Tìm kiếm tài khoản BUSINESS

Actors tham gia: `ADMIN_SYSTEM`, `ADMIN`.  
Actors không tham gia: `BUSINESS`, `WEBSITE USER`.

```mermaid
sequenceDiagram
autonumber

actor Requester as ADMIN_SYSTEM / ADMIN
participant BusinessUI as Giao diện quản lý BUSINESS
participant BusinessControl as Control quản lý tài khoản
participant System as Hệ thống

Requester->>BusinessUI: Truy cập danh sách tài khoản BUSINESS
BusinessUI->>BusinessControl: Yêu cầu lấy danh sách doanh nghiệp
BusinessControl->>System: Truy vấn toàn bộ dữ liệu BUSINESS
System-->>BusinessControl: Trả về danh sách dữ liệu
BusinessControl-->>BusinessUI: Cung cấp danh sách hiển thị
BusinessUI-->>Requester: Hiển thị bảng danh sách tài khoản

Requester->>BusinessUI: Nhập thông tin tìm kiếm hoặc chọn bộ lọc trạng thái
BusinessUI->>BusinessUI: Phân tích và lọc dữ liệu trên danh sách hiện tại
BusinessUI-->>Requester: Cập nhật hiển thị danh sách phù hợp với điều kiện
```
