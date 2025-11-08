# 🗄️ HƯỚNG DẪN SETUP DATABASE CHO TEAM

## Vấn đề

Khi làm việc nhóm, mỗi người có máy riêng. Nếu dùng `localhost`, chỉ có người có MongoDB local mới chạy được.

## 3 Giải pháp

---

## ✅ Option 1: Mỗi người dùng MongoDB Local (Đơn giản)

### Cài đặt cho mỗi thành viên:

**Windows:**

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Cài đặt (chọn "Complete")
3. MongoDB Compass sẽ được cài kèm (GUI tool)
4. Start MongoDB service: `net start MongoDB`

**macOS:**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**

```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

### Sử dụng:

File `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/gift_shop_db
```

**Ưu điểm:**

- ✅ Free
- ✅ Nhanh, không cần internet
- ✅ Mỗi người dev độc lập

**Nhược điểm:**

- ❌ Data không đồng bộ (mỗi người có DB riêng)
- ❌ Phải cài MongoDB trên mỗi máy
- ❌ Không test được tính năng đồng thời

---

## ⭐ Option 2: MongoDB Atlas (Cloud) - KHUYẾN NGHỊ

Dùng database chung trên cloud, cả team kết nối vào 1 DB.

### Bước 1: Tạo MongoDB Atlas (1 người làm, share cho cả team)

1. **Đăng ký tài khoản:**

   - Truy cập: https://www.mongodb.com/cloud/atlas/register
   - Đăng ký miễn phí (có thể dùng Google account)

2. **Tạo Cluster:**

   - Click "Build a Database"
   - Chọn **FREE** (M0 Sandbox) - 512MB
   - Chọn region gần VN nhất (Singapore hoặc Mumbai)
   - Cluster Name: `gift-shop-cluster`
   - Click "Create"

3. **Tạo Database User:**

   - Security → Database Access → Add New Database User
   - Authentication Method: Password
   - Username: `giftshop_user`
   - Password: Tạo password mạnh (lưu lại)
   - Database User Privileges: **Read and write to any database**
   - Click "Add User"

4. **Whitelist IP Address:**

   - Security → Network Access → Add IP Address
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ CHỈ dùng cho development, production cần restrict
   - Click "Confirm"

5. **Lấy Connection String:**
   - Overview → Connect → Connect your application
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy connection string, có dạng:
     ```
     mongodb+srv://giftshop_user:<password>@gift-shop-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Thay `<password>` bằng password thật

### Bước 2: Cấu hình cho cả team

**Người tạo Atlas:**

1. Share connection string cho team (qua Messenger, Zalo, etc.)
2. ⚠️ **KHÔNG commit file `.env`** vào Git
3. Share qua chat riêng hoặc document riêng

**Các thành viên khác:**

1. Clone repo
2. Copy `.env.example` thành `.env`
3. Paste connection string vào:
   ```env
   MONGODB_URI=mongodb+srv://giftshop_user:YOUR_PASSWORD@gift-shop-cluster.xxxxx.mongodb.net/gift_shop_db?retryWrites=true&w=majority
   ```
4. Run `npm run dev`
5. Xong! ✅

### Kiểm tra kết nối:

```bash
npm run dev
```

Nếu thấy:

```
Server is running on port 5001
MongoDB Connected: gift-shop-cluster-shard-00-00.xxxxx.mongodb.net
```

→ **Thành công!** 🎉

**Ưu điểm:**

- ✅ Cả team dùng chung 1 database
- ✅ Data đồng bộ realtime
- ✅ Không cần cài MongoDB local
- ✅ Free tier đủ dùng cho development
- ✅ Có monitoring và backup
- ✅ Test được tính năng đồng thời

**Nhược điểm:**

- ❌ Cần internet
- ❌ Chậm hơn local một chút
- ❌ Free tier giới hạn 512MB

---

## 🔒 Option 3: MongoDB trên máy 1 người, expose ra ngoài (Không khuyến nghị)

Dùng MongoDB của 1 người, các người khác connect vào qua mạng.

**Cách làm:**

Máy có MongoDB:

1. Edit MongoDB config để listen trên tất cả IP
2. Mở port 27017 trên firewall
3. Lấy IP của máy (VD: 192.168.1.100)
4. Share IP cho team

Máy khác:

```env
MONGODB_URI=mongodb://192.168.1.100:27017/gift_shop_db
```

**Nhược điểm:**

- ❌ Không bảo mật
- ❌ Máy host phải bật liên tục
- ❌ Chỉ work khi cùng mạng LAN/WiFi
- ❌ Không work khi làm remote

---

## 📊 So sánh

| Tiêu chí        | Local MongoDB | MongoDB Atlas | Expose Local |
| --------------- | ------------- | ------------- | ------------ |
| **Setup**       | Khó (mỗi máy) | Dễ (1 lần)    | Trung bình   |
| **Cost**        | Free          | Free (512MB)  | Free         |
| **Data sync**   | ❌            | ✅            | ✅           |
| **Internet**    | Không cần     | Cần           | Không cần    |
| **Speed**       | Rất nhanh     | Trung bình    | Nhanh        |
| **Security**    | ✅            | ✅            | ❌           |
| **Remote work** | ❌            | ✅            | ❌           |

---

## 🎯 KHUYẾN NGHỊ CHO TEAM

### Giai đoạn Dev ban đầu (Phase 1-2):

→ **Dùng MongoDB Atlas**

**Lý do:**

- Cả team dùng chung data
- Dễ setup, 1 người tạo, share connection string
- Test được tính năng realtime
- Không cần cài gì cả

### Khi deploy production:

→ **MongoDB Atlas** (Paid plan) hoặc cloud provider khác

---

## 🚀 QUICK START - Setup MongoDB Atlas (5 phút)

**Người 1 (Team lead) làm:**

1. Đăng ký: https://www.mongodb.com/cloud/atlas/register
2. Create Free Cluster (chọn Singapore)
3. Create User: `giftshop_user` / `password123` (đổi password mạnh hơn)
4. Network Access → Allow 0.0.0.0/0
5. Connect → Connect your application → Copy connection string
6. Share connection string cho team (qua chat)

**Cả team:**

1. Clone repo
2. Create `.env` file:
   ```env
   PORT=5001
   MONGODB_URI=mongodb+srv://giftshop_user:password123@cluster.xxxxx.mongodb.net/gift_shop_db?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret
   ```
3. `npm install`
4. `npm run dev`
5. Done! ✅

---

## ⚠️ LƯU Ý BẢO MẬT

1. **KHÔNG commit file `.env`** vào Git

   - File `.gitignore` đã có `.env`
   - Kiểm tra: `git status` không thấy `.env`

2. **Đổi password mạnh** cho MongoDB user

3. **Production:** Restrict IP thay vì 0.0.0.0/0

4. **Rotate credentials** định kỳ

---

## 🆘 TROUBLESHOOTING

### Lỗi: "MongoNetworkError: failed to connect"

→ Kiểm tra:

- Internet có ổn không?
- Connection string đúng không?
- IP đã được whitelist chưa? (0.0.0.0/0)

### Lỗi: "Authentication failed"

→ Kiểm tra:

- Username/password đúng không?
- Password có ký tự đặc biệt? Cần encode (VD: `@` → `%40`)

### Lỗi: "Database not found"

→ Bình thường! Database sẽ tự tạo khi insert data lần đầu.

---

**🎉 Với MongoDB Atlas, cả team có thể làm việc đồng bộ ngay! 🎉**
