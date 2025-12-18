import mongoose from "mongoose";
import connection from "../database.js";

const resetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000), // 1 giờ
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Tự động xóa sau 1 giờ (TTL index)
  },
});

const PasswordResetToken = connection.models.PasswordResetToken || 
  connection.model("PasswordResetToken", resetTokenSchema);

export default PasswordResetToken;
