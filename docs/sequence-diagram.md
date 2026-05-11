# UML Sequence Diagrams - AI Chatbot Integration Platform

Scope: simplified sequence diagrams for the main user-management flows in the admin/business dashboard.

Actors used across these diagrams:

- `ADMIN_SYSTEM`: highest system role, can approve ADMIN requests.
- `ADMIN`: administration role, can view and create approval requests within allowed permissions.
- `BUSINESS`: business account role, can log in/out of the dashboard.
- `WEBSITE USER`: end user on a client website. This actor is not involved in the admin-account flows below.

## Diagram Files

- [Sơ đồ Đăng nhập](sequence-diagrams/01-login.md)
- [Sơ đồ Đăng xuất](sequence-diagrams/02-logout.md)
- [Sơ đồ Thêm mới tài khoản ADMIN](sequence-diagrams/03-create-admin-account.md)
- [Sơ đồ Tìm kiếm tài khoản ADMIN](sequence-diagrams/04-search-admin-account.md)
- [Sơ đồ Cập nhật tài khoản ADMIN](sequence-diagrams/05-update-admin-account.md)

## Notes

- These diagrams are simplified for report/documentation use, similar to the provided example image.
- Implementation details such as `bcrypt`, `JWT`, Axios interceptors, and database model names are grouped into `Control` and `Hệ thống`.
- The real code uses approval requests for creating and updating ADMIN accounts. Creating/updating an ADMIN account is not applied directly until the request is approved.
