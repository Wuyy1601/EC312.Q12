import User from "../models/User.js";

// Lấy tất cả users
export const getAllUsers = async (req, res) => {
  try {
    // Lấy tất cả users, không trả về password
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

export default { getAllUsers };
