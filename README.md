<p align="center">
  <img src="FrontEnd/FrontEnd/src/assets/logo/logo.png" alt="Giftnity Logo" width="200"/>
</p>

<h1 align="center">🎁 GIFTNITY - Hệ Thống Kinh Doanh Quà Tặng Trực Tuyến</h1>

<p align="center">
  <b>Đồ án môn học: Thiết kế Hệ thống Thương mại điện tử (EC312)</b><br/>
  <i>Đại học Công nghệ Thông tin - ĐHQG TP.HCM</i>
</p>

<p align="center">
  <a href="#tổng-quan">Tổng quan</a> •
  <a href="#tính-năng">Tính năng</a> •
  <a href="#công-nghệ">Công nghệ</a> •
  <a href="#cài-đặt">Cài đặt</a> •
  <a href="#thành-viên">Thành viên</a>
</p>

---

## 📋 Tổng quan

**Giftnity** là nền tảng thương mại điện tử chuyên về quà tặng, tích hợp **AI tư vấn thông minh** giúp người dùng tìm được món quà phù hợp nhất dựa trên tính cách người nhận, dịp lễ và ngân sách.

### 🎯 Mục tiêu
- Giải quyết bài toán **"khó chọn quà"** bằng trí tuệ nhân tạo
- Cá nhân hóa trải nghiệm mua sắm với lịch sự kiện và nhắc nhở
- Tích hợp thanh toán online an toàn (VNPay, Momo)

### 📂 Tài liệu đồ án
📁 **[Google Drive - Toàn bộ tài liệu](https://drive.google.com/drive/folders/1x7iCIz5k_pZoIEY5iOAM-V4n1oQAmp5Z)**

---

## ✨ Tính năng

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

## 🛠️ Công nghệ

### Tech Stack (MERN)
| Layer | Technology |
|-------|------------|
| **Frontend** | React.js (Vite), CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini API, LangChain |
| **Payment** | VNPay, Momo (Sandbox) |
| **Calendar** | Google Calendar API |
| **Email** | Nodemailer (Gmail SMTP) |

### Cấu trúc thư mục
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
│   │   │   ├── review/      # Đánh giá
│   │   │   └── notification/# Email
│   │   └── middlewares/
│   └── .env
│
├── FrontEnd/FrontEnd/       # React Vite App
│   ├── src/
│   │   ├── pages/           # Các trang
│   │   ├── components/      # Components tái sử dụng
│   │   ├── context/         # React Context (Cart, Auth)
│   │   └── assets/
│   └── .env
│
└── README.md
```

---

## 🚀 Cài đặt

### Yêu cầu
- Node.js >= 18.x
- MongoDB 
- Google Cloud Console (Calendar API, OAuth)
- VNPay/Momo Sandbox credentials
- Webhook SePay

### 1. Clone repository
```bash
git clone https://github.com/Wuyy1601/EC312.Q12.git
cd EC312.Q12
```

### 2. Cấu hình Backend
```bash
cd BackEnd
npm install
```

Tạo file `.env`:
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

# Email (Nodemailer)
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

Chạy server:
```bash
npm run dev
```

### 3. Cấu hình Frontend
```bash
cd FrontEnd/FrontEnd
npm install
```

Tạo file `.env`:
```env
VITE_API_URL=http://localhost:5001
```

Chạy app:
```bash
npm run dev
```

### 4. Truy cập
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001

---

## 👥 Thành viên - Nhóm 3

| STT | Họ và Tên | MSSV |
|:---:|-----------|------|
| 1 | **Thái Hoàng Hải Đăng** | 23520236 |
| 2 | Lê Khánh Duy | 23520367 |
| 3 | Đồng Khánh Huy | 23520605 |
| 4 | Võ Thiên Lý | 23520909 |
| 5 | Hồ Tuyết Sương | 23521366 |

**Giảng viên hướng dẫn:** ThS. Trịnh Trọng Tín

---

## 📄 License

Đồ án phục vụ mục đích học tập tại **Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM**.

---

<p align="center">
  Made with ❤️ by <b>Nhóm 3 - EC312.Q12</b>
</p>
