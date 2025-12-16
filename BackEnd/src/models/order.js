import mongoose from "mongoose";
import { userConnection } from "../config/database.js";

// Schema cho sản phẩm trong đơn hàng
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String, // Cho phép cả string và ObjectId
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
});

// Schema cho đơn hàng
const orderSchema = new mongoose.Schema(
  {
    // Mã đơn hàng (unique, dùng cho nội dung chuyển khoản)
    orderCode: {
      type: String,
      unique: true,
      default: function () {
        // Tạo mã đơn hàng tự động: GN + timestamp + random 4 số
        const timestamp = Date.now().toString().slice(-10);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `GN${timestamp}${random}`;
      },
    },
    // Người đặt hàng (optional cho guest checkout)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    // Thông tin khách hàng
    customerInfo: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    // Danh sách sản phẩm
    items: [orderItemSchema],
    // Tổng tiền
    totalAmount: {
      type: Number,
      required: true,
    },
    // Mã giảm giá đã áp dụng
    discountCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    // Phương thức thanh toán: momo, vnpay, bank, cod
    paymentMethod: {
      type: String,
      required: true,
      enum: ["momo", "visa", "vnpay", "bank", "cod"],
    },
    // Trạng thái thanh toán
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    // Thời gian thanh toán
    paidAt: {
      type: Date,
      default: null,
    },
    // Mã giao dịch từ ngân hàng (nếu có)
    transactionId: {
      type: String,
      default: null,
    },
    // Trạng thái đơn hàng
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    // Ghi chú
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Tạo mã đơn hàng tự động trước khi lưu
orderSchema.pre("save", async function (next) {
  if (!this.orderCode) {
    // Format: GN + timestamp + random 4 số
    // VD: GN1702800000001234
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderCode = `GN${timestamp}${random}`;
  }
  next();
});

// Tạo nội dung chuyển khoản
orderSchema.methods.getTransferContent = function () {
  // Loại bỏ dấu và khoảng trắng từ tên
  const cleanName = this.customerInfo.fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "")
    .toUpperCase();

  // Format: GIFTNITY TENKHACH MADONHANG
  return `GIFTNITY ${cleanName} ${this.orderCode}`;
};

const Order = userConnection.model("Order", orderSchema);

export default Order;
