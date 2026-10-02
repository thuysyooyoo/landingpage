# 🏆 EUREKA CUSTOMER AWARDS 2026 — LANDING PAGE SỰ KIỆN

> **Dự án Landing Page Sự Kiện & Hệ Thống Vòng Quay Kép Tri Ân Khách Hàng Quý 4/2026**  
> **Thương hiệu:** Eureka Logistics ([erktransport.com](https://www.erktransport.com/))  
> **Hệ thống giải thưởng:** Top 3 Chung Cuộc Q4 (Surface Pro 12, iPad Air M3, Dyson), 05 Giải Phụ Chuyên Môn, Cột Mốc VIP+1 và Vòng Quay Tri Ân Mùng 05.  
> **Phong cách:** *Huashu-Design* (HTML Native High Craft, ít chữ, nhiều visual, bảo mật B2B tuyệt đối, tốc độ tải tức thì).

---

## 🔒 1. Chính Sách Bảo Mật B2B & Chống Cào Dữ Liệu Đối Thủ

Để bảo vệ tối đa dữ liệu kinh doanh của hàng trăm khách hàng và hộ kinh doanh đối tác:
* **Che Tên Công Ty / Hộ Kinh Doanh (`***`):** Chỉ hiển thị tiền tố và hậu tố nhận diện (Ví dụ: `Tập Đoàn XNK *** Á Châu`, `Công Ty CP Thương Mại *** Minh`, `TNHH SX & PP Gia Dụng *** An`).
* **Không Hiển Thị Mã Khách Hàng:** Tuyệt đối loại bỏ mã định danh khách hàng trên giao diện web công khai để ngăn chặn đối thủ cào dữ liệu (web scraping) hoặc dò tìm danh tính đối tác.
* **Thay Bằng Số Điện Thoại Ẩn (`098***6789`):** Hiển thị số điện thoại đại diện được che 4 chữ số ở giữa, vừa tạo tính minh bạch và uy tín, vừa bảo đảm quyền riêng tư liên hệ của khách hàng.

---

## 🎡 2. Kiến Trúc 2 Vòng Quay May Mắn (Dual Lucky Wheels)

### 🎡 Vòng Quay 1: Vòng Quay Trải Nghiệm Khách Hàng (Tự Do Quay)
* **Vị trí trên web:** Section `#vong-quay-trai-nghiem`.
* **Đối tượng:** Tất cả khách hàng và đối tác truy cập landing page.
* **Cơ chế:** Khách hàng nhập số điện thoại để quay ngẫu nhiên nhận Voucher 300k - 400k hoặc vé ưu tiên dịch vụ (trừ trực tiếp vào cước chuyến hàng tiếp theo).
* **Quản trị tỉ lệ & Kho quà:** Tỉ lệ trúng thưởng (%) và số lượng quà tặng trong kho **do Admin toàn quyền thiết lập trong Bảng Quản Trị**. Khi khách hàng quay trúng, số lượng quà trong kho sẽ tự động giảm trừ.

### 👑 Vòng Quay 2: Đại Lễ Tri Ân Mùng 05 Hàng Tháng (Admin Quay Chính Thức)
* **Vị trí trên web:** Section `#vong-quay-mung-05`.
* **Thể lệ:** Dành riêng cho 100% đơn hàng có booking hoàn thành thực tế trong tháng. Hệ thống tự động cấp 01 mã dự thưởng hợp lệ cho mỗi đơn.
* **Phân quyền truy cập:**
  * **Khách hàng thông thường:** **CHỈ ĐƯỢC XEM** thể lệ, cơ cấu giải thưởng từng kỳ và **Bảng Vinh Danh Khách Hàng Nhận Quà Mùng 05**. Nếu bấm vào vòng quay, hệ thống sẽ hiện thông báo chính sách.
  * **Ban Tổ Chức (Admin):** Sau khi đăng nhập Admin, xuất hiện **Bảng Điều Khiển Quay Số Mùng 05** để Admin chọn kỳ quay (Tháng 10, Tháng 11, Tháng 12) và bấm quay số trực tiếp. Kết quả trúng giải sẽ tự động lưu và cập nhật lên bảng công khai cho khách hàng theo dõi.

---

## 🔐 3. Hướng Dẫn Truy Cập Bảng Quản Trị Admin

1. **Cách truy cập:**
   * Cách 1: Thêm `#admin` hoặc `?admin` vào đuôi đường dẫn web (Ví dụ: `https://thuysyooyoo.github.io/landingpage/#admin`).
   * Cách 2: Cuộn xuống chân trang (Footer), click vào dòng chữ: **`🔐 Quản Trị Sự Kiện (Admin)`**.
2. **Mật khẩu đăng nhập mặc định:**
   ```text
   eureka2026
   ```
3. **Các tính năng trong Admin Dashboard:**
   * **Cấu hình Ô Quay Vòng 1:** Thay đổi nhãn hiển thị, tên phần thưởng, điều chỉnh thanh Tỉ lệ % trúng, cập nhật Số lượng quà còn trong kho, hoặc bấm Khôi phục mặc định.
   * **Quản lý Người Trúng Quà Mùng 05:** Xem danh sách, kiểm tra trạng thái trừ cước và xóa các lượt quay thử nghiệm nếu cần.

---

## 📁 4. Cấu Trúc Thư Mục Module Hóa

```text
Landing-Page-Project-Eureka-Customer-Awards-2026/
│
├── index.html                    # Giao diện chính thức chuẩn nhận diện erktransport.com
├── README.md                     # Tài liệu bàn giao và quản trị (File này)
├── .gitignore                    # Bỏ qua các file rác hệ thống
│
├── assets/
│   ├── css/
│   │   └── style.css             # Hệ màu Eureka (Cam/Deep Slate Navy/Gold), Glassmorphism
│   ├── js/
│   │   ├── admin.js              # Module quản trị: Xác thực mật khẩu, chỉnh tỉ lệ & kho quà, quản lý giải Mùng 05
│   │   ├── wheel.js              # Động cơ Vòng quay kép Canvas 2D + Âm thanh Web Audio API
│   │   ├── confetti.js           # Hiệu ứng pháo hoa Canvas HTML5 khi trúng quà
│   │   ├── countdown.js          # Đồng hồ đếm ngược đóng cổng nhận đơn 31/12/2026
│   │   ├── leaderboard.js        # Bảng xếp hạng Q4 động, bảo mật tên & SĐT, tìm kiếm tức thì
│   │   └── main.js               # Chuyển tab giải thưởng, FAQ accordion, popup modal
│   └── images/                   # Thư mục lưu ảnh tùy biến
│
└── data/
    ├── leaderboard-data.json     # Dữ liệu BXH Top 10 (Cập nhật định kỳ thứ Hai)
    └── prizes-data.json          # Cấu hình quà tặng & xác suất Vòng 1 + Vòng 2
```

---

## 🚀 5. Xuất Bản Trực Tuyến Qua GitHub Pages

1. Kho lưu trữ: **[https://github.com/thuysyooyoo/landingpage](https://github.com/thuysyooyoo/landingpage)**
2. Vào **Settings** > **Pages** > Chọn branch **`main`**, thư mục **`/ (root)`** > Nhấn **Save**.
3. Trang web chạy trực tuyến tại:  
   👉 **`https://thuysyooyoo.github.io/landingpage/`**
