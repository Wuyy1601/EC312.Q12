import mongoose from "mongoose";
import { productConnection } from "../config/database.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      unique: true,
      trim: true,
      maxlength: [100, "Tên danh mục không được quá 100 ký tự"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Mô tả không được quá 500 ký tự"],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Middleware: Tự động tạo slug từ name trước khi save
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    // Chuyển đổi tên thành slug
    // VD: "Điện Thoại" -> "dien-thoai"
    this.slug = this.name
      .toLowerCase()
      .normalize("NFD") // Chuẩn hóa Unicode
      .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
      .replace(/đ/g, "d") // Thay đ -> d
      .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
      .replace(/\s+/g, "-") // Thay space -> -
      .replace(/-+/g, "-") // Xóa - thừa
      .trim();
  }
  next();
});

const Category = productConnection.model("Category", categorySchema);

export default Category;
