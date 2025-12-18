import mongoose from "mongoose";
import { userConnection } from "../config/database.js";

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
    expires: 3600, // Tự động xóa sau 1 giờ
  },
});

const PasswordResetToken = userConnection.models.PasswordResetToken || 
  userConnection.model("PasswordResetToken", resetTokenSchema);

export default PasswordResetToken;