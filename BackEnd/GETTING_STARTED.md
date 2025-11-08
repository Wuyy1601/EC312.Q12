# 🚀 HƯỚNG DẪN BẮT ĐẦU DỰ ÁN GIFT SHOP E-COMMERCE

## 📌 Tổng quan dự án

Dự án này là một hệ thống thương mại điện tử cho cửa hàng quà tặng, bao gồm:
- Backend API (Node.js + Express + MongoDB)
- Authentication & Authorization (JWT)
- Quản lý sản phẩm, đơn hàng, người dùng
- Thanh toán trực tuyến

## ✅ Đã hoàn thành (Phase 1)

### 1. Cơ sở hạ tầng
- ✅ Express server setup
- ✅ MongoDB connection với Mongoose
- ✅ Environment variables (.env)
- ✅ CORS và JSON middleware
- ✅ Error handling middleware
- ✅ Project structure

### 2. Authentication System
- ✅ User Model với validation
- ✅ Password hashing (bcrypt)
- ✅ JWT token generation
- ✅ Register endpoint
- ✅ Login endpoint
- ✅ Get profile (protected)
- ✅ Update profile (protected)
- ✅ Logout endpoint
- ✅ Auth middleware (JWT verification)
- ✅ Role-based authorization

### 3. Testing & Documentation
- ✅ Postman collection
- ✅ API testing guide
- ✅ README với roadmap chi tiết

## 📂 Cấu trúc dự án hiện tại

```
BackEnd/
├── src/
│   ├── config/
│   │   └── database.js          ✅ MongoDB connection
│   ├── controllers/
│   │   └── auth.controller.js   ✅ Auth logic
│   ├── models/
│   │   └── User.js              ✅ User schema
│   ├── routes/
│   │   └── auth.routes.js       ✅ Auth endpoints
│   ├── middlewares/
│   │   ├── auth.middleware.js   ✅ JWT verify
│   │   └── errorHandler.js      ✅ Global error handler
│   ├── utils/
│   │   └── helpers.js           ✅ Helper functions
│   └── server.js                ✅ Entry point
├── .env                         ✅ Environment config
├── .env.example                 ✅ Env template
├── .gitignore                   ✅ Git ignore rules
├── package.json                 ✅ Dependencies
├── README.md                    ✅ Full documentation
├── API_TESTING.md               ✅ API test guide
├── postman-collection.json      ✅ Postman tests
└── test-api.js                  ✅ Node test script
```

## 🎯 Các bước tiếp theo (Phase 2+)

### Phase 2: Product Management (Ưu tiên cao)

#### 2.1. Product Model
Tạo `src/models/Product.js`:
```javascript
{
  name: String,
  description: String,
  price: Number,
  salePrice: Number,
  images: [String],
  category: ObjectId,
  stock: Number,
  sold: Number,
  tags: [String],
  rating: Number,
  reviews: [ObjectId]
}
```

#### 2.2. Category Model
Tạo `src/models/Category.js`:
```javascript
{
  name: String,
  slug: String,
  description: String,
  image: String,
  parent: ObjectId
}
```

#### 2.3. Product APIs
Tạo các endpoints:
- `GET /api/products` - Lấy danh sách (pagination, filter, sort)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin only)
- `PUT /api/products/:id` - Cập nhật (Admin only)
- `DELETE /api/products/:id` - Xóa (Admin only)
- `GET /api/products/search` - Tìm kiếm

### Phase 3: Shopping Cart

#### 3.1. Cart Model
Tạo `src/models/Cart.js`:
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalPrice: Number
}
```

#### 3.2. Cart APIs
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm vào giỏ
- `PUT /api/cart/:itemId` - Cập nhật số lượng
- `DELETE /api/cart/:itemId` - Xóa khỏi giỏ
- `DELETE /api/cart` - Xóa toàn bộ giỏ

### Phase 4: Order Management

#### 4.1. Order Model
Tạo `src/models/Order.js`:
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number
  }],
  shippingAddress: Object,
  paymentMethod: String,
  paymentResult: Object,
  totalPrice: Number,
  status: String, // pending, processing, shipped, delivered
  deliveredAt: Date
}
```

