# Acme D&B Demo — Master brief (đọc file này trước mọi file khác)

> Project: Ngành Gỗ – Design & Build · Chủ sở hữu: Thành (BD, Base.vn HCM Revenue Center)
> Phiên bản: 04/10/2026 (cập nhật lần 5 — bộ bán thực tế là **Work OS 4 app**, xem mục 2.1) · Trạng thái: sơ bộ, chưa chốt các câu hỏi mở ở mục 8.

> ⚠️ **THÔNG BÁO CHO MỌI AGENT**
> - **(04/10/2026 — mới nhất)** **Bộ Thành bán cho D&B chỉ gồm Work OS: Workflow · Project · Task · Request.** BPM, CRM, Commerce, Lead,
>   Prospector **không nằm trong bộ bán** — brief 03, 05–08 giữ lại làm tham khảo / gói mở rộng, **không ưu tiên, không thiết kế phụ thuộc vào chúng**.
>   Phân việc giữa 4 app theo **quy tắc 4 câu hỏi** (mục 2.1, Thành đã duyệt). Task & Request: spec + dữ liệu ở `demo-acme/10-task-request-claude-code.md`
>   (bản dùng cho Claude Code, nằm ở máy Thành: `Ngành Gỗ - Nội thất\Claude Code - Task Request\CLAUDE.md`).
> - **(04/10/2026)** **Cách trả lời Thành — bắt buộc:** ngắn gọn, trọng tâm. Mọi câu trả lời theo 3 phần:
>   **(1) Key insight / big idea** ở câu mở đầu → **(2) Chi tiết** (chỉ phần cần thiết) → **(3) Chốt: kết luận / quyết định / đề xuất**. Chi tiết mục 0.9.
> - **(03/10/2026)** Mọi service / nhóm service / thư mục cấu hình **tạo mới** trên bất kỳ app nào phải đặt tên có tiền tố **`[D&B]`**
>   ở đầu, và **không đặt chữ "Acme" trong tên service**. Acme chỉ là một đơn vị D&B mẫu, đại diện cho cả mô hình Design & Build. Chi tiết mục 5.1.
> - **(04/10/2026)** **ACME-2026-009 (Biệt thự Thảo Điền) đã bị rút khỏi bộ dữ liệu** (đã lưu trữ trên Projects). Thay bằng **cặp công trình
>   song sinh**: **ACME-2026-015** (lời) và **ACME-2026-016** (lỗ) — kịch bản đầy đủ ở `demo-acme/09-kich-ban-cong-trinh-doi-chung.md`.
>   **Ở mọi brief 01–08, chỗ nào ghi ACME-2026-009 thì hiểu là ACME-2026-016**; số công trình trong bộ dữ liệu là **7** (không phải 6),
>   cộng 8 công trình mới ký **017–024** do luồng Workflow tạo (mục 7.1).
>   Agent nào đã tạo dữ liệu gắn 009 thì đổi sang 016 và ghi vào file trạng thái.

## 0. Cách dùng bộ tài liệu này (dành cho agent)

Bộ demo được chia thành **các luồng setup, mỗi luồng là một app**, mỗi luồng do một agent ở một chat riêng
(hoặc Claude Code trên máy Thành) đảm nhận. Mỗi agent:

1. Đọc **file này** (bối cảnh, quy ước, dữ liệu vàng dùng chung).
2. Đọc **file brief của app mình** (`demo-acme/0X-<app>.md` hoặc `10-task-request-claude-code.md`).
3. Đọc file Knowledge + Skill setup của app trong kho `[Foundation] Base 3.0 ready` (đường dẫn ghi trong brief).
4. Chỉ setup **app của mình**. Không sửa cấu hình app khác. Cần gì từ app khác → ghi vào mục "Chặn / cần từ app khác"
   trong file trạng thái.
5. Khi xong (hoặc dừng giữa chừng), ghi file trạng thái `demo-acme/status/<app>.md` theo mẫu ở mục 9.
6. **Không tự đoán** những điểm nằm trong "Câu hỏi mở" — ghi lại và để Thành hỏi product.
7. Tuân thủ thói quen tiết kiệm usage: làm thử một lượng nhỏ (pilot) trước, báo cáo chi phí/độ khó, rồi mới
   bơm đủ dữ liệu. Không tự spawn quá 3 subagent.
