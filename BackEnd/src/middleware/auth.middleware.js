import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

/**
 * Middleware xác thực JWT token
 * Bảo vệ các route chỉ cho phép user đã đăng nhập truy cập
 *
 * Cách dùng:
 * router.get("/profile", authMiddleware, getProfile);
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Lấy Authorization header từ request
    // VD: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;

    // Kiểm tra xem có gửi token không
    // authHeader phải có định dạng: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        // 401 = Unauthorized (chưa xác thực)
        success: false,
        message: "Vui lòng đăng nhập (Không có token)",
      });
    }

    // Tách token ra khỏi chữ "Bearer "
    // authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    // split(" ") → ["Bearer", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."]
    // [1] → lấy phần tử thứ 2 (token)
    const token = authHeader.split(" ")[1];

    // Verify token bằng SECRET_KEY
    // Nếu token hợp lệ → trả về payload (dữ liệu đã mã hóa trong token)
    // Nếu token không hợp lệ hoặc hết hạn → trả về null
    const decoded = verifyToken(token);

    // Nếu token không hợp lệ
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // decoded chứa { id, email, username } (payload từ token)
    // Lấy thông tin user từ database theo ID
    // .select("-password") → không lấy password
    const user = await User.findById(decoded.id).select("-password");

    // Nếu không tìm thấy user (VD: user đã bị xóa)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    // Gắn thông tin user vào req.user
    // Controller sau này có thể dùng req.user để biết user hiện tại là ai
    req.user = user;

    // Gọi next() để chuyển sang middleware/controller tiếp theo
    next();
  } catch (error) {
    // ========== XỬ LÝ LỖI ==========

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      // 500 = Internal Server Error
      success: false,
      message: "Lỗi xác thực",
      error: error.message,
    });
  }
};

export default authMiddleware;
