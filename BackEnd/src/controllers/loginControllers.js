import User from "../models/User.js";

// Đăng nhập
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra có đủ thông tin không
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và password",
      });
    }

    // 2. Tìm user theo email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
    }

    // 3. So sánh password trực tiếp (chưa hash)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
    }

    // 4. Đăng nhập thành công
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
  }
};

export default { loginUser };
