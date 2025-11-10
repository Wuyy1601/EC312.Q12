import mongoose from "mongoose";
import { userConnection } from "../config/database.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Dùng userConnection thay vì mongoose.model (vì mongoose.model default connection tới 1 db duy nhất)
const User = userConnection.model("User", userSchema);

export default User;