8. Nếu bị chặn khi tự gọi API nội bộ của app (bắt CSRF token), làm như luồng Projects/Workflow: **viết script để Thành tự chạy trong Console
   Chrome** (xem `status/projects.md` mục "Cách bơm dữ liệu" và `status/workflow.md` mục "Công thức API đã kiểm chứng").
9. **Cách trình bày mọi câu trả lời cho Thành (từ 04/10/2026):** ngắn gọn, trọng tâm, không dài dòng.
   - **Mở đầu:** 1–2 câu key insight / big idea — điều quan trọng nhất Thành cần biết.
   - **Giữa:** chi tiết hỗ trợ (bảng, bước, số liệu) — chỉ những gì cần cho quyết định.
   - **Kết:** key conclusion / decision / suggestion — Thành cần duyệt gì, làm gì tiếp theo.
   Áp dụng cả cho file trạng thái: mở đầu bằng 1 dòng tóm tắt tình hình, kết bằng việc cần Thành quyết.

**Prompt mở một chat agent mới (copy, thay `<APP>` và `<0X-file>`):**

> Bạn phụ trách luồng setup demo **<APP>** cho dự án Acme D&B. Đọc lần lượt trong Project: `demo-acme/00-master.md`,
> `demo-acme/<0X-file>.md`, và các file `demo-acme/status/*.md` liên quan. Sau đó đọc Knowledge + Skill setup của app trong
> kho `[Foundation] Base 3.0 ready`. Chạy pilot nhỏ trước, báo usage và đề xuất, chờ tôi duyệt rồi mới làm toàn bộ.
> Mọi service tạo mới phải có tiền tố `[D&B]` (master mục 5.1). ACME-2026-009 đã được thay bằng 015/016 (master mục 7.1).
> Bộ bán là Work OS 4 app (master mục 2.1). Trả lời ngắn gọn theo cấu trúc: key insight → chi tiết → kết luận/đề xuất (master mục 0.9).
> Khi xong, ghi `demo-acme/status/<app>.md` theo mẫu mục 9 của master.

## 1. Đề bài giả định

**Công ty Nội thất Acme** (tên hư cấu), TP.HCM — doanh nghiệp **Design & Build nội thất có xưởng gỗ riêng**.
Acme là **đơn vị mẫu đại diện cho mô hình D&B**: dữ liệu (công trình, khách, hồ sơ) mang tên Acme, còn cấu hình
(service, quy trình, danh mục) đặt tên theo mô hình `[D&B]` để tái sử dụng cho khách D&B khác.

| Thuộc tính | Giá trị |
|---|---|
| Quy mô | ~60 nhân sự |
| Xưởng | Xưởng gỗ 1.500 m² tại Củ Chi; 1 showroom tại TP.Thủ Đức |
| Dòng dịch vụ | (1) Nội thất nhà ở — căn hộ, nhà phố, biệt thự · (2) Fit-out thương mại — văn phòng, F&B, showroom |
| Khối lượng | 8–12 công trình chạy song song; giá trị 300 triệu – 3 tỷ/công trình |
| Phòng ban | Ban giám đốc · Kinh doanh & Marketing · Thiết kế · Dự toán (QS) · Mua hàng · Xưởng · Thi công & Giám sát · Kế toán · CSKH/Bảo hành |
| Nguồn khách | Facebook, Zalo OA, website, giới thiệu từ KTS/môi giới, cư dân dự án căn hộ sắp bàn giao |
| Thanh toán (nhà ở) | 3 đợt: 50% ký HĐ · 40% giao hàng tại công trình · 10% nghiệm thu |
| Thanh toán (fit-out B2B) | 30% tạm ứng · 65% theo khối lượng nghiệm thu · 5% giữ lại bảo hành 12 tháng |
| Nhân công | Thiết kế/PM/QS: lương tháng · Thợ xưởng: công nhật + khoán sản phẩm · Lắp đặt, sơn bả, điện nước, đá-kính: **tổ đội khoán** |

**Nỗi đau trung tâm (câu hook của toàn bộ demo):**
*"Anh/chị có biết công trình nào đang lời, công trình nào đang lỗ ngay lúc này không?"*
Tiền rò ở: phát sinh không thu được · dự toán sai · nghiệm thu chậm → đợt cuối chậm · tạm ứng khoán vượt khối lượng ·
không biết lời thật (chưa trừ công thiết kế, công xưởng) · **công thiết kế cho khách không ký hợp đồng** (đo bằng Task).

## 2. Kiến trúc hệ thống demo

