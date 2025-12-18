import express from "express";
import { createOrder, getOrder, getMyOrders, momoIPN, vnpayIPN, vnpayReturn, checkPaymentStatus, generateGreetingsAPI, sepayWebhook } from "../controllers/order.controller.js";

const router = express.Router();

// Order CRUD
router.post("/", createOrder);
router.post("/generate-greetings", generateGreetingsAPI);
router.post("/webhook", sepayWebhook); // SePay webhook
router.get("/:orderCode", getOrder);
router.get("/:orderCode/payment-status", checkPaymentStatus);
router.get("/user/:userId", getMyOrders);

// Payment callbacks
router.post("/momo-ipn", momoIPN);
router.get("/vnpay-ipn", vnpayIPN);
router.get("/vnpay-return", vnpayReturn);

export default router;
