import User from "../models/user.js";
import { hashPassword, comparePassword } from "../middleware/passwordHash.js";

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
};
//4. Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ JWT token
    const { oldPassword, newPassword } = req.body;

    // 1. VALIDATE INPUT
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mật khẩu cũ và mật khẩu mới",
      });
    }

    // Kiểm tra độ dài password mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // 2. TÌM USER TRONG DATABASE (bao gồm cả password)
    // Phải dùng .select("+password") vì trong model User, 
    // field password có select: false
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    // 3. XÁC THỰC PASSWORD CŨ
    const isPasswordValid = await comparePassword(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu cũ không đúng",
      });
    }

    // 4. KIỂM TRA PASSWORD MỚI KHÁC PASSWORD CŨ
    const isSamePassword = await comparePassword(newPassword, user.password);
    
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải khác mật khẩu cũ",
      });
    }

    // 5. HASH PASSWORD MỚI
    const hashedNewPassword = await hashPassword(newPassword);

    // 6. CẬP NHẬT PASSWORD TRONG DATABASE
    user.password = hashedNewPassword;
    await user.save();

    // 7. TRẢ VỀ KẾT QUẢ THÀNH CÔNG
    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });

  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi mật khẩu",
      error: error.message,
    });
  }
};
// 5. Lấy thông tin profile của chính mình
export const getMyProfile = async (req, res) => {
  try {
    // Lấy ID từ token (đã được set bởi middleware authenticateToken)
    const userId = req.user.id;

    // Tìm user trong database, không trả về password
    const user = await User.findById(userId).select("-password");

    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin user",
      });
    }

    // Trả về thông tin user
    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error("Lỗi lấy profile:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin profile",
      error: error.message,
    });
  }
};

// 6. User tự xóa tài khoản của mình
export const deleteMyAccount = async (req, res) => {
  try {
    // Lấy ID từ token
    const userId = req.user.id;

    // Tìm và xóa user
    const deletedUser = await User.findByIdAndDelete(userId);

    // Kiểm tra user có tồn tại không
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    // Trả về kết quả thành công
    res.status(200).json({
      success: true,
      message: "Xóa tài khoản thành công",
      data: {
        deletedUser: {
          id: deletedUser._id,
          username: deletedUser.username,
          email: deletedUser.email,
        }
      }
    });

  } catch (error) {
    console.error("Lỗi xóa tài khoản:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa tài khoản",
      error: error.message,
    });
  }
};

// 7. Admin xóa user theo ID
export const deleteUserById = async (req, res) => {
  try {
    // Lấy ID từ URL params
    const { id } = req.params;
    
    // Lấy ID của admin đang thực hiện
    const adminId = req.user.id;

    // Không cho phép admin tự xóa chính mình qua route này
    if (id === adminId) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa chính mình. Vui lòng sử dụng DELETE /api/users/me",
      });
    }

    // Tìm và xóa user
    const deletedUser = await User.findByIdAndDelete(id);

    // Kiểm tra user có tồn tại không
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user với ID đã cho",
      });
    }

    // Trả về kết quả thành công
    res.status(200).json({
      success: true,
      message: "Xóa user thành công",
      data: {
        deletedUser: {
          id: deletedUser._id,
          username: deletedUser.username,
          email: deletedUser.email,
          role: deletedUser.role,
        }
      }
    });

  } catch (error) {
    console.error("Lỗi xóa user:", error);
    
    // Xử lý lỗi ID không hợp lệ
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa user",
      error: error.message,
    });
  }
};
export default { 
  getAllUsers, 
  getUserById, 
  updateUserProfile, 
  changePassword , 
  getMyProfile,
  deleteMyAccount,
  deleteUserById,
};
