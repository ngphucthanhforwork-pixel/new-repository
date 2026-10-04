# Acme D&B — Dựng dữ liệu demo cho Base Task & Base Request (handoff cho Claude Code)

> Chủ sở hữu: Thành (BD, Base.vn HCM Revenue Center) · Phiên bản: 04/10/2026 · Nguồn gốc: chat scoping trong Project "Ngành Gỗ - Design & Build".
> File này **tự đủ ngữ cảnh**: Claude Code không đọc được Project trên claude.ai, nên mọi quy ước, dữ liệu vàng và spec đều nằm ở đây.

---

## 0. Đọc trước khi làm bất cứ việc gì

**Bạn là ai:** agent dựng cấu hình + bơm dữ liệu demo cho 2 app **Base Task** và **Base Request**, phục vụ demo bán bộ **Work OS** cho ngành Design & Build (D&B) nội thất.

**Đọc theo thứ tự:**
1. File này (toàn bộ).
2. `C:\Users\ngphu\Documents\[Foundation] Base 3.0 ready\Tasks\Knowledge_Tasks.md`
3. `C:\Users\ngphu\Documents\[Foundation] Base 3.0 ready\Requests\Knowledge_Requests.md`
4. (Tham khảo) `...\Requests\S1_De_nghi_mua_nguyen_vat_lieu.docx` — mẫu tờ đề nghị mua vật tư · `...\Requests\Skill_setup_Requests.skill` (file zip, giải nén vào thư mục tạm để đọc, **không sửa file gốc**) · `...\base-demo-data.skill` ở gốc kho (Task chưa có skill riêng).

**Quy tắc bắt buộc:**
- **Cách trả lời Thành:** ngắn gọn, 3 phần — (1) key insight 1–2 câu → (2) chi tiết cần thiết (bảng/bước/số) → (3) kết luận / việc Thành cần duyệt.
- **Pilot trước, scale sau:** mỗi app làm pilot 1 service + 3–5 bản ghi → báo cách làm, độ khó, usage → **chờ Thành duyệt** rồi mới bơm đủ. Không tự spawn quá 3 subagent.
- **Tên cấu hình:** mọi service / nhóm / workspace / catalog tạo mới bắt đầu bằng `[D&B] `. **Không** đặt chữ "Acme" trong tên service. "Acme" chỉ xuất hiện trong **dữ liệu** (tên công trình, mã `ACME-2026-xxx`, nội dung).
- **Không** áp tiền tố cho bản ghi dữ liệu, tên field, tên trạng thái.
- **Tenant dùng chung:** không xoá / không sửa service hay dữ liệu của người khác. Chỉ đụng vào thứ có tiền tố `[D&B]`.
- **Dữ liệu như công ty thật:** cấm chữ "demo", "test", "mẫu thử", "Nguyễn Văn A", "Khách hàng 1", "Công ty ABC". Tên người/công ty đều hư cấu, **không dùng thương hiệu thật** (không Vinhomes, Masteri…).
- **Không tự đoán** những điểm ở mục 9 (Câu hỏi mở) — quan sát, ghi lại, để Thành hỏi product.
- **Không ghi gì lên tài khoản/ứng dụng ngoài Task và Request** (Workflow, Projects đã có agent khác làm xong — chỉ đọc nếu cần đối chiếu).

---

## 1. Bối cảnh bán hàng — bộ Work OS 4 app

Thành chỉ bán cho D&B **bộ Work OS**: **Workflow · Project · Task · Request**. (BPM, CRM, Commerce, Lead, Prospector **không** nằm trong bộ bán — đừng thiết kế phụ thuộc vào chúng.)

Theo chính sách giá Base 2.0 (tài khoản/tháng, tối thiểu 30 tài khoản):
- **Starter 59.000đ:** Project + Request *hoặc* Workflow + Request.
- **Basic 99.000đ:** Task + Request + Workflow + Project. → **Task chỉ có từ Basic**, nên demo Task phải đủ mạnh để là lý do khách lên gói.
- E-Sign chỉ từ gói Advance → demo Request **không dựa vào ký điện tử**.

### 1.1 Mỗi app quản cái gì (phương pháp luận)

