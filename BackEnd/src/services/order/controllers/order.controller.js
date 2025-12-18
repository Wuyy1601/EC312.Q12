import Order from "../models/order.model.js";
import {
  createMomoPayment,
  verifyMomoSignature,
} from "../../momoService.js";
import {
  createVnpayPayment,
  verifyVnpaySignature,
  getVnpayResponseMessage,
} from "../../vnpayService.js";
import { sendOrderConfirmation, sendPaymentSuccess } from "../../emailService.js";

// Helper: Generate QR URL
const generateQRUrl = (order) => {
  const bankId = process.env.BANK_ID || "970422";
  const accountNo = process.env.BANK_ACCOUNT || "1234567890";
  const template = "compact2";
  const amount = order.totalAmount;
  const addInfo = encodeURIComponent(order.getTransferContent());
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${addInfo}`;
};

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { customerInfo, items, totalAmount, discountCode, discountAmount, paymentMethod, note } = req.body;

    if (!customerInfo || !items?.length || !totalAmount || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin đơn hàng" });
    }

    const order = new Order({
      userId: req.body.userId || null,
      customerInfo,
      items,
      totalAmount,
      discountCode: discountCode || null,
      discountAmount: discountAmount || 0,
      paymentMethod,
      note: note || "",
      giftMessage: req.body.giftMessage || { enabled: false },
    });

    await order.save();
    sendOrderConfirmation(order);

    let paymentInfo = null;
    const ipAddr = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";

    if (paymentMethod === "momo") {
      const momoResult = await createMomoPayment(order);
      paymentInfo = momoResult.success
        ? { payUrl: momoResult.payUrl, deeplink: momoResult.deeplink, qrCodeUrl: momoResult.qrCodeUrl }
        : { error: momoResult.message, qrUrl: generateQRUrl(order) };
    } else if (paymentMethod === "vnpay") {
      const vnpayResult = createVnpayPayment(order, ipAddr);
      paymentInfo = vnpayResult.success
        ? { payUrl: vnpayResult.payUrl }
        : { error: vnpayResult.message, qrUrl: generateQRUrl(order) };
    } else if (paymentMethod !== "cod") {
      paymentInfo = {
        bankName: process.env.BANK_NAME || "Vietcombank",
        accountNumber: process.env.BANK_ACCOUNT || "1234567890",
        accountName: process.env.BANK_ACCOUNT_NAME || "NGUYEN VAN A",
        amount: totalAmount,
        transferContent: order.getTransferContent(),
        qrUrl: generateQRUrl(order),
      };
    }

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      order: { _id: order._id, orderCode: order.orderCode, totalAmount: order.totalAmount, paymentMethod, paymentStatus: order.paymentStatus },
      paymentInfo,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get Order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: req.params.orderCode });
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    let paymentInfo = null;
    if (order.paymentStatus === "pending" && order.paymentMethod !== "cod") {
      paymentInfo = { qrUrl: generateQRUrl(order), transferContent: order.getTransferContent() };
    }

    res.json({ success: true, order, paymentInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Get My Orders (by userId)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// MoMo IPN
export const momoIPN = async (req, res) => {
  try {
    const { orderId, resultCode, transId, signature } = req.body;
    if (!verifyMomoSignature(req.body)) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const orderCode = orderId.split("_")[0];
    const order = await Order.findOne({ orderCode });

    if (order && resultCode === 0 && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
      order.transactionId = transId;
      order.orderStatus = "confirmed";
      await order.save();
      sendPaymentSuccess(order);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// VNPay IPN
export const vnpayIPN = async (req, res) => {
  try {
    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_SecureHash } = req.query;
    if (!verifyVnpaySignature(req.query)) {
      return res.json({ RspCode: "97", Message: "Invalid signature" });
    }

    const orderCode = vnp_TxnRef.split("_")[0];
    const order = await Order.findOne({ orderCode });

    if (order && vnp_ResponseCode === "00" && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
      order.transactionId = vnp_TransactionNo;
      order.orderStatus = "confirmed";
      await order.save();
      sendPaymentSuccess(order);
    }

    res.json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    res.json({ RspCode: "99", Message: error.message });
  }
};

// VNPay Return
export const vnpayReturn = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = req.query;
  const orderCode = vnp_TxnRef?.split("_")[0];

  if (vnp_ResponseCode === "00") {
    const order = await Order.findOne({ orderCode });
    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
      order.transactionId = vnp_TransactionNo;
      order.orderStatus = "confirmed";
      await order.save();
      sendPaymentSuccess(order);
    }
    return res.redirect(`${frontendUrl}/payment-result?status=success&orderCode=${orderCode}`);
  }

  const message = encodeURIComponent(getVnpayResponseMessage(vnp_ResponseCode));
  return res.redirect(`${frontendUrl}/payment-result?status=failed&orderCode=${orderCode}&message=${message}`);
};

// Check Payment Status
export const checkPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: req.params.orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    res.json({
      success: true,
      orderCode: order.orderCode,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Generate Greetings (AI)
export const generateGreetingsAPI = async (req, res) => {
  try {
    const { recipientName, relationship, occasion } = req.body;
    if (!recipientName || !relationship || !occasion) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin" });
    }

    // Import dynamically to avoid circular deps
    const { generateGreetings } = await import("../../greetingService.js");
    const result = await generateGreetings(recipientName, relationship, occasion);

    res.json({
      success: true,
      greetings: result.greetings,
      source: result.source,
      warning: result.warning || null,
    });
  } catch (error) {
    console.error("Generate greetings error:", error);
    res.status(500).json({ success: false, message: "Lỗi tạo lời chúc", error: error.message });
  }
};

export default { createOrder, getOrder, getMyOrders, momoIPN, vnpayIPN, vnpayReturn, checkPaymentStatus, generateGreetingsAPI };
