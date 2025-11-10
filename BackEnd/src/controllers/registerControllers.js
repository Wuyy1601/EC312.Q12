import User from "../models/User.js";

// Đăng ký user mới
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Kiểm tra có đủ thông tin không
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ username, email và password",
      });
    }

    // 2. Kiểm tra email hoặc username đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc username đã được sử dụng",
      });
    }

    // 3. Tạo user mới (password lưu trực tiếp, chưa hash)
    const newUser = await User.create({
      username,
      email,
      password, // Tạm thời lưu trực tiếp
    });

    // 4. Trả về thông tin user (không trả password)
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
      error: error.message,
    });
  }
};

export default { registerUser };
