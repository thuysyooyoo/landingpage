# TÀI LIỆU PHÂN TẦNG THIẾT KẾ & KHÓA CHỐT MILESTONE V2
**Chiến dịch:** Eureka Customer Awards 2026 — Lễ Hội Tri Ân Khách Hàng  
**Phiên bản khóa chốt:** Milestone V2 (Đồng bộ Cỗ máy Vòng quay 3D Arcade Machine BXUX, Bục Gala Cân Đối, Tối Ưu Tương Phản Nhiệm Vụ & Google Sheets Cloud v3.0)  
**Tệp snapshot lưu trữ dự phòng:** `milestone-v2-dong-bo-arcade-3d.html`  
**Ngày chốt:** Tháng 10/2026  

---

## 🏛️ TẦNG 1: KHUNG KIẾN TRÚC & HỆ THỐNG NHẬN DIỆN CỐT LÕI (ĐÃ KHÓA CHỐT V2)
> *Mục đích: Đảm bảo toàn bộ 7 section của Landing Page luôn giữ tính thống nhất tuyệt đối về thẩm mỹ, không bị xáo trộn khi chỉnh sửa chi tiết ở các giai đoạn sau.*

### 1.1. Cỗ Máy Vòng Quay May Mắn 3D Arcade Machine ("BXUX Style") — Đồng Bộ 100% Cả 2 Vòng
* **Hình thức & Khung máy 3D**:
  * **Vành đĩa 3D Extruded Cylinder Rim** (`.arcade-wheel-rim`): Dày dặn hình trụ nổi, ánh kim tím magenta/neon metallic chém cạnh vát sáng cao cấp.
  * **10 Bóng đèn LED ngọc trai** (`.arcade-bulb`): Đặt đều quanh vành bánh xe với hiệu ứng chuyển động phát sáng lấp lánh (chasing light 280ms luân phiên).
  * **Nan quạt pastel & trắng sữa**: Đan xen trang nhã, tương phản cao, chữ nằm dọc nan quạt sắc nét xuôi chiều, loại bỏ hoàn toàn cảm giác 2D lòe loẹt cũ.
  * **Kim chỉ thưởng 3D Jewel Pointer** (`#wheel-needle`, `#m05-wheel-needle`): Thiết kế sắc sảo hình viên ngọc kim cương tím/hồng chém cạnh có viền sáng.
  * **Chân đế bục máy 3D** (`.wheel-3d-pedestal-stand`): Bục hình thang dập nổi thương hiệu Eureka 2026, sàn phản quang chuyển màu và 2 viên đá quý 💎 lơ lửng hai bên.
* **Phân định nội dung bên trong**:
  * **Vòng 1 (Modal Trải Nghiệm Khách Hàng)**: 8 ô giải thưởng voucher/dịch vụ + nút bấm trung tâm **QUAY NGAY**.
  * **Vòng 2 (Section Tri Ân Mùng 05)**: 12 ô chứa mã booking dự thưởng (`ERK-BK-2026-XXXX`) + trục tâm **MÃ BOOKING MÙNG 05**.