### 2.1 Bộ bán thực tế — Work OS (từ 04/10/2026, Thành đã duyệt)

```
               Project  — công trình: tiến độ, giờ công, chi phí, doanh thu, P&L
               Workflow — hồ sơ chạy nhiều người theo giai đoạn: Thiết kế chi tiết, Phát sinh, (Nghiệm thu, Bảo hành)
               Task     — việc của phòng ban, việc định kỳ; đo Workload vs Output
               Request  — đề xuất cần một quyết định: mua vật tư, tạm ứng khoán, chiết khấu, đổi vật liệu…
```

Gói giá Base 2.0 (tài khoản/tháng, tối thiểu 30): **Starter 59k** = Project + Request *hoặc* Workflow + Request ·
**Basic 99k** = cả 4 app · E-Sign chỉ từ Advance. → Task là lý do lên Basic; demo không dựa vào ký điện tử.
Vì Starter chỉ chọn Project *hoặc* Workflow, **giữ cả hai bản Thiết kế** (hạng mục trong Project và `[D&B] Thiết kế chi tiết` trong Workflow) để demo theo gói khách chọn.

**Quy tắc 4 câu hỏi** — hỏi theo thứ tự, gặp câu "có" đầu tiên thì dừng:
1. Việc thuộc **một công trình** và nằm trong tiến độ? → **Project**
2. Việc đi qua **≥ 2 người theo thứ tự cố định**, lặp lại? → **Workflow**
3. Chỉ cần **một người có quyền gật/lắc**? → **Request**
4. Còn lại — **một phòng ban nhận và làm xong** (kể cả việc định kỳ) → **Task**

| Phòng ban | Project | Workflow | Task | Request |
|---|---|---|---|---|
| Thiết kế | Hạng mục thiết kế | [D&B] Thiết kế chi tiết | Concept/3D cho khách chưa ký HĐ; việc nội bộ | — |
| Kinh doanh | — | — | (người gửi yêu cầu) | Chiết khấu ngoài khung |
| Dự toán (QS) | — | Bước báo giá trong Phát sinh | Bóc dự toán sơ bộ | — |
| Mua hàng | — | — | Đặt hàng, theo dõi NCC | Đề nghị mua vật tư · Thanh toán NCC |
| Xưởng | Hạng mục sản xuất | — | Bảo trì máy định kỳ | Tăng ca, sửa/mua máy |
| Thi công | Hạng mục lắp đặt | Phát sinh, (Nghiệm thu, Bảo hành) | — | Tạm ứng khoán · Tạm ứng chi phí công trình · Đổi vật liệu |
| Kế toán | Chi phí / doanh thu | Bước ghi nhận DT | Đối soát công nợ | — |
| CSKH | — | (Bảo hành) | Gọi lại khách 6 tháng | — |

### 2.2 Kiến trúc mở rộng (tham khảo — không nằm trong bộ bán)

```
TRƯỚC HỢP ĐỒNG                                         SAU HỢP ĐỒNG
Prospector → Lead → CRM (Sales) → Commerce   ═══►    Projects  ⇄  BPM
 (tin nhắn)  (lọc,   (deal,        (báo giá,          (công trình,  (phát sinh, mua, sản xuất,
             chấm    khảo sát,     đơn/HĐ,             tiến độ,      khoán, nghiệm thu,
             điểm)   concept)      lịch thu)           lời lỗ)       thanh toán, bảo hành)
                      Nền dùng chung: Dataset · eSign
```

**Nguyên tắc chia vai sau hợp đồng:** Projects giữ *công trình* (tiến độ, người, chi phí, doanh thu, P&L).
Các phiếu chạy qua nhiều người (BPM ở bản mở rộng → **Workflow** ở bộ Work OS) mang **mã công trình**.

## 3. Thứ tự triển khai (wave) và phụ thuộc

**Bộ Work OS (ưu tiên):**

| Luồng | File brief | Trạng thái 04/10 |
|---|---|---|
| Projects | `04-projects.md` | Xem `status/projects.md` |
| Workflow | (chưa có brief riêng) | **Xong vòng 3** — `[D&B] Thiết kế chi tiết`, `[D&B] Xử lý yêu cầu phát sinh`; xem `status/workflow.md` |
| **Task** | `10-task-request-claude-code.md` §4 | Chưa bắt đầu — pilot `[D&B] Thiết kế trước hợp đồng` (phòng Thiết kế) |
| **Request** | `10-task-request-claude-code.md` §5 | Chưa bắt đầu — pilot `[D&B] Đề nghị mua vật tư` |
| Dataset | `01-dataset.md` | Nền dùng chung (Link dataset record "Mã công trình") |

