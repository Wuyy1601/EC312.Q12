import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "./src/models/user.js";
import PasswordResetToken from "./src/models/passwordResetToken.js";
import { hashPassword } from "./src/middleware/passwordHash.js";

dotenv.config();

const testResetPassword = async () => {
  try {
    // Kết nối DB
    await mongoose.connect(process.env.USERS_DB_URI);
    console.log("✅ Connected to DB");

    // Token từ email
    const token = "9ef68ef605b2bccde3011658c17b3230def3bdc7b8f85a4cab61cd4a7fca027b";
    const newPassword = "1234567";

    console.log("\n🔍 Testing Reset Password Flow...");
    console.log("Token:", token);
    console.log("New Password:", newPassword);

    // Hash token để tìm trong DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("\n🔐 Hashed Token:", hashedToken);

    // Tìm token trong DB
    const resetToken = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    console.log("\n📊 Token trong DB:", resetToken);

    if (!resetToken) {
      console.log("❌ Token không tồn tại hoặc đã hết hạn");
      
      // Kiểm tra tất cả tokens
      const allTokens = await PasswordResetToken.find();
      console.log("\n📋 Tất cả tokens trong DB:", allTokens.length);
      allTokens.forEach((t, i) => {
        console.log(`Token ${i + 1}:`, {
          token: t.token,
          userId: t.userId,
          expiresAt: t.expiresAt,
          expired: t.expiresAt < Date.now()
        });
      });
      
      process.exit(1);
    }

    console.log("✅ Token hợp lệ!");

    // Tìm user
    const user = await User.findById(resetToken.userId);
    console.log("\n👤 User:", user ? user.email : "Không tìm thấy");

    if (!user) {
      console.log("❌ Không tìm thấy user");
      process.exit(1);
    }

    // Hash password mới
    console.log("\n🔐 Đang hash password mới...");
    const hashedPassword = await hashPassword(newPassword);
    console.log("✅ Password đã hash:", hashedPassword.substring(0, 20) + "...");

    // Update password
    user.password = hashedPassword;
    await user.save();
    console.log("✅ Đã cập nhật password");

    // Xóa token
    await PasswordResetToken.deleteOne({ _id: resetToken._id });
    console.log("✅ Đã xóa token");

    console.log("\n🎉 Reset password thành công!");

  } catch (error) {
    console.error("\n❌ LỖI:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testResetPassword();
