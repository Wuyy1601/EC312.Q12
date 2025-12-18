import User from "../models/user.js";
import PasswordResetToken from "../models/passwordResetToken.js";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../services/emailService.js";
import { hashPassword } from "../middleware/passwordHash.js";

// POST /api/password/forgot
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
      });
    }

    // Tìm user
    const user = await User.findOne({ email });

    // Không nói user có tồn tại hay không (security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Nếu email tồn tại, bạn sẽ nhận được link reset password",
      });
    }

    // Tạo random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token trước khi lưu DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Xóa token cũ (nếu có)
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Lưu token mới
    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 giờ
    });

    // Tạo reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Gửi email
    await sendResetPasswordEmail(user.email, user.username, resetUrl);

    res.status(200).json({
      success: true,
      message: "Email reset password đã được gửi",
    });

  } catch (error) {
    console.error("Lỗi forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
// POST /api/password/reset
export const resetPassword = async (req, res) => {
  try {
    console.log("=== Reset Password Request ===");
    console.log("Body:", req.body);
    
    const { token, newPassword } = req.body;

    // Validate
    if (!token || !newPassword) {
      console.log("❌ Thiếu thông tin");
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin",
      });
    }

    if (newPassword.length < 6) {
      console.log("❌ Password quá ngắn");
      return res.status(400).json({
        success: false,
        message: "Password phải có ít nhất 6 ký tự",
      });
    }

    // Hash token để compare với DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("🔍 Tìm token:", hashedToken);

    // Tìm token trong DB
    const resetToken = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() }, // Chưa hết hạn
    });

    console.log("Token từ DB:", resetToken);

    if (!resetToken) {
      console.log("❌ Token không hợp lệ hoặc đã hết hạn");
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Tìm user
    const user = await User.findById(resetToken.userId);

    console.log("User:", user ? user.email : "Not found");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    // Hash password mới
    console.log("🔐 Đang hash password mới...");
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password đã được cập nhật");

    // Xóa token đã dùng
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });

  } catch (error) {
    console.error("❌ Lỗi reset password:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};