| | Project | Workflow | **Task** | **Request** |
|---|---|---|---|---|
| Đơn vị quản | Công trình (hợp đồng có đầu–cuối) | Một loại hồ sơ chạy qua nhiều người | Một **loại việc của phòng ban** | Một **quyết định** |
| Hình dạng | Roadmap, mốc, hạng mục | Giai đoạn tự đặt + SLA + rẽ nhánh | **5 trạng thái cố định**, 1 người chịu trách nhiệm (DRI), việc con | Khối duyệt (direct manager / cố định / linh hoạt / điều kiện) |
| Đầu ra | Lời/lỗ (P&L) | Hồ sơ đi hết đường | Kết quả bàn giao + **giờ công** | Duyệt / từ chối + tờ trình in |
| Đo | Chi phí, doanh thu | Thời gian từng giai đoạn | **Workload (công bỏ ra) vs Output (kết quả)** theo phòng ban | Tỷ lệ duyệt, thời gian ra quyết định |
| Thứ riêng | P&L công trình | Rẽ nhánh điều kiện | **Schedules** (tự sinh việc định kỳ) | Predicted flow, print template |

### 1.2 Quy tắc 4 câu hỏi (Thành đã duyệt 04/10/2026)

Hỏi theo thứ tự, gặp câu "có" đầu tiên thì dừng:
1. Việc thuộc **một công trình** và nằm trong tiến độ? → **Project**
2. Việc đi qua **≥ 2 người theo thứ tự cố định**, lặp lại? → **Workflow**
3. Chỉ cần **một người có quyền gật/lắc**? → **Request**
4. Còn lại — **một phòng ban nhận và làm xong** (kể cả việc định kỳ) → **Task**

### 1.3 Bản đồ Acme theo phòng ban (đã duyệt)

| Phòng ban | Project | Workflow (đã dựng) | **Task** | **Request** |
|---|---|---|---|---|
| Thiết kế | Hạng mục thiết kế | [D&B] Thiết kế chi tiết | Concept/3D cho khách **chưa ký HĐ**; việc nội bộ phòng | — |
| Kinh doanh | — | — | (người gửi yêu cầu) | Chiết khấu ngoài khung |
| Dự toán (QS) | — | Bước báo giá trong Phát sinh | Bóc dự toán sơ bộ trước HĐ | — |
| Mua hàng | — | — | Đặt hàng, theo dõi NCC giao | Đề nghị mua vật tư · Thanh toán NCC |
| Xưởng | Hạng mục sản xuất | — | Bảo trì máy định kỳ | Tăng ca, sửa/mua máy |
| Thi công | Hạng mục lắp đặt | Phát sinh, (Nghiệm thu, Bảo hành) | — | Tạm ứng khoán · Tạm ứng chi phí công trình · Đổi vật liệu |
| Kế toán | Chi phí / doanh thu | Bước ghi nhận DT | Đối soát công nợ hằng tháng | — |
| CSKH | — | (Bảo hành) | Gọi lại khách mỗi 6 tháng | — |

---

## 2. Công ty giả định & dữ liệu vàng (phải khớp các app khác)

**Công ty Nội thất Acme** (hư cấu), TP.HCM — D&B nội thất có xưởng gỗ 1.500 m² ở Củ Chi, showroom TP. Thủ Đức, ~60 nhân sự, 8–12 công trình song song, 300 triệu – 3 tỷ/công trình. Tiền tệ VND. Khung dữ liệu 01/06/2026 – 31/10/2026, **"hôm nay" = 04/10/2026**.

### 2.1 Persona → tài khoản tenant (theo cách luồng Workflow đã gán)

