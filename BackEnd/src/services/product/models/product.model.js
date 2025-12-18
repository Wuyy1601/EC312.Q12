import mongoose from "mongoose";
import connection from "../database.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, default: "other" }, // Bỏ enum để linh hoạt
    image: { type: String }, // Ảnh chính
    images: [{ type: String }], // Nhiều ảnh
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });

const Product = connection.models.Product || connection.model("Product", productSchema);

export default Product;
