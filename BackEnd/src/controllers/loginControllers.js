import User from "../models/User.js";
import { comparePassword } from "../middleware/passwordHash.js"; // Import hàm so sánh password
import { generateToken } from "../utils/jwt.js"; // Import hàm tạo JWT token

// Hàm xử lý đăng nhập
export const loginUser = async (req, res) => {
  try {
    // Lấy email và password từ body request (client gửi lên)
    const { email, password } = req.body;

    // Kiểm tra xem user có nhập đủ thông tin không
    if (!email || !password) {
      return res.status(400).json({
        // 400 = Bad Request (yêu cầu không hợp lệ)
        success: false,
        message: "Vui lòng nhập email và password",
      });
    }

    // Tìm user trong database theo email
    // .select("+password") vì schema có select: false
    // Phải gọi rõ ràng để lấy password (vì cần so sánh)
    const user = await User.findOne({ email }).select("+password");

    // Nếu không tìm thấy user → email không tồn tại
    if (!user) {
      return res.status(401).json({
        // 401 = Unauthorized (chưa xác thực)
        success: false,
        message: "Email hoặc password không đúng",
        // Không nói cụ thể cái nào sai để tăng bảo mật
        // (tránh hacker biết email có tồn tại hay không)
      });
    }

    // So sánh password user nhập với password đã hash trong DB
    const isPasswordMatch = await comparePassword(password, user.password);

    // Nếu password không khớp
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
    }

    // Đăng nhập thành công → Tạo JWT token
    // Token chứa thông tin user (payload)
    const token = generateToken({
      id: user._id, // ID của user trong database (ObjectId)
      email: user.email,
      username: user.username,
    });

    res.status(200).json({
      // 200 = OK (thành công)
      success: true,
      message: "Đăng nhập thành công",
      token: token, // ← Token để client lưu lại (localStorage hoặc cookie)
      // Client sẽ gửi kèm token này trong header của mỗi request sau:
      data: {
        // Thông tin user (KHÔNG bao gồm password để bảo mật)
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // ========== XỬ LÝ LỖI ==========

    // Bắt lỗi bất ngờ (VD: database ngắt kết nối, lỗi mạng,...)
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      // 500 = Internal Server Error (lỗi server)
      success: false,
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
  }
};

export default { loginUser };
