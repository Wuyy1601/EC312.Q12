import mongoose from "mongoose";
import connection from "../database.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, default: "other" },
    image: { type: String },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],

    // Bundle fields
    isBundle: { type: Boolean, default: false },
    bundleItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    originalPrice: { type: Number }, // Tổng giá gốc của các SP lẻ
    savings: { type: Number }, // Số tiền tiết kiệm
  },
  { timestamps: true }
);

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });

// Virtual: Tính toán tiết kiệm
productSchema.pre("save", async function (next) {
  if (this.isBundle && this.bundleItems?.length > 0 && this.isModified("bundleItems")) {
    try {
      const Product = this.constructor;
      let originalPrice = 0;

      for (const item of this.bundleItems) {
        const product = await Product.findById(item.product);
        if (product) {
          originalPrice += product.price * item.quantity;
        }
      }

      this.originalPrice = originalPrice;
      this.savings = originalPrice - this.price;
    } catch (err) {
      console.error("Error calculating bundle price:", err);
    }
  }
  next();
});

const Product = connection.models.Product || connection.model("Product", productSchema);

export default Product;