**Bản mở rộng (tham khảo, không ưu tiên):**

| Wave | Luồng | File brief | Phụ thuộc |
|---|---|---|---|
| 1 | eSign | `02-esign.md` | — |
| 1 | Commerce | `03-commerce.md` | (nhẹ) Dataset |
| 2 | BPM | `05-bpm.md` | Dataset, eSign |
| 2 | CRM (Sales) | `06-crm.md` | Commerce |
| 3 | Lead | `07-lead.md` | CRM |
| 3 | Prospector | `08-prospector.md` | Lead |

## 4. Ưu tiên kịch bản demo

| Ưu tiên | Kịch bản (10–15 phút) | App (Work OS) | Ghi chú |
|---|---|---|---|
| **1** | **"Cùng một hợp đồng, một căn lời, một căn lỗ — lỗ ở đâu?"** — P&L đặt 015 (lời 20%) cạnh 016 (lỗ −4,8%) → truy vết 5 nguồn tiền rò của 016 → phát sinh chưa báo giá trên Workflow | Projects, Workflow (Phát sinh, Thiết kế), Request (vật tư làm lại 62tr) | **Pilot làm đầu tiên.** Kịch bản chi tiết + talk track: `09-kich-ban-cong-trinh-doi-chung.md` |
| 2 | **"Phòng Thiết kế đang dồn giờ vào đâu?"** — 126 giờ ≈ 22,7tr concept cho 8 khách không ký (45% giờ presales) | Task | Thay cho kịch bản "Zalo → hợp đồng" (CRM không nằm trong bộ bán) |
| 3 | **"Kiểm soát đội khoán"** — 015 ứng đúng 66tr theo KL nghiệm thu; 016 ứng 84tr vì đợt 18tr đi tắt bằng Direct Request | Request (Tạm ứng khoán), Projects | Nhân vật: Tổ Sáu Phát (khoán 84tr / dự toán 66tr) |
| 4 | Việc định kỳ (bảo trì xưởng, đối soát công nợ, gọi lại khách), đổi vật liệu, chiết khấu | Task, Request | Làm sau |

## 5. Quy ước chung (mọi agent phải theo)

- **Tên công ty (trong dữ liệu):** Acme (Công ty Nội thất Acme). Không dùng tên khác.
- **Tiền tệ:** VND. Đơn vị: md (mét dài), m², bộ, cái, điểm (điện).
- **Khung thời gian dữ liệu:** 01/06/2026 – 31/10/2026; "hôm nay" = 03/10/2026 (luồng Workflow/Task/Request dùng 04/10/2026 vì không backdate được ngày tạo).
- **Mã công trình:** `ACME-2026-xxx` — là **khoá chung** giữa mọi app (field "Mã công trình" ở Workflow/Task/Request,
  mã dự án ở Projects, record ở Dataset "Danh mục công trình").
- **Tiền tố mã hồ sơ:**

| Đối tượng | Mẫu mã |
|---|---|
| Dự án (Projects) | `ACME-{year}-{counter}` |
| Phát sinh (Workflow; BPM ở bản mở rộng) | `PS-{year}-{counter}` |
| Thiết kế trước HĐ (Task) | `TKS-xxxx` |
| Đề nghị mua vật tư (Request) | `MVT-{year}-{counter}` |
| Tạm ứng khoán (Request) | `TUK-{year}-{counter}` |
| Tạm ứng / hoàn ứng chi phí công trình (Request) | `TU-{year}-{counter}` |
| Đổi vật liệu thay thế (Request) | `DVL-{year}-{counter}` |
| Chiết khấu ngoài khung (Request) | `CK-{year}-{counter}` |
| Thanh toán NCC/thầu phụ (Request) | `TTN-{year}-{counter}` |
| Bản mở rộng: Báo giá `BG` · Hợp đồng `HD` (Commerce) · Lệnh sản xuất `LSX` · Nghiệm thu `NT` · Hợp đồng khoán `HDK` · Thanh toán khoán `TTK` · Bảo hành `BH` (BPM) | `<mã>-{year}-{counter}` |

