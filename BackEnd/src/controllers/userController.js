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

// 2. Lấy user theo ID (cho admin xem chi tiết)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi lấy user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export default { getAllUsers, getUserById };