| Persona | Vai trò | Tài khoản dùng làm assignee/approver |
|---|---|---|
| Hoàng Đức Minh | Giám đốc | `admin1` (Thành sẽ đổi tên hiển thị) |
| Vũ Thanh Hương | Trưởng phòng Kinh doanh | *chưa gán — hỏi Thành* |
| Đặng Quốc Huy / Phan Ngọc Trâm | Tư vấn nhà ở / fit-out | *chưa gán — ghi tên persona vào field text* |
| Lý Gia Bảo | Trưởng phòng Thiết kế (KTS) | `baonguyen03` |
| Trịnh Mai Anh | Designer | `pharevu` |
| Ngô Tuấn Kiệt | Designer | `thanhnguyen10` |
| Bùi Thị Lan | QS | `thanhnguyen08` |
| Lâm Chí Thanh | Trưởng phòng Thi công (PM) | `hungphan` |
| Hồ Văn Tài | Giám sát (011, 013, 015, 017…) | `hatran02` |
| Châu Minh Đạt | Giám sát (012, 014, 016, 018…) | `hatran03` |
| Mai Thị Ngọc / Võ Thu Trang | Kế toán trưởng / Kế toán dự án | `linhnguyensoe` (dùng chung) |
| Tạ Văn Hùng · Đinh Văn Phúc · Lương Bảo Ngọc | Quản đốc xưởng · Mua hàng · CSKH | *chưa gán — hỏi Thành* |

Nếu tenant Task/Request không có các user trên → **dừng, báo Thành**, không tự tạo user.

### 2.2 Công trình (mã `ACME-2026-xxx` là khoá chung giữa các app)

| Mã | Tên | Giai đoạn 04/10 | Ghi chú cho Task/Request |
|---|---|---|---|
| 008 | Căn hộ 2PN Thảo Điền – anh Đỗ Hoàng Nam | Bảo hành | CSKH gọi lại |
| 011 | Văn phòng Sao Việt Logistics (fit-out, 1,6 tỷ) | Sản xuất | Mua vật tư, thanh toán NCC |
| 012 | Căn hộ 3PN Quận 7 – chị Lê Thu Hà | Chốt bản vẽ | Đổi vật liệu |
| 013 | Nhà phố Gò Vấp – anh Phạm Quốc Bảo | Thiết kế chi tiết | |
| 014 | Café Mộc Lan – Quận 1 (fit-out) | Nghiệm thu | Thanh toán thầu phụ |
| **015** | Căn hộ 3PN Quận 2 – chị Nguyễn Minh Thư (1,2 tỷ) | Bảo hành | **Căn LỜI** 20,2% — mọi đề nghị đúng quy định |
| **016** | Căn hộ 3PN Bình Thạnh – anh Võ Quang Huy (1,2 tỷ) | Nghiệm thu, trễ 5 tuần | **Căn LỖ** −4,8% — đề nghị đi tắt, vượt |
| 017–024 | 8 công trình mới ký (mùa cao điểm) | Thiết kế | Đều đi qua Task "Thiết kế trước HĐ" trước khi ký |

017 Căn hộ 2PN Thủ Thiêm · 018 Biệt thự Quận 7 · 019 Văn phòng Nam Kha Software · 020 Nhà phố Thủ Đức · 021 Showroom gốm Bích Ngọc · 022 Căn hộ 3PN Thủ Đức · 023 Café Lá Me – Bình Thạnh · 024 Căn hộ Duplex Quận 2.
(Đối chiếu tên với Workflow `[D&B] Thiết kế chi tiết` nếu cần — chỉ đọc.)

**Số liệu 016 phải khớp (kịch bản "hai căn song sinh"):**
- D2 — đo khi tường chưa trát, lệch 35 mm → làm lại 5 module tủ bếp + tủ lạnh âm: **vật tư 62.000.000**.
- D4 — khoán lắp đặt Tổ Sáu Phát: dự toán **66.000.000**, đã ứng **84.000.000** (đợt bổ sung 18tr không có biên bản khối lượng).
- 015 cùng tổ, ứng đúng 66.000.000 theo khối lượng nghiệm thu (≤ 50% KL đã nghiệm thu mỗi đợt).

**Tổ đội khoán:** TD-01 Tổ lắp đặt Sáu Phát · TD-02 Tổ sơn bả Tư Lành · TD-03 Đội điện nước Hưng Phát · TD-04 Đội đá – kính Thành Công.
**NCC:** Ván gỗ Phú Thịnh · Phụ kiện Minh Long · Sơn Đại Phát · Đá Hoàng Gia · Kính An Bình · Đèn Quang Minh · Vận tải Tân Cảng Xanh.
**Đơn giá giờ:** Designer 180.000đ · KTS trưởng 300.000đ · QS 160.000đ · PM/Giám sát 170.000đ.

