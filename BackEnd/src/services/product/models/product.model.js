import mongoose from "mongoose";
import connection from "../database.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, enum: ["birthday", "anniversary", "christmas", "newyear", "graduation", "wedding", "other"], default: "other" },
    images: [{ type: String }],
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
