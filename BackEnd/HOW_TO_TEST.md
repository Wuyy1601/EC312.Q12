# ✅ HƯỚNG DẪN TEST API - ĐƠN GIẢN

## Bước 1: Start Server

Mở terminal và chạy:

```bash
npm run dev
```

**Để server chạy, KHÔNG TẮT terminal này!**

---

## Bước 2: Test với Postman (KHUYẾN NGHỊ)

1. Mở Postman
2. Click "Import"
3. Chọn file `postman-collection.json`
4. Chạy các request theo thứ tự:
   - Register User
   - Login
   - Get Profile
   - Update Profile

---

## Bước 3: Test bằng Terminal (Cần 2 terminal)

### Terminal 1 (Server - Để chạy):

```bash
npm run dev
```

### Terminal 2 (Test - Mở terminal mới):

**Test 1: Health Check**

```bash
curl http://localhost:5001/health
```

**Test 2: Register**

```bash
curl -X POST http://localhost:5001/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test123@example.com\",\"password\":\"123456\",\"phone\":\"0901234567\"}"
```

**Lưu token từ response để dùng cho test tiếp**

**Test 3: Login**

```bash
curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test123@example.com\",\"password\":\"123456\"}"
```

**Test 4: Get Profile (Thay YOUR_TOKEN)**

```bash
curl -X GET http://localhost:5001/api/auth/profile -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Lỗi thường gặp

### "Connection refused" hoặc "ECONNREFUSED"

→ **Giải pháp:** Server chưa chạy. Mở terminal và chạy `npm run dev`

### "Port 5001 already in use"

→ **Giải pháp:**

```bash
# Tìm process đang dùng port
netstat -ano | findstr :5001

# Kill process (thay PID)
taskkill /PID <PID> /F
```

### MongoDB connection failed

→ **Giải pháp:**

```bash
# Start MongoDB
net start MongoDB
```

---

## 📹 Video Demo (Nên làm theo)

**Với Postman:**

1. Server đang chạy ở terminal 1
2. Mở Postman
3. Import file `postman-collection.json`
4. Click "Register User" → Send
5. Thấy token trong response (tự động lưu vào environment)
6. Click "Get Profile" → Send (token tự động thêm)
7. Thành công! ✅

**ĐƠN GIẢN VẬY THÔI!** 😊