- **Dữ liệu phải trông như công ty thật:** không dùng các chữ "demo", "test", "mẫu thử", "Nguyễn Văn A",
  "Khách hàng 1", "Công ty ABC". Tên người và công ty khách đều hư cấu; **không dùng tên thương hiệu hay
  dữ liệu khách hàng thật**.
- **Tenant demo dùng chung:** không xoá, không sửa service/dữ liệu của người khác. Lọc phần việc của bộ demo này bằng tiền tố `[D&B]`.

### 5.1 Quy ước đặt tên cấu hình — tiền tố `[D&B]` (bắt buộc, từ 03/10/2026)

- **Mọi service tạo mới** (service Projects, workflow, service Task, service Request, và ở bản mở rộng: service BPM, pipeline/account/contact CRM,
  lead service, quote/order/payment Commerce, sign service eSign, service Prospector) và **mọi nhóm service / workspace / thư mục / catalog** tạo mới
  đều bắt đầu bằng `[D&B] `. Ví dụ: `[D&B] Nội thất nhà ở`, `[D&B] Phát sinh`, `[D&B] Phòng Thiết kế`.
- **Không đặt "Acme" trong tên service/nhóm/catalog.** "Acme" chỉ xuất hiện trong **dữ liệu**: tên công trình, mã `ACME-2026-xxx`,
  nội dung hồ sơ, tên bên B trong hợp đồng, chủ tài khoản ngân hàng…
- Không áp tiền tố cho bản ghi dữ liệu (dự án, job, work request, request…) và cho tên field/stage/loại item.
- Service có sẵn trên tenant (của người khác) giữ nguyên, không đổi tên.
- Đã tạo service tên cũ trước ngày 03/10 → đổi tên theo quy ước và ghi lại trong `status/<app>.md` mục "Lệch so với brief".

## 6. Nhân sự giả định (persona)

Gán vào user có sẵn trên tenant demo (đổi tên hiển thị nếu được phép) hoặc dùng làm giá trị text/assignee.
Ánh xạ persona → tài khoản tenant mà luồng Workflow đã dùng: xem `status/workflow.md` (Vòng 3) và `10-task-request-claude-code.md` §2.1.

| # | Họ tên | Vai trò | Phòng ban | Dùng ở |
|---|---|---|---|---|
| 1 | Hoàng Đức Minh | Giám đốc | Ban giám đốc | Duyệt cấp cao mọi app |
| 2 | Vũ Thanh Hương | Trưởng phòng Kinh doanh | Kinh doanh | Request (chiết khấu), Task (gửi yêu cầu) |
| 3 | Đặng Quốc Huy | Chuyên viên tư vấn – nhà ở | Kinh doanh | Task (gửi yêu cầu thiết kế) |
| 4 | Phan Ngọc Trâm | Chuyên viên tư vấn – fit-out | Kinh doanh | Task (gửi yêu cầu thiết kế) |
| 5 | Lý Gia Bảo | Trưởng phòng Thiết kế (KTS) | Thiết kế | Projects, Workflow, Task, Request (đổi vật liệu) |
| 6 | Trịnh Mai Anh | Designer | Thiết kế | Projects, Workflow, Task |
| 7 | Ngô Tuấn Kiệt | Designer | Thiết kế | Projects, Workflow, Task |
| 8 | Bùi Thị Lan | Dự toán (QS) | Dự toán | Workflow (Phát sinh), Task, Request (đổi vật liệu) |
| 9 | Đinh Văn Phúc | Nhân viên Mua hàng | Mua hàng | Request (mua vật tư, TT NCC), Task |
| 10 | Tạ Văn Hùng | Quản đốc xưởng | Xưởng | Task (bảo trì), Request (tăng ca) |
| 11 | Lâm Chí Thanh | Trưởng phòng Thi công (PM) | Thi công | Projects, Workflow, Request |
| 12 | Hồ Văn Tài | Giám sát công trình | Thi công | Workflow, Request — giám sát 015 |
| 13 | Châu Minh Đạt | Giám sát công trình | Thi công | Workflow, Request — giám sát 016 |
| 14 | Mai Thị Ngọc | Kế toán trưởng | Kế toán | Request (duyệt chi), Task |
| 15 | Võ Thu Trang | Kế toán dự án | Kế toán | Projects (Costs/Incomes), Workflow |
| 16 | Lương Bảo Ngọc | CSKH – Bảo hành | CSKH | Task (gọi lại khách), Workflow (Bảo hành) |