---

## 3. Cách thao tác trên app

Tenant: tài khoản Thành ("BaseV3 Test"). **Xác nhận URL với Thành ở bước đầu** — tài liệu khảo sát dùng `task.base.com.vn` và `requests.base.com.vn`.

**Cách đã chạy được ở các luồng trước (Workflow, Projects):** gọi API nội bộ của app bằng `fetch` trong **Console Chrome** của Thành, lấy CSRF từ `GET /auth/me`, rồi `POST` JSON kèm header `X-CSRF-Token`. Phiên Claude không tự bắt token được → **bạn viết script, Thành dán vào Console và chạy, rồi dán kết quả lại cho bạn.**

Quy trình đề xuất:
1. **Dò API (bước 0):** viết `scripts/00-probe-<app>.js` — lấy `/auth/me`, tải các file JS bundle của trang (`document.scripts`), regex tìm mọi chuỗi `/api/[a-z0-9_/-]+`, in danh sách endpoint + một vài endpoint GET liệt kê service/user. Mục tiêu: tìm endpoint tạo service, custom field, end reason, counter, schedule, work request, workload (Task) và service, approval flow, request, approve/reject (Request).
2. **Giả thuyết để thử** (cùng nền tảng Base 3.0 với Workflow — tên có thể khác, phải kiểm):
   - Workflow dùng: `/api/workflow/create {name, content}` · `/api/service/update-input-model {id, input_model:{fields:[], internal_fields:[…]}}` · `/api/end-reason/create {service_id, name, metatype:'done'|'failed'}` · `/api/service-label/create {…, metatype:'tag'}` · `/api/job/create {service_id, name, content, form:{code:value}}` (date = epoch giây).
   - Không backdate được `created_at` → ngày nghiệp vụ nằm trong **field ngày**; "quá hạn" phải đặt deadline sát hiện tại.
3. Mỗi script **idempotent**: tìm theo tên trước khi tạo, in ID ra console, có biến `DRY_RUN = true` mặc định.
4. Nếu API bế tắc → dựng cấu hình **qua giao diện** theo hướng dẫn từng bước bạn viết cho Thành, chỉ dùng script cho phần bơm dữ liệu.
5. Nếu phiên Claude Code của bạn có công cụ điều khiển Chrome thì có thể chạy trực tiếp — nhưng vẫn hỏi Thành trước khi ghi dữ liệu.

Lưu mọi script trong `scripts/`, đặt tên `NN-<app>-<việc>.js`. Ghi kết quả (ID service, field code, ID bản ghi) vào `ids.json`.

**Lỗi đã biết trên bản DEMO 22/08 (có thể đã sửa — pilot phải kiểm):**
- Task: gán người nhận, lưu custom field, thêm widget, tạo service group **không lưu được**; Reports báo "Failed to load report data"; danh sách work request hiển thị rỗng dù có dữ liệu.
- Task: chấm giờ cần cấu hình **workload category** cho service, nếu không session dừng mà không ghi workload.
- Request: bảng lưới báo `500 column "linked_ref" does not exist` khi có cột liên kết → **bảng vật tư dùng cột text/số thường, không cột liên kết**.

---

## 4. BASE TASK — spec

**Câu chuyện demo:** trưởng phòng mở Workspace của phòng mình → thấy phòng đang dồn giờ vào đâu. Điểm đắt nhất: *"2 tháng qua phòng Thiết kế bỏ **126 giờ ≈ 22,7 triệu** làm concept cho 8 khách không ký — 45% giờ presales."*

Workspace: **`[D&B] Phòng Thiết kế`** (pilot). Sau pilot: `[D&B] Phòng Dự toán`, `[D&B] Xưởng`, `[D&B] Kế toán`, `[D&B] CSKH`, `[D&B] Mua hàng`. Service group: **`[D&B] Việc phòng ban`**.

### T1 — `[D&B] Thiết kế trước hợp đồng` ⭐ PILOT

