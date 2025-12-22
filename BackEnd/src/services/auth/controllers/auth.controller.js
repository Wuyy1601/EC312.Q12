import User from "../models/user.model.js";
import PasswordResetToken from "../models/passwordResetToken.model.js";
import { hashPassword, comparePassword, generateToken, verifyToken } from "../../../shared/utils/helpers.js";
import { sendResetPasswordEmail } from "../../notification/emailService.js";
import crypto from "crypto";

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

// Update My Profile
export const updateProfile = async (req, res) => {
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

    // Check duplicate username
    if (username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: "Username này đã được sử dụng" });
      }
    }

    // Check duplicate email
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email này đã được sử dụng" });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    res.status(200).json({ success: true, message: "Cập nhật profile thành công", data: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp mật khẩu cũ và mật khẩu mới" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Mật khẩu cũ không đúng" });
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới phải khác mật khẩu cũ" });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Delete My Account
export const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    res.status(200).json({
      success: true,
      message: "Xóa tài khoản thành công",
      data: { deletedUser: { id: deletedUser._id, username: deletedUser.username, email: deletedUser.email } },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security: Don't reveal if user exists
      return res.status(200).json({ success: true, message: "Nếu email tồn tại, bạn sẽ nhận được link reset password" });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Delete old tokens
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Save new token
    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    // Send email
    await sendResetPasswordEmail(user.email, user.username, resetUrl);

    res.status(200).json({ success: true, message: "Email reset password đã được gửi" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password phải có ít nhất 6 ký tự" });
    }

    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!resetToken) {
      return res.status(400).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Find user
    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    // Hash and update password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    // Delete used token
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
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

    // Admin hardcoded check
    if (decoded.id === "admin") {
      req.user = { id: "admin", role: "admin", username: "admin" };
      return next();
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

// Social Login (Google/Facebook)
export const socialLogin = async (req, res) => {
  try {
    const { email, username, avatar, uid } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email là bắt buộc" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      // Generate random password
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await hashPassword(randomPassword);
      
      user = await User.create({
        username: username || email.split("@")[0],
        email,
        password: hashedPassword,
        avatar: avatar || "",
      });
    }

    const token = generateToken({ id: user._id, email: user.email, username: user.username, role: user.role || "user" });

    res.status(200).json({
      success: true,
      message: "Đăng nhập Social thành công",
      token,
      data: { id: user._id, username: user.username, email: user.email, role: user.role || "user", avatar: user.avatar },
    });

  } catch (error) {
    console.error("Social login error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export default { 
  register, login, getProfile, updateProfile, changePassword, deleteMyAccount,
  forgotPassword, resetPassword, getAllUsers, authMiddleware, adminMiddleware, 
  adminLogin, updateUser, deleteUser, socialLogin 
};

