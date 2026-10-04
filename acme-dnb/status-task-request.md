# Status — Task & Request
- Cập nhật: 04/10/2026 · Trạng thái: Chưa bắt đầu (bước 0–1)
- Key insight (1 dòng): Làm được theo cách cũ (Claude viết script, Thành chạy trong Console Chrome); đang chờ kết quả dò API.
## Đã dựng (service — URL/ID)
- (chưa có)
- Tenant đã xác nhận: https://task.base.com.vn/home · https://requests.base.com.vn/
## Dữ liệu đã bơm
- (chưa có)
## Lệch so với spec (và lý do)
- Dùng chung một script dò `scripts/00-probe.js` cho cả 2 app (tự nhận app theo domain) thay vì 2 file `00-probe-<app>.js`.
## Giới hạn sản phẩm phát hiện
## Usage ước tính
## Cần Thành quyết
- Chạy `scripts/00-probe.js` trên Task và Request, gửi lại `probe-task.json`, `probe-request.json`.
- Gán user cho persona: Vũ Thanh Hương (TP Kinh doanh), Tạ Văn Hùng (Xưởng), Đinh Văn Phúc (Mua hàng), Lương Bảo Ngọc (CSKH).
- Dataset "Danh mục công trình" đã có trên tenant chưa?
