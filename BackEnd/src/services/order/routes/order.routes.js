import express from "express";
import { createOrder, getOrder, getMyOrders, momoIPN, vnpayIPN, vnpayReturn, checkPaymentStatus, generateGreetingsAPI, sepayWebhook, getAllOrders, updateOrderStatus, deleteOrder, simulatePayment, cancelOrder } from "../controllers/order.controller.js";

const router = express.Router();

// Order CRUD
router.post("/", createOrder);
router.post("/generate-greetings", generateGreetingsAPI);
router.post("/webhook", sepayWebhook); // SePay webhook
router.get("/all", getAllOrders); // Admin: get all orders
router.get("/:orderCode", getOrder);
router.get("/:orderCode/payment-status", checkPaymentStatus);
router.post("/:orderCode/simulate-payment", simulatePayment); // DEV/TEST: Simulate payment
router.get("/user/:userId", getMyOrders);
router.put("/:orderCode/status", updateOrderStatus); // Admin: update status
router.post("/:orderCode/cancel", cancelOrder); // User: cancel order
router.delete("/:orderCode", deleteOrder); // Admin: delete order

// Payment callbacks
router.post("/momo-ipn", momoIPN);
router.get("/vnpay-ipn", vnpayIPN);
router.get("/vnpay-return", vnpayReturn);

export default router;

