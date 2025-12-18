import express from "express";
import {
  createOrder,
  getOrder,
  getMyOrders,
  paymentWebhook,
  checkPaymentStatus,
  simulatePayment,
  momoIPN,
  vnpayIPN,
  vnpayReturn,
  generateGreetingsAPI,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route tạo đơn hàng - cho phép cả guest và logged-in user
router.post("/", createOrder);

// Route tạo lời chúc AI
router.post("/generate-greetings", generateGreetingsAPI);

// Webhook routes (phải đặt TRƯỚC dynamic routes)
router.post("/webhook", paymentWebhook); // SePay (Bank QR)
router.post("/momo-ipn", momoIPN); // MoMo IPN
router.get("/vnpay-ipn", vnpayIPN); // VNPay IPN callback
router.get("/vnpay-return", vnpayReturn); // VNPay redirect back

// Routes cần đăng nhập
router.get("/my-orders", authMiddleware, getMyOrders);

// Dynamic routes (phải đặt SAU các routes cụ thể)
router.get("/:orderCode", getOrder);
router.get("/:orderCode/payment-status", checkPaymentStatus);
router.post("/:orderCode/simulate-payment", simulatePayment);

export default router;


