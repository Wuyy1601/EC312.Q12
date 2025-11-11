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

// Lấy thông tin user theo ID
export const getUserById = async (req, res) => {
  try {
    // Lấy ID từ tham số URL
    const {id} = req.params;
    
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

export default { getAllUsers, getUserById };
