import User from "../models/User.js";

// 1. Lấy tất cả users (cho admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Lỗi lấy users:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách users",
      error: error.message,
    });
  }
};

//2. Lấy thông tin user theo ID
export const getUserById = async (req, res) => {
  try {
    // Lấy ID từ tham số URL
    const { id } = req.params;

    // Tìm user theo ID, không trả về password
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user với ID đã cho",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi lấy user theo ID:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin user",
      error: error.message,
    });
  }
};
//3. Cập nhật profile của user đang đăng nhập
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;
    if (req.body.password) {
    return res.status(400).json({
      success: false,
      message: "Không thể cập nhật mật khẩu qua route này. Vui lòng sử dụng route /change-password",
    });
  }

  if (!username && !email) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp username hoặc email để cập nhật",
    });
  }

  // Kiểm tra username đã tồn tại chưa (ở user khác)
  if (username) {
    const existingUsername = await User.findOne({
      username,
      _id: { $ne: userId } // $ne = not equal (loại trừ chính user này)
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username này đã được sử dụng bởi người khác",
      });
    }
  }

  // Kiểm tra email đã tồn tại chưa (ở user khác)
  if (email) {
    const existingEmail = await User.findOne({
      email,
      _id: { $ne: userId }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng bởi người khác",
      });
    }
  }

  // Tạo object chỉ chứa các field cần update
  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;

  // Update user trong database
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    {
      new: true,           
      runValidators: true  
    }
  ).select("-password"); 

  // Kiểm tra user có tồn tại không
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy user",
    });
  }

  // Trả về kết quả thành công
  res.status(200).json({
    success: true,
    message: "Cập nhật profile thành công",
    data: updatedUser,
  });

  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    
    // Xử lý lỗi validation
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        error: error.message,
      });
    }

    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username hoặc email đã tồn tại",
      });
    }

    // Lỗi chung
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật profile",
      error: error.message,
    });
  }
}
export default { getAllUsers, getUserById, updateUserProfile };
