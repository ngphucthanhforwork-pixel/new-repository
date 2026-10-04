# Status — Task & Request
- Cập nhật: 04/10/2026 · Trạng thái: Chưa bắt đầu (bước 0–1)
- Key insight (1 dòng): Task có đủ endpoint ghi (service, field, end-reason, work-request, workload, schedule); Request chưa lộ endpoint tạo service/đề nghị/duyệt — đang dò tiếp.
## Đã dựng (service — URL/ID)
- (chưa có)
- Tenant đã xác nhận: https://task.base.com.vn/home · https://requests.base.com.vn/
## Dữ liệu đã bơm
- (chưa có)
## Kết quả dò API (04/10)
- Cả 2 app: `GET /auth/me` trả `csrfToken` (64 ký tự) → POST JSON + header `X-CSRF-Token`. Endpoint list/info dùng POST (GET trả 404).
- Task (212 endpoint, `probe/endpoints-task.json`): service/create·update·update-input-model · service-group · field/create · end-reason/create · work-request/create·update · task/complete·fail · workload/create · work-session/start·stop·edit · schedule/create·run · orgunit/create · dashboard/create · report/compute.
- Task: không thấy endpoint tạo **workspace** riêng — có thể là orgunit/team (câu hỏi mở 6).
- Request (130 endpoint, `probe/endpoints-request.json`): có service/update·update-input-model, field/create, task-flow/flow/* (nhiều khả năng là luồng duyệt), advance-table/* (trường bảng), dataset-ref/* (Link dataset record). **Không thấy** service/create, request/create, approve/reject → có thể ghép động; `01-inspect.js` quét tiếp.
- `/auth/me` Request có `directService` (Direct Request) và `orgUnits`.
## Lệch so với spec (và lý do)
- Dùng chung một script dò `scripts/00-probe.js` cho cả 2 app (tự nhận app theo domain) thay vì 2 file `00-probe-<app>.js`.
## Giới hạn sản phẩm phát hiện
## Usage ước tính
## Cần Thành quyết
- Chạy `scripts/01-inspect.js` trên Task và Request, gửi lại `inspect-task.json`, `inspect-request.json`.
- Gán user cho persona: Vũ Thanh Hương (TP Kinh doanh), Tạ Văn Hùng (Xưởng), Đinh Văn Phúc (Mua hàng), Lương Bảo Ngọc (CSKH).
- Dataset "Danh mục công trình" đã có trên tenant chưa?
