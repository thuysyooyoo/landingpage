# 🏆 EUREKA CUSTOMER AWARDS 2026 — LANDING PAGE SỰ KIỆN

> **Dự án Landing Page Sự Kiện & Vòng Quay May Mắn Tri Ân Khách Hàng Quý 4/2026**  
> **Thương hiệu:** Eureka Logistics ([erktransport.com](https://www.erktransport.com/))  
> **Tổng quỹ giải thưởng:** 135.000.000 VNĐ  
> **Phong cách thiết kế:** *Huashu-Design* (HTML Native High Craft, giao diện sang trọng, ít chữ, chuyển động mượt mà, tối ưu tải nhanh, đồng bộ 100% nhận diện thương hiệu Eureka).

---

## 📁 1. Cấu Trúc Thư Mục Dự Án (Project Structure)

Dự án được đóng gói theo mô hình **Module hóa chuẩn công nghiệp (Self-contained & Modular)**, tách biệt hoàn toàn giữa Giao diện (HTML), Kiểu dáng (CSS), Dữ liệu (JSON) và Logic xử lý (JavaScript). Bất kỳ ai (từ Marketer không biết lập trình đến Web Developer) đều có thể dễ dàng sửa đổi:

```text
Landing-Page-Project-Eureka-Customer-Awards-2026/
│
├── index.html                    # File giao diện chính (Single Source of Truth)
├── README.md                     # Tài liệu hướng dẫn sử dụng và bàn giao (File này)
│
├── assets/
│   ├── css/
│   │   └── style.css             # Hệ màu Eureka, Dark Slate Blue, Glassmorphism, Animation
│   ├── js/
│   │   ├── countdown.js          # Bộ đếm ngược thời gian thực đến 31/12/2026 23:59:59
│   │   ├── confetti.js           # Hiệu ứng bắn pháo hoa hạt Canvas HTML5 ăn mừng trúng thưởng
│   │   ├── wheel.js              # Động cơ Vòng quay may mắn Canvas 2D + Âm thanh Web Audio API
│   │   ├── leaderboard.js        # Logic nạp BXH từ JSON, tìm kiếm tức thì, phân hạng VIP
│   │   └── main.js               # Chuyển tab giải thưởng, mở/đóng FAQ accordion, popup modal
│   └── images/                   # Thư mục chứa hình ảnh tùy biến (logo, banner, quà tặng)
│
└── data/
    ├── leaderboard-data.json     # DỮ LIỆU BẢNG XẾP HẠNG TOP 10 (Cập nhật định kỳ thứ Hai)
    └── prizes-data.json          # Cấu hình 8 ô phần thưởng Vòng quay & Tỷ lệ trúng
```

---

## 🎯 2. Hướng Dẫn Nhanh Cho Marketer / Content (Không Cần Biết Code)

### 📌 A. Cập nhật Bảng Xếp Hạng Doanh Số Top 10 (Hàng tuần)
Khi kết thúc mỗi tuần hoặc mỗi chặng, bạn chỉ cần mở file:  
👉 `data/leaderboard-data.json` bằng Notepad, VS Code hoặc bất kỳ trình soạn thảo văn bản nào.

Cấu trúc mỗi khách hàng như sau:
```json
{
  "rank": 1,
  "company_name": "Tập Đoàn XNK Thiết Bị Công Nghiệp Á Châu",
  "customer_code": "ERK-00912",
  "vip_tier": "VIP ELITE",
  "order_count": 48,
  "volume_weight": "142,5 tấn | 190 m³",
  "service_fee": 428650000,
  "prize_tag": "💻 Laptop Surface 35Tr",
  "prize_type": "top1"
}
```
* **`rank`**: Số thứ tự xếp hạng (1, 2, 3...).
* **`company_name`**: Tên doanh nghiệp hiển thị trên BXH.
* **`customer_code`**: Mã định danh khách hàng trên hệ thống Eureka (VD: `ERK-00912`).
* **`vip_tier`**: Hạng thành viên (`VIP ELITE`, `VIP PREMIUM`, `VIP PRO`, `KH MỚI`).
* **`order_count`**: Tổng số đơn booking hoàn tất.
* **`volume_weight`**: Khối lượng / Thể tích tích lũy.
* **`service_fee`**: Doanh số phí dịch vụ (đơn vị: VNĐ, viết liền không dấu chấm phẩy, VD: `428650000`).
* **`prize_tag`**: Nhãn quà tặng tạm tính đang nắm giữ.

Sau khi lưu file `leaderboard-data.json`, tải lại trang web là dữ liệu tự động cập nhật!

---

### 📌 B. Chỉnh sửa các ô của Vòng Quay May Mắn
Mở file 👉 `data/prizes-data.json`:
Bạn có thể thay đổi tên voucher, màu sắc các ô quay, hoặc câu chúc mừng trúng thưởng.

---

### 📌 C. Thay đổi thông tin liên hệ (Hotline, Zalo, Fanpage)
Mở file 👉 `index.html`, nhấn `Ctrl + F` để tìm và thay thế nhanh:
* **Số Hotline:** `0898586622` (thay bằng số mới ở cả thẻ hiển thị và `tel:0898586622`).
* **Link Zalo OA:** `https://zalo.me/0898586622`.
* **Link Fanpage Facebook:** `https://www.facebook.com/101674648022986`.
* **Link TikTok:** `https://www.tiktok.com/@eureka_logistics`.
* **Link YouTube:** `https://www.youtube.com/@erktransport.logistics`.

---

## 💻 3. Hướng Dẫn Dành Cho Lập Trình Viên (Developer Guide)

### 🚀 A. Chạy thử nghiệm Local
1. **Cách 1 (Mở trực tiếp):** Double-click vào file `index.html`. Trang web sẽ chạy ngay lập tức trên trình duyệt mặc định (Chrome, Edge, Safari...).  
   *(Lưu ý: Hệ thống đã tích hợp sẵn cơ chế **Fallback in-memory** an toàn, nên ngay cả khi mở qua giao thức `file://` bị chặn CORS, bảng xếp hạng và vòng quay vẫn hoạt động hoàn hảo 100%).*
2. **Cách 2 (Khuyên dùng - Chạy Local Web Server):**
   * Sử dụng extension **Live Server** trên Visual Studio Code.
   * Hoặc mở terminal trong thư mục dự án và chạy:
     ```bash
     # Nếu máy có Python
     python -m http.server 8000
     # Truy cập: http://localhost:8000
     ```

### 🎨 B. Hệ thống thiết kế & Công nghệ (Tech Stack)
* **HTML5 Semantic & Native Elements**: Cấu trúc chuẩn SEO, thẻ mở rộng chuẩn Social Open Graph metadata.
* **Tailwind CSS (JIT via CDN)**: Tùy biến bảng màu Eureka:
  * Brand Orange: `#ea580c`, `#f97316` (Nhận diện logo Eureka).
  * Deep Slate Navy: `#0b1120`, `#0f172a` (Trùng khớp 100% với nền `erktransport.com`).
  * Amber Gold: `#f59e0b`, `#fde047` (Vinh danh cúp & giải thưởng).
* **Font chữ**: Google Fonts `'Plus Jakarta Sans'` kết hợp `'Google Sans'`, mang lại diện mạo hiện đại, thanh thoát của một cổng thông tin Logistics cao cấp.
* **Web Audio API Synthesis**: Âm thanh quay bánh đà `tick` và âm thanh chiến thắng `fanfare chord` được **tổng hợp trực tiếp bằng dao động sóng âm (Oscillator)** trong trình duyệt, **hoàn toàn không cần tải file MP3 bên ngoài**, giúp tốc độ load trang là 0ms và không bao giờ bị lỗi đứt link audio.
* **HTML5 Canvas 2D Particle Engine**:
  * Vòng quay may mắn render trên canvas với đường cong giảm tốc `Cubic Ease-Out` chân thực.
  * Hiệu ứng pháo hoa giấy Confetti 150 hạt đa sắc bung xõa rực rỡ khi trúng thưởng.

---

## 🌐 4. Hướng Dẫn Triển Khai / Đưa Lên Mạng (Deployment)

### Phương án 1: Gắn vào tên miền chính thức của Eureka (Khuyên dùng)
* **Subdomain:** Cấu hình DNS trỏ subdomain `awards.erktransport.com` hoặc `sukien.erktransport.com` về hosting/server chứa thư mục này.
* **Subfolder:** Copy toàn bộ nội dung thư mục này vào thư mục con `/awards/` hoặc `/su-kien-2026/` trên hosting hiện tại của `erktransport.com`.

### Phương án 2: Xuất bản tức thì qua Vercel / Netlify / Cloudflare Pages (30 giây)
1. Truy cập [vercel.com](https://vercel.com) hoặc [netlify.com](https://netlify.com).
2. Kéo thả (Drag & Drop) cả thư mục `Landing-Page-Project-Eureka-Customer-Awards-2026` vào khu vực Deploy.
3. Nhận ngay link trực tuyến miễn phí có SSL (HTTPS) trong 30 giây để gửi cho khách hàng và đối tác!

---

## 📞 5. Hỗ Trợ & Bản Quyền
* **Chủ quản chiến dịch:** Phòng Marketing & Phòng Vận Hành — Công ty TNHH Thương mại và Xuất nhập khẩu Eureka.
* **Website:** [https://www.erktransport.com/](https://www.erktransport.com/)
* **Hotline kỹ thuật & tiếp nhận đơn:** 0898.586.622
* **Email:** support@erktransport.com
