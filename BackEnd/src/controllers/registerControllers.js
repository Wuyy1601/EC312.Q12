import User from "../models/User.js";
import { hashPassword } from "../middleware/passwordHash.js"; // Import hàm hash password
import { generateToken } from "../utils/jwt.js"; // Import hàm tạo JWT token

// Hàm xử lý đăng ký user mới
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Kiểm tra xem có đủ thông tin không
    if (!username || !email || !password) {
      return res.status(400).json({
        // 400 = Bad Request (yêu cầu không hợp lệ)
        success: false,
        message: "Vui lòng nhập đầy đủ username, email và password",
      });
    }

    // Kiểm tra độ dài password (tối thiểu 6 ký tự)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password phải có ít nhất 6 ký tự",
      });
    }
    // Kiểm tra email hoặc username đã tồn tại trong database chưa
    // $or: tìm user có email HOẶC username trùng
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    // Nếu đã tồn tại → từ chối đăng ký
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc username đã được sử dụng",
      });
    }

    const hashedPassword = await hashPassword(password);

    // Lưu user mới vào database với password đã hash
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword, // Lưu password đã hash
    });

    // Tạo JWT token ngay sau khi đăng ký
    // (để user không cần login lại, UX tốt hơn)
    const token = generateToken({
      id: newUser._id, // ID của user mới tạo (ObjectId từ MongoDB)
      email: newUser.email,
      username: newUser.username,
    });
    // Token có dạng: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M..."
    // Client sẽ lưu token này (localStorage/cookie) và gửi kèm trong mỗi request sau

    res.status(201).json({
      // 201 = Created (đã tạo resource mới thành công)
      success: true,
      message: "Đăng ký thành công",
      token: token, // ← Token để client lưu lại
      data: {
        // Thông tin user (KHÔNG bao gồm password để bảo mật)
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt, // Thời gian tạo tài khoản
      },
    });
  } catch (error) {
    // Bắt lỗi bất ngờ (VD: database ngắt kết nối, lỗi mạng,...)
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({
      // 500 = Internal Server Error (lỗi server)
      success: false,
      message: "Lỗi server khi đăng ký",
      error: error.message,
    });
  }
};

export default { registerUser };
