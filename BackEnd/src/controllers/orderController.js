import Order from "../models/order.js";
import {
  sendOrderConfirmation,
  sendPaymentSuccess,
} from "../services/emailService.js";

/**
 * Tạo đơn hàng mới
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const {
      customerInfo,
      items,
      totalAmount,
      discountCode,
      discountAmount,
      paymentMethod,
      note,
    } = req.body;

    // Validate
    if (
      !customerInfo ||
      !items ||
      items.length === 0 ||
      !totalAmount ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin đơn hàng",
      });
    }

    // Tạo đơn hàng
    const order = new Order({
      userId: req.user?._id || null, // Optional - cho phép đặt hàng không cần đăng nhập
      customerInfo,
      items,
      totalAmount,
      discountCode: discountCode || null,
      discountAmount: discountAmount || 0,
      paymentMethod,
      note: note || "",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "pending",
    });

    await order.save();

    // Gửi email xác nhận đơn hàng
    sendOrderConfirmation(order);

    // Tạo thông tin thanh toán nếu là online payment
    let paymentInfo = null;
    if (paymentMethod !== "cod") {
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
      order: {
        _id: order._id,
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
      paymentInfo,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

/**
 * Lấy thông tin đơn hàng
 * GET /api/orders/:orderCode
 */
export const getOrder = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Tạo thông tin thanh toán nếu chưa thanh toán và là online payment
    let paymentInfo = null;
    if (order.paymentStatus === "pending" && order.paymentMethod !== "cod") {
      paymentInfo = {
        bankName: process.env.BANK_NAME || "Vietcombank",
        accountNumber: process.env.BANK_ACCOUNT || "1234567890",
        accountName: process.env.BANK_ACCOUNT_NAME || "NGUYEN VAN A",
        amount: order.totalAmount,
        transferContent: order.getTransferContent(),
        qrUrl: generateQRUrl(order),
      };
    }

    res.json({
      success: true,
      order,
      paymentInfo,
    });
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách đơn hàng của user
 * GET /api/orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-items"); // Không lấy chi tiết items để giảm data

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

/**
 * Webhook nhận thông báo từ SePay
 * POST /api/orders/webhook
 *
 * SePay webhook format:
 * {
 *   "id": 93,
 *   "gateway": "MBBank",
 *   "transactionDate": "2024-01-15 10:30:00",
 *   "accountNumber": "0123456789",
 *   "code": null,
 *   "content": "GIFTNITY NGUYENVANA GN17028001234",
 *   "transferType": "in",
 *   "transferAmount": 500000,
 *   "accumulated": 1500000,
 *   "subAccount": null,
 *   "referenceCode": "FT12345678",
 *   "description": "GIFTNITY NGUYENVANA GN17028001234"
 * }
 */
export const paymentWebhook = async (req, res) => {
  try {
    console.log("📥 Webhook received:", JSON.stringify(req.body, null, 2));
    console.log("📥 Headers:", JSON.stringify(req.headers, null, 2));

    // Tạm bỏ check token để test
    // TODO: Bật lại sau khi có SEPAY_API_TOKEN
    // const authHeader = req.headers.authorization;
    // const token = authHeader?.replace("Apikey ", "");
    // if (token !== process.env.SEPAY_API_TOKEN) {
    //   console.warn("⚠️ Webhook unauthorized attempt");
    //   return res.status(401).json({ success: false, message: "Unauthorized" });
    // }

    const transaction = req.body;

    // SePay gửi 1 transaction object, không phải array
    if (!transaction || !transaction.transferAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid data format" });
    }

    // Chỉ xử lý giao dịch "tiền vào"
    if (transaction.transferType !== "in") {
      return res.json({
        success: true,
        message: "Ignored outgoing transaction",
      });
    }

    await processTransaction({
      description: transaction.content || transaction.description,
      amount: transaction.transferAmount,
      tid: transaction.referenceCode || transaction.id?.toString(),
    });

    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Xử lý giao dịch từ webhook
 */
async function processTransaction(transaction) {
  const { description, amount, tid } = transaction;

  console.log(`📥 Processing transaction: ${tid} - ${amount} - ${description}`);

  // Parse nội dung chuyển khoản để lấy mã đơn hàng
  // Format: GIFTNITY TENKHACH MADONHANG
  // Hoặc chỉ cần tìm mã GN + số
  const match = description?.match(/(GN\d+)/i);

  if (!match) {
    console.log(`⚠️ Không tìm thấy mã đơn hàng trong: ${description}`);
    return;
  }

  const orderCode = match[1].toUpperCase();
  console.log(`🔍 Tìm thấy mã đơn hàng: ${orderCode}`);

  // Tìm đơn hàng
  const order = await Order.findOne({ orderCode });

  if (!order) {
    console.log(`❌ Không tìm thấy đơn hàng: ${orderCode}`);
    return;
  }

  // Kiểm tra đã thanh toán chưa
  if (order.paymentStatus === "paid") {
    console.log(`⚠️ Đơn hàng ${orderCode} đã được thanh toán trước đó`);
    return;
  }

  // Kiểm tra số tiền
  if (amount < order.totalAmount) {
    console.log(`⚠️ Số tiền không đủ: ${amount} < ${order.totalAmount}`);
    return;
  }

  // Cập nhật trạng thái thanh toán
  order.paymentStatus = "paid";
  order.paidAt = new Date();
  order.transactionId = tid;
  order.orderStatus = "confirmed"; // Tự động xác nhận đơn hàng

  await order.save();

  console.log(`✅ Đơn hàng ${orderCode} đã được thanh toán thành công!`);

  // Gửi email thông báo thanh toán thành công
  sendPaymentSuccess(order);
}

/**
 * Generate QR URL cho VietQR
 * Sử dụng VietQR API để tạo mã QR chuyển khoản
 */
function generateQRUrl(order) {
  const bankId = process.env.BANK_ID || "970436"; // Vietcombank
  const accountNo = process.env.BANK_ACCOUNT || "1234567890";
  const accountName = process.env.BANK_ACCOUNT_NAME || "NGUYEN VAN A";
  const amount = order.totalAmount;
  const description = order.getTransferContent();

  // VietQR format
  // https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<NAME>
  const template = "compact2"; // hoặc compact, print, qr_only

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(
    description
  )}&accountName=${encodeURIComponent(accountName)}`;

  return qrUrl;
}

/**
 * Check trạng thái thanh toán (polling từ frontend)
 * GET /api/orders/:orderCode/payment-status
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const order = await Order.findOne({ orderCode }).select(
      "paymentStatus paidAt orderStatus"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

/**
 * API giả lập thanh toán thành công (CHỈ DÙNG CHO DEV/TEST)
 * POST /api/orders/:orderCode/simulate-payment
 */
export const simulatePayment = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được thanh toán trước đó",
      });
    }

    // Cập nhật trạng thái
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    order.transactionId = "SIMULATE_" + Date.now();
    order.orderStatus = "confirmed";

    await order.save();

    console.log(`✅ [SIMULATE] Đơn hàng ${orderCode} đã được thanh toán!`);

    // Gửi email thông báo
    sendPaymentSuccess(order);

    res.json({
      success: true,
      message: "Đã giả lập thanh toán thành công!",
      order: {
        orderCode: order.orderCode,
        paymentStatus: order.paymentStatus,
        paidAt: order.paidAt,
      },
    });
  } catch (error) {
    console.error("Simulate payment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export default {
  createOrder,
  getOrder,
  getMyOrders,
  paymentWebhook,
  checkPaymentStatus,
  simulatePayment,
};