| Mục cấu hình | Giá trị |
|---|---|
| General | Mô tả: "Kinh doanh gửi yêu cầu layout / concept / phối cảnh 3D cho khách chưa ký hợp đồng." Type key `presales-design` |
| Permissions | Owner: Lý Gia Bảo (KTS trưởng). Follower: Trưởng phòng Kinh doanh |
| Views | Board (mặc định) → Table → Calendar → List |
| Custom fields (Internal) | Khách / cơ hội (Text) · Tư vấn phụ trách (Text — Huy/Trâm) · Loại công trình (Dropdown: Nhà ở / Fit-out) · Diện tích m² (Decimal) · Ngân sách dự kiến (Currency) · Hạng mục yêu cầu (Multi-Select: Layout 2D / Concept moodboard / Phối cảnh 3D) · Số vòng sửa (Integer) · Giờ dự toán (Decimal) · Ngày nhận yêu cầu (Date) · **Kết quả cơ hội** (Dropdown: Đang theo đuổi / Đã ký HĐ / Mất khách) · Lý do mất khách (Dropdown: Giá cao hơn dự kiến / Chọn đơn vị khác / Không liên lạc được sau khi gửi concept / Khách hoãn dự án) · Mã công trình khi ký (Dropdown ACME-2026-017…024) |
| Deliverable | Free-form (file concept/phối cảnh + ghi chú) |
| End reasons | Completion: *Bàn giao – khách đã ký HĐ* · *Bàn giao – khách không ký* · *Bàn giao – chờ khách quyết*. Failure: *Khách huỷ trước khi xong* · *Thiếu mặt bằng / thông tin* |
| SLA & Counter | Resolution target 72h · prefix `TKS-` |
| Reminders | Mặc định (Critical 3 ngày … Low đúng hạn) |
| Workload category | "Thiết kế trước HĐ" (bắt buộc, để giờ công ghi được) |

**Dữ liệu — 20 work request** (giờ = workload đã ghi; designer trừ khi ghi KTS):

*8 khách đã ký (Completed, "Bàn giao – khách đã ký HĐ", Kết quả = Đã ký HĐ, Mã công trình khi ký điền đúng):*

| Khách / cơ hội | Hạng mục | Người làm | Giờ | Mã khi ký |
|---|---|---|---|---|
| Căn hộ 2PN Thủ Thiêm | Layout + 3D | Mai Anh | 14 | 017 |
| Biệt thự Quận 7 | Concept + Layout + 3D | KTS Lý Gia Bảo | 30 | 018 |
| Văn phòng Nam Kha Software | Layout + 3D | Kiệt | 22 | 019 |
| Nhà phố Thủ Đức | Layout + 3D | Mai Anh | 18 | 020 |
| Showroom gốm Bích Ngọc | Concept + 3D | Kiệt | 16 | 021 |
| Căn hộ 3PN Thủ Đức | Layout + 3D | Mai Anh | 15 | 022 |
| Café Lá Me – Bình Thạnh | Concept + Layout | Kiệt | 12 | 023 |
| Căn hộ Duplex Quận 2 | Concept + 3D | KTS Lý Gia Bảo | 26 | 024 |
| | | | **153** | |

*8 khách không ký (Completed, "Bàn giao – khách không ký", Kết quả = Mất khách):*

| Khách / cơ hội | Hạng mục | Người làm | Giờ | Lý do mất |
|---|---|---|---|---|
| Căn hộ 2PN Quận 4 – anh Lâm Quốc Thịnh | Layout + 3D (3 vòng) | Mai Anh | 26 | Chọn đơn vị khác |
| Nhà phố Tân Bình – chị Huỳnh Mỹ Linh | Layout + 3D (4 vòng) | Kiệt | 34 | Giá cao hơn dự kiến |
| Căn hộ 3PN Quận 7 – anh Kiều Minh Tâm | Concept | Mai Anh | 6 | Không liên lạc được sau khi gửi concept |
| Văn phòng Cát Tường Media | Layout + 3D | Kiệt | 32 | Giá cao hơn dự kiến |
| Căn hộ 1PN Bình Thạnh – chị Đoàn Thu Uyên | Concept | Mai Anh | 5 | Khách hoãn dự án |
| Tiệm bánh Hạt Dẻ – Quận 3 | Layout | Kiệt | 8 | Chọn đơn vị khác |
| Căn hộ 2PN Thủ Đức – anh Mạc Văn Lộc | Layout | Mai Anh | 9 | Không liên lạc được sau khi gửi concept |
| Nhà phố Gò Vấp – chị Tô Bích Ngân | Concept | Kiệt | 6 | Không liên lạc được sau khi gửi concept |
| | | | **126 ≈ 22.680.000đ** | |

