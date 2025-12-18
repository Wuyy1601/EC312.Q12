import mongoose from "mongoose";
import { userConnection } from "../config/database.js";

// Định nghĩa schema (cấu trúc dữ liệu) cho User
const userSchema = new mongoose.Schema(
  {
    // Tên đăng nhập
    username: {
      type: String, // Kiểu dữ liệu: chuỗi
      required: true, // Bắt buộc phải có
      unique: true, // Không được trùng
      trim: true, // Tự động xóa khoảng trắng đầu/cuối
    },
    // Mật khẩu (sẽ được hash bởi middleware trước khi lưu)
    password: {
      type: String,
      required: true,
      select: false, // Không tự động trả về password khi query (bảo mật)
      // Nếu muốn lấy password phải dùng: .select("+password")
    },
    // Email
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Chỉ được phép là "user" hoặc "admin"
      default: "user",        // Mặc định là "user"
    },
  },
  {
    // Tự động thêm 2 field:
    // - createdAt: thời gian tạo
    // - updatedAt: thời gian cập nhật gần nhất
    timestamps: true,
  }
);

// Tạo Model từ schema
// Dùng userConnection để lưu vào database "users"
// (không dùng mongoose.model vì cần kết nối riêng cho nhiều DB)

const User = userConnection.models.User || userConnection.model("User", userSchema);

export default User;