#### 4.2. Order APIs
- `GET /api/orders` - Lấy đơn hàng của user
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/:id/pay` - Cập nhật thanh toán
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin)

### Phase 5: Payment Integration
- VNPay integration
- MoMo integration
- Hoặc Stripe/PayPal (international)

### Phase 6: Reviews & Ratings
```javascript
{
  user: ObjectId,
  product: ObjectId,
  rating: Number (1-5),
  comment: String,
  images: [String]
}
```

### Phase 7: Admin Dashboard
- Thống kê doanh thu
- Quản lý đơn hàng
- Quản lý sản phẩm
- Quản lý user

### Phase 8: Advanced Features
- Wishlist
- Discount codes/Coupons
- Email notifications
- Product recommendations
- Gift wrapping
- Gift messages

## 🛠️ Công cụ cần thiết

### 1. Database
- MongoDB Local: [Download](https://www.mongodb.com/try/download/community)
- MongoDB Compass: GUI tool để xem database
- Hoặc MongoDB Atlas: Free cloud database

### 2. API Testing
- Postman: [Download](https://www.postman.com/downloads/)
- Hoặc dùng `curl` command line

### 3. Git
```bash
# Clone repo
git clone https://github.com/Wuyy1601/EC312.Q12.git

# Tạo branch mới cho feature
git checkout -b feature/product-management

# Commit và push
git add .
git commit -m "Add product management"
git push origin feature/product-management
```

## 📚 Tài nguyên học tập

### Node.js & Express
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### MongoDB & Mongoose
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/)

### Authentication
- [JWT.io](https://jwt.io/)
- [Passport.js](http://www.passportjs.org/)

### REST API Design
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)

## 🎓 Tips cho team

### 1. Phân chia công việc
- **Thành viên 1**: Product Management (Models, Controllers, Routes)
- **Thành viên 2**: Cart & Wishlist
- **Thành viên 3**: Order Management
- **Thành viên 4**: Payment Integration
- **Cả nhóm**: Code review, testing, documentation

### 2. Workflow
1. Chọn 1 feature từ roadmap
2. Tạo branch mới
3. Implement feature
4. Test kỹ với Postman/Thunder Client
5. Commit với message rõ ràng
6. Push và tạo Pull Request
7. Team review
8. Merge vào main

### 3. Coding Standards
- Dùng ESLint để format code
- Viết comment tiếng Việt cho dễ hiểu
- Tất cả API response phải có `success` flag
- Luôn handle errors properly
- Validate input ở controller level

### 4. Testing
- Test mỗi endpoint sau khi tạo
- Test cả success và error cases
- Document test cases trong API_TESTING.md

### 5. Security
- Không commit file .env
- Validate tất cả user input
- Sử dụng HTTPS khi production
- Rate limiting cho APIs
- Sanitize data trước khi lưu DB

## 🚦 Bắt đầu làm việc NGAY

### Option 1: Tiếp tục với Product Management
```bash
# Tạo branch mới
git checkout -b feature/product-management

# Tạo các file cần thiết
mkdir -p src/models
touch src/models/Product.js
touch src/models/Category.js
touch src/controllers/product.controller.js
touch src/routes/product.routes.js

# Bắt đầu code!
```

### Option 2: Làm Cart Management
```bash
# Tạo branch mới
git checkout -b feature/cart-management

# Tạo các file
touch src/models/Cart.js
touch src/controllers/cart.controller.js
touch src/routes/cart.routes.js
```

### Option 3: Setup Frontend
- React + Vite
- Next.js
- Vue.js
- Hoặc HTML/CSS/Vanilla JS đơn giản

## 📞 Hỗ trợ

Nếu gặp lỗi hoặc cần giúp đỡ:
1. Check log ở terminal
2. Google error message
3. Xem documentation
4. Hỏi trong group chat
5. Tạo issue trên GitHub

---

**🎉 Chúc team làm việc hiệu quả! Let's build an awesome e-commerce platform! 🎉**
