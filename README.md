<p align="center">
  <img src="FrontEnd/FrontEnd/src/assets/logo/logo.png" alt="Giftnity Logo" width="200"/>
</p>

<h1 align="center">🎁 GIFTNITY - Hệ Thống Kinh Doanh Quà Tặng Trực Tuyến</h1>

<p align="center">
  <b>Đồ án môn học: Thiết kế Hệ thống Thương mại điện tử (EC312)</b><br/>
  <i>Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM</i><br/>
  <i>Khoa Hệ thống Thông tin</i>
</p>

---

## 👥 Thông tin nhóm

**Giảng viên hướng dẫn:** ThS. Trịnh Trọng Tín

**Sinh viên thực hiện - Nhóm 3:**

| STT | Họ và Tên | MSSV |
|:---:|-----------|------|
| 1 | **Thái Hoàng Hải Đăng** | 23520236 |
| 2 | Lê Khánh Duy | 23520367 |
| 3 | Đồng Khánh Huy | 23520605 |
| 4 | Võ Thiên Lý | 23520909 |
| 5 | Hồ Tuyết Sương | 23521366 |

📁 **[Google Drive - Tài liệu đồ án](https://drive.google.com/drive/folders/1x7iCIz5k_pZoIEY5iOAM-V4n1oQAmp5Z)**

---

## 📋 Tổng quan

**Giftnity** là nền tảng thương mại điện tử chuyên về quà tặng, tích hợp **AI tư vấn thông minh** giúp người dùng tìm được món quà phù hợp nhất dựa trên tính cách người nhận, dịp lễ và ngân sách.

### 🎯 Mục tiêu
- Giải quyết bài toán **"khó chọn quà"** bằng trí tuệ nhân tạo
- Cá nhân hóa trải nghiệm mua sắm với lịch sự kiện và nhắc nhở
- Tích hợp thanh toán online an toàn (VNPay, Momo)

---

## ✨ Tính năng chính

| Module | Mô tả |
|--------|-------|
| 🔐 **Xác thực** | Đăng ký, Đăng nhập, Google OAuth, Quên mật khẩu |
| 🤖 **AI Tư vấn (Spirit)** | Chat với AI để nhận gợi ý quà tặng thông minh |
| 📅 **Lịch Sự kiện** | Quản lý sinh nhật, kỷ niệm, đồng bộ Google Calendar |
| 🛒 **Mua sắm** | Danh mục sản phẩm, Combo/Bundle, Giỏ hàng real-time |
| 💳 **Thanh toán** | VNPay, Momo, Chuyển khoản (Sepay), COD |
| ⭐ **Đánh giá** | Rating & Review sản phẩm |
| 💌 **Thiệp 3D** | Tùy chỉnh thiệp điện tử đi kèm quà |
| 📧 **Thông báo** | Email xác nhận đơn hàng, nhắc nhở sự kiện |
| 🛠️ **Quản trị** | Dashboard Admin quản lý sản phẩm, đơn hàng, người dùng |

---

## 🛠️ Công nghệ sử dụng

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js (Vite), CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini API, LangChain |
| **Payment** | VNPay, Momo (Sandbox) |
| **Calendar** | Google Calendar API |
| **Email** | Nodemailer (Gmail SMTP) |

---

## 🚀 Hướng dẫn cài đặt

### Bước 1: Clone repository

```bash
git clone https://github.com/Wuyy1601/EC312.Q12.git
cd EC312.Q12
```

### Bước 2: Cài đặt Backend

```bash
cd BackEnd
npm install
```

### Bước 3: Cấu hình file `.env` cho Backend

Tạo file `BackEnd/.env` với nội dung:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/giftnity

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password

# VNPay
VNPAY_TMN_CODE=your_vnpay_code
VNPAY_HASH_SECRET=your_vnpay_secret

# Momo
MOMO_PARTNER_CODE=your_momo_code
MOMO_ACCESS_KEY=your_momo_access
MOMO_SECRET_KEY=your_momo_secret
```

### Bước 4: Chạy Backend

```bash
npm run dev
```
> Backend sẽ chạy tại: http://localhost:5001

### Bước 5: Cài đặt Frontend

Mở terminal mới:

```bash
cd FrontEnd/FrontEnd
npm install
```

### Bước 6: Cấu hình file `.env` cho Frontend

Tạo file `FrontEnd/FrontEnd/.env`:

```env
VITE_API_URL=http://localhost:5001
```

### Bước 7: Chạy Frontend

```bash
npm run dev
```
> Frontend sẽ chạy tại: http://localhost:5173

### Bước 8: Truy cập ứng dụng

Mở trình duyệt và truy cập: **http://localhost:5173**

---

## � Cấu trúc thư mục

```
EC312.Q12/
├── BackEnd/                 # Node.js Express Server
│   ├── src/
│   │   ├── services/        # Các module nghiệp vụ
│   │   │   ├── auth/        # Xác thực
│   │   │   ├── product/     # Sản phẩm
│   │   │   ├── order/       # Đơn hàng
│   │   │   ├── calendar/    # Lịch sự kiện
│   │   │   ├── spirit/      # AI Tư vấn
│   │   │   └── notification/# Email
│   │   └── middlewares/
│   └── .env
│
├── FrontEnd/FrontEnd/       # React Vite App
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── context/
│   └── .env
│
└── README.md
```

---

## 📄 License

Đồ án phục vụ mục đích học tập tại **Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM**.

---

<p align="center">
  Made with ❤️ by <b>Nhóm 3 - EC312.Q12</b><br/>
  <i>TP. Hồ Chí Minh, ngày 24 tháng 12 năm 2025</i>
</p>