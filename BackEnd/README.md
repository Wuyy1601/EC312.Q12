# Gift Shop E-Commerce Backend

Backend API cho hệ thống thương mại điện tử cửa hàng quà tặng.

## 🚀 Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM cho MongoDB
- **dotenv** - Quản lý biến môi trường
- **cors** - Cross-Origin Resource Sharing
- **nodemon** - Auto-restart server khi development

## 📋 Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB >= 4.x (local hoặc MongoDB Atlas)
- npm hoặc yarn

## ⚙️ Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd BackEnd
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/gift_shop_db
JWT_SECRET=your_jwt_secret_key_here
```

**Lưu ý:** 
- Nếu sử dụng MongoDB Atlas, thay `MONGODB_URI` bằng connection string của bạn
- Đổi `JWT_SECRET` thành một chuỗi bảo mật ngẫu nhiên

### 3. Khởi động MongoDB

**Nếu dùng MongoDB local:**

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Nếu dùng MongoDB Atlas:**
- Tạo cluster miễn phí tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Lấy connection string và cập nhật vào `.env`

### 4. Chạy server

```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5001`

## 🧪 Kiểm tra API

Chi tiết đầy đủ về testing xem tại: [API_TESTING.md](./API_TESTING.md)

### Quick Test

**1. Health Check:**
```bash
curl http://localhost:5001/health
```

**2. Register:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456","phone":"0901234567"}'
```

**3. Login:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Import Postman Collection

- **Postman**: Import `postman-collection.json`
- Hoặc chạy test script: `node test-api.js`

## 📁 Cấu trúc dự án

```
BackEnd/
├── src/
│   ├── config/
│   │   └── database.js      # Cấu hình MongoDB connection
│   ├── controllers/         # (TODO) Business logic
│   ├── models/              # (TODO) Mongoose schemas
│   ├── routes/              # (TODO) API routes
│   ├── middlewares/         # (TODO) Custom middleware
│   └── server.js            # Entry point
├── .env                     # Environment variables (không commit)
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🗺️ Roadmap - Các tính năng cần phát triển

### Phase 1: Xác thực & Người dùng ✅ (Hoàn thành)
- [x] Setup Express + MongoDB
- [x] User Model (Customer, Admin)
- [x] Authentication (Register, Login, JWT)
- [x] Authorization middleware
- [ ] Password reset/forgot (TODO)

### Phase 2: Quản lý sản phẩm
- [ ] Product Model (name, description, price, images, category, stock)
- [ ] CRUD operations cho products
- [ ] Upload hình ảnh sản phẩm
- [ ] Search & filter products
- [ ] Product categories

### Phase 3: Giỏ hàng & Wishlist
- [ ] Cart Model
- [ ] Add/Remove/Update cart items
- [ ] Wishlist functionality
- [ ] Cart persistence

### Phase 4: Đơn hàng & Thanh toán
- [ ] Order Model
- [ ] Checkout process
- [ ] Payment integration (VNPay, MoMo, hoặc Stripe)
- [ ] Order status tracking
- [ ] Email notifications

### Phase 5: Admin Panel
- [ ] Admin dashboard statistics
- [ ] User management
- [ ] Product management
- [ ] Order management
- [ ] Revenue reports

### Phase 6: Tính năng nâng cao
- [ ] Reviews & Ratings
- [ ] Discount codes/Coupons
- [ ] Shipping calculation
- [ ] Multi-language support
- [ ] Gift wrapping options
- [ ] Personalization options

## 📝 API Endpoints

### Authentication ✅ (Hoàn thành)
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất (Protected)
- `GET /api/auth/profile` - Lấy thông tin user (Protected)
- `PUT /api/auth/profile` - Cập nhật thông tin user (Protected)

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm vào giỏ
- `PUT /api/cart/:id` - Cập nhật số lượng
- `DELETE /api/cart/:id` - Xóa khỏi giỏ

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/:id` - Cập nhật trạng thái (Admin)

## 🛠️ Scripts

```bash
npm run dev      # Chạy server với nodemon (development)
npm start        # Chạy server (production)
npm test         # Chạy tests (TODO)
```

## 🤝 Đóng góp

Đây là dự án nhóm. Mọi thành viên vui lòng:
1. Tạo branch mới cho feature: `git checkout -b feature/ten-feature`
2. Commit thay đổi: `git commit -m 'Add some feature'`
3. Push lên branch: `git push origin feature/ten-feature`
4. Tạo Pull Request

## 📧 Liên hệ

- Repository: [EC312.Q12](https://github.com/Wuyy1601/EC312.Q12)
- Nhóm phát triển: [Thêm tên thành viên]

## 📄 License

ISC