### 1.2. Bố Cục Vinh Danh Bậc Thang Top 3 Gala — Cân Đối Đối Xứng Tuyệt Đối
* **Nguyên tắc phân cấp thị giác**:
  * **Top 1 — Quán Quân (Laptop AI Surface Pro 12)**: Vị trí trung tâm (#2 DOM flex order), nhô cao vượt bậc (`transform: translateY(-24px) scale(1.05)`), viền vàng hoàng kim `#F59E0B`, bục chân 10px `#D97706`, bóng đổ vàng kim nổi bật nhất.
  * **Top 2 — Á Quân 1 (iPad Air 11 inch M3 5G)**: Vị trí bên trái (#1 DOM flex order), viền xanh bạch kim băng ngọc `#38BDF8`, bục chân 8px `#0284C7`.
  * **Top 3 — Á Quân 2 (Máy Lọc Không Khí Dyson)**: Vị trí bên phải (#3 DOM flex order), viền đỏ hồng đồng ruby `#FB7185`, bục chân 8px `#BE123C`.
* **Khóa tỷ lệ đối xứng 100%**:
  * Chiều rộng cả hai thẻ Á Quân 1 và Á Quân 2 cố định bằng nhau: **`width: 330px`**.
  * Chiều cao khung kính trưng bày sản phẩm (`.crystal-plate`): **`height: 195px`** (Quán Quân là **`225px`**).
  * Xóa bỏ hoàn toàn xung đột CSS selector cũ (`nth-child(1)`), cố định bằng ID độc lập (`#hero-podium-silver`, `#hero-podium-gold`, `#hero-podium-copper`).

### 1.3. Section Nhiệm Vụ Hệ Thống (Cột Mốc VIP+1)
* **Loại bỏ container thừa**: Triệt tiêu hoàn toàn hộp chữ nhật màu trắng bao bọc ngoài 2 khối con. Hai khối thẻ *"Khởi Động Sớm"* và *"Danh Sách Mã KH Đạt Chuẩn"* giờ đây lơ lửng tự nhiên trên nền trang.
* **Tương phản chuẩn WCAG AAA**:
  * Chữ điều kiện: Màu hổ phách đậm nét `#9A3412` và `#451A03`.
  * Chữ phần thưởng: Màu xanh ngọc đậm `#065F46` và `#047857`.
  * Tiêu đề: Màu than chì `#0F172A`.
  * Danh sách mã khách hàng: Hiển thị đen than `#0F172A` trên nền thẻ trắng bo tròn cùng nhãn `VIP+1` xanh lá.

### 1.4. Hệ Thống 5 Mã Màu Typography Chuẩn (Design Tokens)
Đã khóa cố định tại Mục 25 trong file `style.css`:
1. **Tiêu đề lớn (Section H1, H2)**: `#0F172A` *(Slate 900 — Than chì đậm, trọng tâm thị giác)*
2. **Tiêu đề nhỏ (Card Titles H3, H4)**: `#1E293B` *(Slate 800 — Đen than sâu, phân lớp nội dung)*
3. **Nội dung chính (Body Text / p)**: `#334155` *(Slate 700 — Xám chì đậm, êm mắt, tương phản cao)*
4. **Phụ đề & Lead Text**: `#475569` *(Slate 600 — Xám trầm trung tính)*
5. **Ghi chú & Micro-copy**: `#64748B` *(Slate 500 — Chữ chú thích nhẹ nhàng)*

### 1.5. Hệ Thống Backend & Dữ Liệu Đồng Bộ
* **Google Sheets Cloud Database v4.0**: 8 sheet chuyên biệt đồng bộ tự động 2 chiều qua `sheets-sync.js` và `google-apps-script-backend.js` (kèm sheet Audit Log `LichSuChinhSua` và cơ chế tự động dọn dẹp sheet thừa).
* **Admin Control Panel**: 6 Tab quản trị chuyên sâu (bao gồm Tab 6 Cloud DB, Đổi mật khẩu động trên Cloud, Phân tách cột Cân nặng Kg / Thể tích M³, nút Xóa Sheet Thừa).
* **Popup Tra Cứu 5 Hạng Mục Giải Phụ**: Tra cứu thứ hạng và mã khách hàng thời gian thực.
* **Bảo toàn ảnh & Font**: Giữ nguyên toàn bộ thư mục `assets/images/` và `assets/img/`, chuẩn font nhận diện thương hiệu `Plus Jakarta Sans`.

---

## 🛠️ TẦNG 2: NGUYÊN TẮC BẢO TRÌ & QUY TRÌNH PHỤC HỒI AN TOÀN
1. **Nguyên tắc "Không chạm vào thư mục ảnh"**: Mọi file ảnh gốc trong `assets/images/` và `assets/img/` tuyệt đối không được xóa hay ghi đè.
2. **Nguyên tắc "Bảo toàn 2 cỗ máy 3D"**: Khi cập nhật cơ cấu giải thưởng, chỉ sửa text/dữ liệu mảng trong `wheel.js` hoặc Google Sheets, không sửa cấu trúc DOM và canvas render 3D của bánh xe.
3. **Quy trình phục hồi tức thời**: Nếu có bất kỳ chỉnh sửa nào trong tương lai vô tình làm xáo trộn bố cục hoặc logic, có thể khôi phục 100% trạng thái hoàn hảo ngay lập tức từ tệp dự phòng `milestone-v2-dong-bo-arcade-3d.html`.
