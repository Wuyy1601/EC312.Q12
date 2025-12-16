import express from "express";
import {
  createOrder,
  getOrder,
  getMyOrders,
  paymentWebhook,
  checkPaymentStatus,
  simulatePayment,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route tạo đơn hàng - cho phép cả guest và logged-in user
router.post("/", createOrder);

// Routes cần đăng nhập
router.get("/my-orders", authMiddleware, getMyOrders); // Lấy danh sách đơn hàng của user

// Routes public
router.get("/:orderCode", getOrder); // Lấy chi tiết đơn hàng
router.get("/:orderCode/payment-status", checkPaymentStatus); // Check trạng thái thanh toán

// Webhook từ SePay
router.post("/webhook", paymentWebhook);

// API giả lập thanh toán (để test)
router.post("/:orderCode/simulate-payment", simulatePayment);

export default router;