*4 đang chạy:* Căn hộ 3PN Quận 2 – chị Lưu Hải Yến (In Progress, 3D, 10h, High) · Văn phòng Hoà Bình Legal (In Progress, layout, 6h) · Nhà phố Bình Tân – anh Quách Gia Phong (**On Hold** – chờ khách gửi mặt bằng) · Căn hộ 2PN Quận 8 – chị Đào Minh Châu (Open, **quá hạn**, Critical).

Ngày nhận yêu cầu rải 01/08 – 03/10/2026; khách đã ký có ngày nhận trước ngày ký HĐ của công trình tương ứng.

### T2 — `[D&B] Việc nội bộ phòng Thiết kế` (sau pilot)
- Schedules: *Cập nhật thư viện vật liệu & bảng giá NCC* (Monthly, ngày 1) · *Review bản vẽ đầu tuần* (Weekly, Thứ Hai) · *Lưu trữ hồ sơ bản vẽ công trình đã bàn giao* (Monthly, ngày 25).
- 8 work request ad-hoc: render ảnh công trình 015 cho fanpage, làm hồ sơ năng lực fit-out, chuẩn hoá thư viện block CAD, v.v. Deliverable: Free-form.

### T3–T6 — các phòng khác (chỉ làm khi Thành duyệt sau pilot; 3–5 bản ghi mỗi service)
| Service | Workspace | Điểm nhấn |
|---|---|---|
| `[D&B] Bóc dự toán sơ bộ` | Phòng Dự toán | Kinh doanh → QS, SLA 48h, Output: giá trị dự toán |
| `[D&B] Bảo trì máy xưởng` | Xưởng | Schedules Weekly (máy cắt CNC, máy dán cạnh), Deliverable Internal Form (checklist) |
| `[D&B] Đối soát công nợ` | Kế toán | Schedules Monthly ngày 5 |
| `[D&B] Chăm sóc khách sau bàn giao` | CSKH | Schedules: gọi lại khách 008, 015 mỗi 6 tháng |

---

## 5. BASE REQUEST — spec

**Câu chuyện demo:** cùng tổ khoán, cùng giá trị — căn 015 ứng tiền đúng luật, căn 016 ứng vượt 18 triệu vì đi tắt bằng **Direct Request** không có biên bản khối lượng. Có service chuẩn thì Predicted flow tự đẩy lên Giám đốc.

Group: **`[D&B] Đề xuất – phê duyệt`**. Field dùng chung (Service field): **Mã công trình** — dùng **Link dataset record** tới bảng "Danh mục công trình" nếu Dataset đã có trên tenant (hỏi Thành), nếu không → Dropdown 008–024 + "Xưởng / dùng chung".

### R1 — `[D&B] Đề nghị mua vật tư` ⭐ PILOT (kiểm luôn trường bảng)
- Counter `MVT-{year}-{counter}`, 4 chữ số.
- Fields: Mã công trình · Lý do mua (Dropdown: Theo BOM / Làm lại do lỗi / Bổ sung phát sinh / Dự trữ xưởng) · **Bảng vật tư** (Table: Tên vật tư, Quy cách, ĐVT, Số lượng, Đơn giá, Thành tiền — max 20 dòng, không cột liên kết) · Tổng giá trị (Currency) · NCC đề xuất (Dropdown NCC) · Ngày cần hàng (Date).
- Luồng: Block 1 **Fixed** — Trưởng phòng Thi công (theo Position nếu được) → Block 2 **Conditional** — Tổng giá trị > 30.000.000 → Giám đốc. Required notes: Reject.
- Print template: dựa trên `S1_De_nghi_mua_nguyen_vat_lieu.docx` (nếu tải lên được).
- **Dữ liệu 10 request:** 016 *"Vật tư làm lại 5 module tủ bếp + tủ lạnh âm"* **62.000.000**, lý do *Làm lại do lỗi*, Approved bởi GĐ 24/08 với note *"Duyệt để kịp tiến độ. Lỗi do đo khi tường chưa trát — yêu cầu Thi công rút kinh nghiệm."* · 015 ba đề nghị *Bổ sung phát sinh* (tủ rượu âm tường, mặt đá thạch anh, cánh Acrylic) · 011 hai đề nghị ván MDF chống ẩm (1 > 30tr qua GĐ) · 013 một Theo BOM · Xưởng một Dự trữ (Pending GĐ) · 012 một **Rejected** (note: "Đã có trong định mức đợt 1").

