import User from "../models/user.model.js";
import { hashPassword, comparePassword, generateToken, verifyToken } from "../../../shared/utils/helpers.js";

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password phải có ít nhất 6 ký tự" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email hoặc username đã tồn tại" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ username, email, password: hashedPassword });

    const token = generateToken({ id: newUser._id, email: newUser.email, username: newUser.username });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token,
      data: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email và password" });
    }

    const user = await User.findOne({ email }).select("+password +role");
    if (!user) {
      return res.status(401).json({ success: false, message: "Email không đúng" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password không đúng" });
    }

    const token = generateToken({ id: user._id, email: user.email, username: user.username, role: user.role });

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      data: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get All Users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Không có token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Token không hợp lệ" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User không tồn tại" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xác thực", error: error.message });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Yêu cầu quyền Admin" });
  }
  next();
};

// Admin Login (hardcoded credentials)
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcoded admin credentials
    if (username === "admin" && password === "admin") {
      const token = generateToken({ id: "admin", username: "admin", role: "admin" });
      return res.json({
        success: true,
        message: "Đăng nhập admin thành công",
        token,
        data: { id: "admin", username: "admin", role: "admin" },
      });
    }

    res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu admin" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Update User (Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating password directly here
    delete updates.password;

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }

    res.json({ success: true, message: "Cập nhật thành công", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Delete User (Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }
    res.json({ success: true, message: "Xóa user thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export default { register, login, getProfile, getAllUsers, authMiddleware, adminMiddleware, adminLogin, updateUser, deleteUser };