## 7. Dữ liệu vàng dùng chung (mọi app phải khớp)

### 7.1 Công trình

| Mã | Tên công trình | Khách hàng (hư cấu) | Dòng DV | Giá trị HĐ | Giai đoạn (03/10) | Sức khoẻ | Vai trò trong kịch bản |
|---|---|---|---|---|---|---|---|
| ACME-2026-008 | Căn hộ 2PN Thảo Điền | Anh Đỗ Hoàng Nam | Nhà ở | 410.000.000 | Bảo hành | Done | Có 1 yêu cầu bảo hành (cửa tủ lệch) |
| ACME-2026-011 | Văn phòng Sao Việt Logistics | Công ty CP Sao Việt Logistics (người LH: chị Nguyễn Thảo Vy) | Fit-out | 1.600.000.000 | Sản xuất | On track | Fit-out B2B mẫu: sản xuất, thanh toán theo KL |
| ACME-2026-012 | Căn hộ 3PN Quận 7 | Chị Lê Thu Hà | Nhà ở | 620.000.000 | Chốt bản vẽ | Watch | Thiết kế sửa 5 vòng → lời gộp ổn, **lời thật thấp** (giờ công thiết kế) |
| ACME-2026-013 | Nhà phố Gò Vấp | Anh Phạm Quốc Bảo | Nhà ở | 980.000.000 | Thiết kế chi tiết | On track | Công trình mới, minh hoạ đầu vòng đời |
| ACME-2026-014 | Café Mộc Lan – Quận 1 | Công ty TNHH Mộc Lan F&B (người LH: anh Trương Gia Huy) | Fit-out | 750.000.000 | Nghiệm thu | Watch | **Doanh thu đợt cuối quá hạn** 18 ngày vì hồ sơ nghiệm thu thiếu |
| **ACME-2026-015** | Căn hộ 3PN Quận 2 | Chị Nguyễn Minh Thư | Nhà ở | 1.200.000.000 (+145.000.000 phát sinh đã ký phụ lục) | Bảo hành (bàn giao đúng hạn 26/09) | On track | **Kịch bản 1 — căn LỜI**: biên 20,2%; 3 phát sinh có phụ lục; khoán theo KL nghiệm thu (ứng 66tr) |
| **ACME-2026-016** | Căn hộ 3PN Bình Thạnh | Anh Võ Quang Huy | Nhà ở | 1.200.000.000 | Nghiệm thu (trễ 5 tuần) | **Off track — đang lỗ** | **Nhân vật chính kịch bản 1 & 3 — căn LỖ**: biên −4,8%, vượt dự toán 27%; sửa thiết kế 6 vòng; đo sai → làm lại 5 module tủ bếp (vật tư 62tr); 3 phát sinh làm trước chưa báo giá (96tr); Tổ Sáu Phát ứng 84tr / dự toán 66tr; đợt cuối 120tr quá hạn 25 ngày |
| ACME-2026-017 → 024 | 017 Căn hộ 2PN Thủ Thiêm · 018 Biệt thự Quận 7 · 019 Văn phòng Nam Kha Software · 020 Nhà phố Thủ Đức · 021 Showroom gốm Bích Ngọc · 022 Căn hộ 3PN Thủ Đức · 023 Café Lá Me – Bình Thạnh · 024 Căn hộ Duplex Quận 2 | — | Nhà ở / Fit-out | — | Thiết kế (mới ký, mùa cao điểm) | — | Tạo trong Workflow (vòng 2); Task "Thiết kế trước HĐ" có 8 yêu cầu dẫn tới các HĐ này |

Chi tiết số liệu 015/016 (dự toán chung 988.820.000, 5 điểm rẽ nhánh D1–D5, chuỗi truy vết): `09-kich-ban-cong-trinh-doi-chung.md`.
ACME-2026-009 (Biệt thự Thảo Điền) **không còn dùng**.

Task "Thiết kế trước HĐ" có thêm 8 khách **không ký** (126 giờ) và 4 yêu cầu đang chạy — danh sách ở `10-task-request-claude-code.md` §4.

### 7.2 Tổ đội khoán