### R2 — `[D&B] Tạm ứng khoán` (kịch bản kiểm soát đội khoán)
- Counter `TUK-{year}-{counter}`.
- Fields: Mã công trình · Tổ đội (Dropdown TD-01…04) · Giá trị khoán theo dự toán (Currency) · Đã ứng lũy kế trước đợt này (Currency) · Giá trị KL đã nghiệm thu (Currency) · Số tiền đề nghị (Currency) · **Tỷ lệ ứng / KL nghiệm thu** (Formula = (Đã ứng + Đề nghị) / KL nghiệm thu) · Biên bản khối lượng (File).
- Luồng: PM duyệt → **Conditional**: Tỷ lệ > 50% *hoặc* (Đã ứng + Đề nghị) > Giá trị khoán → Giám đốc + Kế toán trưởng. *Nếu Conditional không đọc được field Formula → thêm Dropdown "Vượt ngưỡng?" và ghi vào status.*
- **Dữ liệu:** 015 · TD-01: 3 đợt 20tr / 26tr / 20tr = 66tr, đều kèm biên bản, Approved bởi PM. 016 · TD-01: đợt 1 30tr, đợt 2 36tr (Approved) + **đợt bổ sung 18tr gửi bằng Direct Request**, PM duyệt, không file biên bản, nội dung "Tổ xin thêm do làm lại tủ bếp". 011 · TD-02 1 đợt Pending GĐ (vượt 50%). 014 · TD-04 1 đợt Approved.

### R3 — `[D&B] Tạm ứng / hoàn ứng chi phí công trình`
- Counter `TU-{year}-{counter}`. Fields: Mã công trình · Loại (Tạm ứng / Hoàn ứng) · Hạng mục chi (Dropdown: Vật tư lặt vặt / Vận chuyển / Thuê nhân công ngày / Khác) · Số tiền · Chứng từ (Files).
- Luồng: PM → Conditional > 5.000.000 → Kế toán trưởng.
- Dữ liệu 12 request rải 011–016, trong đó 016 có 4 khoản (xe chở module làm lại 3.500.000, keo/vít, thuê thợ ngày).

### R4 — `[D&B] Đổi vật liệu thay thế`
- Counter `DVL-{year}-{counter}`. Fields: Mã công trình · Vật liệu theo hợp đồng · Vật liệu đề xuất · Lý do (Hết hàng / Khách yêu cầu / Kỹ thuật) · Chênh lệch chi phí (Currency, âm = tiết kiệm) · Khách đã đồng ý? (Checkbox) · Ảnh mẫu (Files).
- Luồng: **Sequential** KTS trưởng (thẩm mỹ) → QS (chi phí) → Conditional Chênh lệch > 0 → Giám đốc.
- Dữ liệu 5 request: 012 (laminate vân gỗ hết hàng → mã tương đương), 016, 019, 1 Rejected vì khách chưa đồng ý.

### R5 — `[D&B] Chiết khấu ngoài khung`
- Counter `CK-{year}-{counter}`. Fields: Khách / cơ hội · Giá trị báo giá · % chiết khấu · Lý do (Khách VIP / Đối thủ báo thấp hơn / Khách giới thiệu / Mùa thấp điểm).
- Luồng: Trưởng phòng Kinh doanh → Conditional % > 5 → Giám đốc. Dữ liệu 6 request (017, 019, 024 đã duyệt; 2 khách mất khách bị từ chối; 1 Pending).

