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
## Kết quả inspect (04/10)
- Persona: có 8/9 tài khoản trên cả 2 app (id: admin1 102661 · baonguyen03 102487 · pharevu 102269 · thanhnguyen10 102287 · thanhnguyen08 102575 · hungphan 102289 · hatran02 102282 · linhnguyensoe 102271). **Thiếu `hatran03` (Châu Minh Đạt).** Tenant có 11 user.
- Task: service model `work.request`; tạo bằng `/api/service/create`. Work request tạo bằng **multipart** (`files` + custom field trong `form`). Service group: `/api/service-group/{list,create,update,remove}`. Không có endpoint tạo workspace (workspace hiện có: "Project 2026", metatype operation).
- Request: service model `request.approval`; luồng duyệt nằm trong `execution_model.approval.blocks[]` (type fixed/conditional, approvers[{user_id}], conditions), counter `counter_model.template`, `required_approval_note`, `sla_model.hours`. Direct Request là service riêng (`request.direct_approval`, id aF4YSZkw-…).
- Request: **không lộ endpoint tạo service / gửi đề nghị / duyệt** trong bundle → dùng `02-recorder.js` ghi payload khi thao tác tay.
- Request: tiền tệ mặc định tenant = **USD** → field Currency phải chỉnh VND.
- Dataset: có 8 dataset (gồm `[D&B] Bảng đơn giá khoán`, `[D&B] Bảng giá mua theo nhà cung cấp`); chưa xác nhận có "Danh mục công trình".
## Lệch so với spec (và lý do)
- Dùng chung một script dò `scripts/00-probe.js` cho cả 2 app (tự nhận app theo domain) thay vì 2 file `00-probe-<app>.js`.
## Giới hạn sản phẩm phát hiện
## Usage ước tính
## Cần Thành quyết
- Chạy `scripts/02-recorder.js` + thao tác tay theo checklist, gửi `rec-task.json`, `rec-request.json`.
- User cho Châu Minh Đạt (hatran03 không có trên tenant).
- Gán user cho persona: Vũ Thanh Hương (TP Kinh doanh), Tạ Văn Hùng (Xưởng), Đinh Văn Phúc (Mua hàng), Lương Bảo Ngọc (CSKH).
- Dataset "Danh mục công trình" đã có trên tenant chưa?