| Mã | Tổ đội | Cai / đại diện | Chuyên môn | Đánh giá |
|---|---|---|---|---|
| TD-01 | Tổ lắp đặt Sáu Phát | Nguyễn Văn Sáu | Lắp đặt đồ gỗ | 3/5 (có lần ứng vượt) |
| TD-02 | Tổ sơn bả Tư Lành | Lê Văn Tư | Sơn bả, giấy dán tường | 4/5 |
| TD-03 | Đội điện nước Hưng Phát | Trần Hưng | Điện, nước, chiếu sáng | 4/5 |
| TD-04 | Đội đá – kính Thành Công | Phạm Thành Công | Đá ốp, kính cường lực | 5/5 |

### 7.3 Nhà cung cấp (hư cấu)

Ván gỗ Phú Thịnh (ván MDF/HDF/Melamine) · Phụ kiện Minh Long (bản lề, ray, tay nắm) · Sơn Đại Phát · Đá Hoàng Gia ·
Kính An Bình · Đèn Quang Minh · Vận tải Tân Cảng Xanh.

## 8. Câu hỏi mở (chưa chốt với product — không tự đoán)

1. Dữ liệu có chảy liên app không: Workflow/Request → Projects Costs/Incomes; Task → My works của Projects/Workflow.
2. Sổ thu chính: **Projects Incomes là sổ chính sau hợp đồng** (để P&L đúng).
3. Task: dashboard có group theo custom field không; workload có quy ra tiền không.
4. Request: Conditional có đọc được Formula field không; Direct Request có lên báo cáo cùng service chuẩn không.
5. Workflow: rollup/lookup không chạy qua liên kết phiếu (đã xác nhận 04/10) → cộng dồn tạm ứng khoán phải nhập tay ở Request.
6. (Bản mở rộng) Commerce tính khối lượng từ kích thước; BPM sub job đọc giá trị cộng dồn của job cha; eSign gửi người ký ngoài.

## 9. Mẫu file trạng thái `demo-acme/status/<app>.md`

```
# Status — <App>
- Agent / chat: <mô tả ngắn> · Cập nhật: <ngày giờ>
- Trạng thái: Chưa bắt đầu / Pilot xong / Đang bơm dữ liệu / Xong / Bị chặn
- Tóm tắt 1 dòng (key insight): <điều quan trọng nhất>
## Đã dựng
- <service / cấu hình> — <URL hoặc ID>
## Dữ liệu đã bơm
- <đối tượng>: <số lượng> (khớp mục 7 master: có/không)
## Lệch so với brief (và lý do)
## Chặn / cần từ app khác
## Phát hiện giới hạn sản phẩm (để hỏi product)
## Usage ước tính cho pilot / toàn bộ
## Cần Thành quyết (key decision / đề xuất)
```

## 10. Nguồn tài liệu sản phẩm

Kho trên máy Thành: `C:\Users\ngphu\Documents\[Foundation] Base 3.0 ready\` (đọc README `00_README_FIRST.md`).
Mỗi app có `Knowledge_<App>.md` (đọc trước) và `Skill_setup_<App>.skill` (dựng demo). Task chưa có skill riêng → `base-demo-data.skill`.
Workflow 3.0 chưa có thư mục trong kho → dùng `status/workflow.md` (công thức API). Chính sách giá: `policies/chinh_sach_gia_base_2.0_agentic_operating_system.pdf`.
Không gửi file `.md` cho khách.

## 11. Nhật ký thay đổi

- 03/10/2026 — Bản đầu.
- 03/10/2026 — Thêm quy ước tiền tố `[D&B]` cho mọi service/nhóm/catalog tạo mới (mục 5.1); bỏ "Acme" khỏi tên service; sửa tên trong brief 01–08.
- 04/10/2026 — Thay ACME-2026-009 bằng cặp song sinh ACME-2026-015 (lời) / ACME-2026-016 (lỗ); bộ dữ liệu thành 7 công trình; thêm `09-kich-ban-cong-trinh-doi-chung.md`; thêm mục 0.8 (script tự chạy khi API bị chặn).
- 04/10/2026 — Thêm mục 0.9: quy ước trình bày câu trả lời (key insight → chi tiết → kết luận/đề xuất); cập nhật prompt mở chat và mẫu file trạng thái.
- 04/10/2026 — **Bộ bán = Work OS 4 app** (Workflow · Project · Task · Request); thêm mục 2.1 (quy tắc 4 câu hỏi, bản đồ phòng ban, gói giá); BPM/CRM/Commerce/Lead/Prospector chuyển thành bản mở rộng; viết lại mục 3, 4, 8; thêm công trình 017–024 vào 7.1; thêm mã hồ sơ Task/Request; thêm `10-task-request-claude-code.md`.
