import express from "express";
import { createOrder, getOrder, getMyOrders, momoIPN, vnpayIPN, vnpayReturn, checkPaymentStatus, generateGreetingsAPI, sepayWebhook, getAllOrders, updateOrderStatus, deleteOrder, simulatePayment, cancelOrder } from "../controllers/order.controller.js";
// =====  DEFENSE (Access Control) =====
// import { authMiddleware, adminMiddleware } from "../../user/controllers/user.controller.js";

const router = express.Router();

// Order CRUD
router.post("/", createOrder);
router.post("/generate-greetings", generateGreetingsAPI);
router.post("/webhook", sepayWebhook); // SePay webhook

// =====  VULNERABLE (Access Control): Không có authMiddleware — ai cũng truy cập được =====
router.get("/all", getAllOrders);
// =====  DEFENSE (Access Control): Bật dòng dưới, tắt dòng trên =====
// router.get("/all", authMiddleware, adminMiddleware, getAllOrders);

// =====  VULNERABLE (IDOR): Không kiểm tra quyền sở hữu đơn hàng =====
router.get("/:orderCode", getOrder);
// =====  DEFENSE (IDOR) =====
// router.get("/:orderCode", authMiddleware, getOrder);

// router.get("/:orderCode/payment-status", checkPaymentStatus);

// =====  VULNERABLE (Business Logic): Endpoint thanh toán giả không cần xác thực =====
router.post("/:orderCode/simulate-payment", simulatePayment);
// =====  DEFENSE (Business Logic)=====
// router.post("/:orderCode/simulate-payment", authMiddleware, adminMiddleware, simulatePayment);

router.get("/user/:userId", getMyOrders);

// =====  VULNERABLE (Access Control): Route Admin không có middleware =====
router.put("/:orderCode/status", updateOrderStatus);
router.delete("/:orderCode", deleteOrder);
// =====  DEFENSE (Access Control): Bật 2 dòng dưới, tắt 2 dòng trên =====
// router.put("/:orderCode/status", authMiddleware, adminMiddleware, updateOrderStatus);
// router.delete("/:orderCode", authMiddleware, adminMiddleware, deleteOrder);

router.post("/:orderCode/cancel", cancelOrder);
// =====  VULNERABLE (CSRF): Cho phép hủy đơn bằng GET — dễ bị CSRF =====
router.get("/:orderCode/quick-cancel", cancelOrder);
// =====  DEFENSE (CSRF): Xóa/comment dòng trên, chỉ giữ POST =====

// Payment callbacks
router.post("/momo-ipn", momoIPN);
router.get("/vnpay-ipn", vnpayIPN);
router.get("/vnpay-return", vnpayReturn);

export default router;
