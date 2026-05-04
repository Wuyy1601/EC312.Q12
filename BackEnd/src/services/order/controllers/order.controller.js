import Order from "../models/order.model.js";
import Product from "../../product/models/product.model.js";
import { createMomoPayment, verifyMomoSignature } from "../../payment/momoService.js";
import { createVnpayPayment, verifyVnpaySignature, getVnpayResponseMessage } from "../../payment/vnpayService.js";
import { sendOrderConfirmation, sendPaymentSuccess } from "../../notification/emailService.js";
import fs from "fs";
import path from "path";

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

    // Handle Greeting Card Image Upload (Base64 -> File)
    if (req.body.giftMessage && req.body.giftMessage.design && req.body.giftMessage.design.startsWith("data:image")) {
       try {
         const base64Data = req.body.giftMessage.design.replace(/^data:image\/\w+;base64,/, "");
         const buffer = Buffer.from(base64Data, 'base64');
         const fileName = `card_${Date.now()}_${Math.round(Math.random() * 1000)}.png`;
         
         const uploadDir = path.join(process.cwd(), 'src', 'uploads', 'gift-cards');
         if (!fs.existsSync(uploadDir)){
            await fs.promises.mkdir(uploadDir, { recursive: true });
         }
         
         const filePath = path.join(uploadDir, fileName);
         await fs.promises.writeFile(filePath, buffer);
         
         req.body.giftMessage.design = `/uploads/gift-cards/${fileName}`;
         console.log("✅ Greeting card image saved:", fileName);
       } catch (err) {
         console.error("❌ Error saving greeting card image:", err);
         // Fallback: If upload fails, try to save null or small placeholder to avoid DB crash
         req.body.giftMessage.design = ""; 
       }
    }

    // Check and Deduct Stock (skip if product not found - for demo purposes)
    for (const item of items) {
      const productId = item.product?._id || item.product;
      
      if (!productId) {
        console.log("⚠️ Item has no product ID, skipping stock check:", item.name);
        continue;
      }
      
      let product;
      try {
         product = await Product.findById(productId);
      } catch (err) {
         console.log("⚠️ Invalid Product ID format, skipping stock check:", productId);
         continue; // Skip invalid IDs instead of failing
      }
      
      if (!product) {
         console.log("⚠️ Product not found in DB, skipping stock check:", productId);
         continue; // Skip products not in DB
      }

      const qty = Number(item.quantity) || 1;

      if (product.isBundle) {
        if (product.bundleItems && product.bundleItems.length > 0) {
           // Check all sub-items first
           for (const subItem of product.bundleItems) {
             if (!subItem.product) continue;
             
             const subProduct = await Product.findById(subItem.product);
             if (subProduct) {
               const subQty = Number(subItem.quantity) || 1;
               const required = subQty * qty;
               
               if (subProduct.stock < required) {
                 return res.status(400).json({ success: false, message: `Sản phẩm ${subProduct.name} (trong Combo) không đủ hàng` });
               }
             }
           }
           // Deduct
           for (const subItem of product.bundleItems) {
             if (!subItem.product) continue;
             const subQty = Number(subItem.quantity) || 1;
             await Product.findByIdAndUpdate(subItem.product, { $inc: { stock: -(subQty * qty) } });
           }
        }
      } else {
        if (product.stock < qty) {
          return res.status(400).json({ success: false, message: `Sản phẩm ${product.name} không đủ hàng (Còn: ${product.stock})` });
        }
        await Product.findByIdAndUpdate(productId, { $inc: { stock: -qty } });
      }
    }

    const order = new Order({
      userId: req.body.userId || null,
      customerInfo,
      items: items.map(item => ({
        ...item,
        productId: item.product?._id || item.product
      })),
      totalAmount,
      discountCode: discountCode || null,
      discountAmount: discountAmount || 0,
      paymentMethod,
      note: note || "",
      giftMessage: req.body.giftMessage || { enabled: false },
      orderStatus: paymentMethod === "cod" ? "preparing" : "pending",
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
      paymentInfo = {
        bankName: process.env.BANK_NAME || "MB Bank",
        accountNumber: process.env.BANK_ACCOUNT || "1234567890",
        accountName: process.env.BANK_ACCOUNT_NAME || "NGUYEN VAN A",
        amount: order.totalAmount,
        transferContent: order.getTransferContent(),
        qrUrl: generateQRUrl(order),
      };
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

// SePay Webhook (Bank Transfer Payment)
export const sepayWebhook = async (req, res) => {
  try {
    console.log("📥 SePay Webhook received:", JSON.stringify(req.body, null, 2));

    const { transferAmount, content, transferType } = req.body;

    // Chỉ xử lý giao dịch nhận tiền (in)
    if (transferType !== "in") {
      return res.json({ success: true, message: "Ignored outgoing transfer" });
    }

    // Tìm mã đơn hàng trong nội dung chuyển khoản
    // Format: GIFTNITY TENKHACH MADONHANG
    const orderCodeMatch = content?.match(/GN\d+/i);
    
    if (!orderCodeMatch) {
      console.log("⚠️ Không tìm thấy mã đơn hàng trong nội dung:", content);
      return res.json({ success: true, message: "No order code found" });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();
    console.log("🔍 Tìm đơn hàng:", orderCode);

    const order = await Order.findOne({ orderCode });

    if (!order) {
      console.log("⚠️ Không tìm thấy đơn hàng:", orderCode);
      return res.json({ success: true, message: "Order not found" });
    }

    // Kiểm tra số tiền (cho phép chênh lệch nhỏ do phí bank)
    const amountDiff = Math.abs(order.totalAmount - transferAmount);
    if (amountDiff > 1000) { // Cho phép chênh 1000đ
      console.log(`⚠️ Số tiền không khớp: Expected ${order.totalAmount}, Got ${transferAmount}`);
      return res.json({ success: true, message: "Amount mismatch" });
    }

    // Cập nhật trạng thái thanh toán
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
      order.transactionId = req.body.id?.toString() || Date.now().toString();
      order.orderStatus = "confirmed";
      await order.save();

      console.log("✅ Đã cập nhật thanh toán cho đơn hàng:", orderCode);
      
      // Gửi email xác nhận thanh toán
      sendPaymentSuccess(order);
    }

    res.json({ success: true, message: "Payment confirmed" });
  } catch (error) {
    console.error("❌ SePay Webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
    }

    await order.save();
    res.json({ success: true, message: "Cập nhật thành công", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Delete Order (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOneAndDelete({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    res.json({ success: true, message: "Xóa đơn hàng thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Simulate Payment (DEV/TEST only)
export const simulatePayment = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã được thanh toán trước đó" });
    }

    // Simulate successful payment
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    order.transactionId = "SIMULATE_" + Date.now();
    order.orderStatus = "confirmed";
    await order.save();

    console.log(`✅ [SIMULATE] Đơn hàng ${orderCode} đã được thanh toán!`);
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
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Cancel Order (User)
export const cancelOrder = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { reason } = req.body || {}; // CSRF attack via GET request won't have a body
    
    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Only allow canceling if status is pending or confirmed
    const allowedStatuses = ["pending", "confirmed"];
    if (!allowedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: "Đơn hàng đang xử lý hoặc đã giao, không thể hủy" });
    }

    // Check ownership if needed (req.user), but orderCode is fairly secure if unique.
    
    // Restore Stock
    if (order.items) {
      for (const item of order.items) {
        try {
          const productId = item.productId || item.product;
          const product = await Product.findById(productId);
          const qty = item.quantity;

          if (product) {
            if (product.isBundle && product.bundleItems) {
              for (const subItem of product.bundleItems) {
                await Product.findByIdAndUpdate(subItem.product, { $inc: { stock: (subItem.quantity * qty) } });
              }
            } else {
              await Product.findByIdAndUpdate(productId, { $inc: { stock: qty } });
            }
          }
        } catch (err) {
          console.error("Error restoring stock for item:", item, err);
        }
      }
    }

    order.orderStatus = "cancelled";
    order.note = order.note ? order.note + `\n[Khách hủy: ${reason || "Không lý do"}]` : `[Khách hủy: ${reason || "Không lý do"}]`;
    await order.save();

    res.json({ success: true, message: "Hủy đơn hàng thành công", data: order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export default { createOrder, getOrder, getMyOrders, momoIPN, vnpayIPN, vnpayReturn, checkPaymentStatus, generateGreetingsAPI, sepayWebhook, getAllOrders, updateOrderStatus, deleteOrder, simulatePayment, cancelOrder };