### R6 — `[D&B] Thanh toán NCC / thầu phụ`
- Counter `TTN-{year}-{counter}`. Fields: Mã công trình · NCC/thầu phụ · Số hoá đơn · Số tiền · Hạn thanh toán · Hồ sơ (Files).
- Luồng: Kế toán trưởng → Conditional > 50.000.000 → Giám đốc. Dữ liệu 6 request (011, 014, 015, 016).

---

## 6. Thứ tự làm & cổng duyệt

| Bước | Việc | Cổng |
|---|---|---|
| 0 | Hỏi Thành: URL tenant Task/Request · user cho persona còn thiếu · Dataset "Danh mục công trình" có chưa | — |
| 1 | Probe API Task + Request | Báo endpoint tìm được |
| 2 | **Pilot Task:** Workspace Thiết kế + T1 (cấu hình đủ) + 3 request (1 đã ký, 1 mất khách, 1 đang chạy) có workload | **Thành duyệt** |
| 3 | **Pilot Request:** group + R1 + 3 request (gồm request 62tr của 016) | **Thành duyệt** |
| 4 | Bơm đủ T1 (20) + T2 | |
| 5 | Bơm đủ R1 → R2 → R3 → R4 → R5 → R6 | Báo sau R2 |
| 6 | Dashboard: Task — Workload theo service/assignee; Request — Executive report + chart theo service | |
| 7 | T3–T6 (nếu Thành duyệt) | **Thành duyệt** |

Mỗi pilot báo: đã làm qua API hay UI · số lệnh console Thành phải chạy · phần nào làm tay · lỗi sản phẩm gặp phải · ước tính công cho bước bơm đủ.

---

## 7. Checklist nghiệm thu

- [ ] Mọi workspace/group/service có tiền tố `[D&B]`, không chứa "Acme"
- [ ] Task T1: Board có đủ 4 cột trạng thái có dữ liệu; Table view lọc "Mất khách" ra 8 dòng, tổng 126 giờ
- [ ] Task: Company → Workloads thấy giờ của Mai Anh, Kiệt, Lý Gia Bảo
- [ ] Task: ít nhất 1 Schedule ACTIVE, bấm "Generate Next" sinh được việc
- [ ] Request R1: tạo request > 30tr thì Predicted flow hiện khối Giám đốc
- [ ] Request R2: 016 nhìn thấy 3 đợt ứng = 84tr, trong đó 1 là Direct Request không có biên bản; 015 = 66tr
- [ ] Home Request có dữ liệu ở các tab Pending / Approved / Rejected / Overdue
- [ ] Ghi đủ ID, URL, field code vào `ids.json` và `status-task-request.md`

---

## 8. File trạng thái — `status-task-request.md` (ghi trong thư mục này)

```
# Status — Task & Request
- Cập nhật: <ngày giờ> · Trạng thái: Chưa bắt đầu / Pilot xong / Đang bơm / Xong / Bị chặn
- Key insight (1 dòng): <điều quan trọng nhất>
## Đã dựng (service — URL/ID)
## Dữ liệu đã bơm (đối tượng: số lượng, khớp mục 2: có/không)
## Lệch so với spec (và lý do)
## Giới hạn sản phẩm phát hiện (để hỏi product)
## Usage ước tính
## Cần Thành quyết
```

Thành sẽ tự chép file trạng thái lên Project `demo-acme/status/task.md` và `demo-acme/status/request.md`.

---

## 9. Câu hỏi mở — quan sát và ghi lại, không tự đoán

1. Dashboard Task có **group by custom field** (Kết quả cơ hội) được không? Nếu không, cách gần nhất để ra con số "giờ cho khách mất" là gì (Table filter, end reason, Output)?
2. Workload trên Task có quy ra **tiền** (đơn giá giờ) như Projects không, hay chỉ có giờ?
3. Request Conditional có đọc được **Formula field** không?
4. Request **Direct Request** có hiện trong báo cáo/lọc cùng các service chuẩn không (để chỉ ra "đi tắt")?
5. Việc từ Task có hiện trong **My works** của Projects/Workflow không (hộp việc chung)?
6. Có tạo được **Workspace** và gán theo phòng ban qua API không?
