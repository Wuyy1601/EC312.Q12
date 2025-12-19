import mongoose from "mongoose";
import connection from "../database.js";

const orderItemSchema = new mongoose.Schema({
  productId: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      unique: true,
      default: function () {
        return `GN${Date.now().toString().slice(-10)}${Math.floor(1000 + Math.random() * 9000)}`;
      },
    },
    userId: { type: String, default: null }, // String để tương thích cross-service
    customerInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    cardFee: { type: Number, default: 0 },
    discountCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, required: true, enum: ["momo", "visa", "vnpay", "bank", "cod"] },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paidAt: { type: Date, default: null },
    transactionId: { type: String, default: null },
    orderStatus: { type: String, enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"], default: "pending" },
    note: { type: String, default: "" },
    giftMessage: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: "" },
      design: { type: String, default: "" },
      recipientName: { type: String, default: "" },
      relationship: { type: String, default: "" },
      occasion: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

orderSchema.methods.getTransferContent = function () {
  const cleanName = this.customerInfo.fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "")
    .toUpperCase();
  return `GIFTNITY ${cleanName} ${this.orderCode}`;
};

const Order = connection.models.Order || connection.model("Order", orderSchema);

export default Order;
