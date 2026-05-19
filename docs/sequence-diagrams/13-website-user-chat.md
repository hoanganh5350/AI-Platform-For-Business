# Sơ đồ tuần tự - Tương tác Chatbot của WEBSITE USER

Actors tham gia: `WEBSITE USER` (Người dùng cuối trên website của doanh nghiệp).  
Actors không tham gia: `ADMIN_SYSTEM`, `ADMIN`, `BUSINESS`.

```mermaid
sequenceDiagram
autonumber

actor User as WEBSITE USER
participant ChatUI as Widget Chatbot (Giao diện)
participant ChatControl as Control xử lý AI (Hệ thống)
participant DB as Cơ sở dữ liệu (Kiến thức doanh nghiệp)

User->>ChatUI: Truy cập website và mở cửa sổ Chatbot
ChatUI->>ChatControl: Yêu cầu khởi tạo phiên chat (lấy cấu hình)
ChatControl->>DB: Truy vấn thiết lập Chatbot của doanh nghiệp (Lời chào, Giọng điệu)
DB-->>ChatControl: Trả về cấu hình Chatbot
ChatControl-->>ChatUI: Cung cấp cấu hình và lời chào
ChatUI-->>User: Hiển thị lời chào tự động của doanh nghiệp

opt Khách hàng tương tác
  User->>ChatUI: Nhập và gửi câu hỏi / yêu cầu tư vấn
  ChatUI->>ChatControl: Chuyển tiếp nội dung tin nhắn của khách hàng
  ChatControl->>DB: Truy xuất kho tri thức (Mô tả nghiệp vụ, Mục tiêu)
  DB-->>ChatControl: Cung cấp kiến thức nền của doanh nghiệp
  
  ChatControl->>ChatControl: AI phân tích ngữ nghĩa và tạo câu trả lời (Áp dụng đúng Giọng điệu/Ngôn ngữ)
  
  alt Trợ lý nhận diện được yêu cầu điều hướng chức năng
    ChatControl->>DB: Tra cứu cấu trúc điều hướng (UI Flow)
    DB-->>ChatControl: Thông tin đường dẫn (URL) tương ứng
    ChatControl->>ChatControl: Nhúng liên kết/nút bấm vào câu trả lời
  end
  
  ChatControl-->>ChatUI: Trả về câu trả lời hoàn chỉnh
  ChatUI-->>User: Hiển thị phản hồi từ Chatbot AI
end
```
