import axios from "axios";
import crypto from "crypto";

// MoMo Sandbox Config - TEST CREDENTIALS (Public)
// Docs: https://developers.momo.vn/v3/docs/payment/onboarding/test-card/
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
  secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint:
    process.env.MOMO_ENDPOINT ||
    "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl:
    process.env.MOMO_REDIRECT_URL || "http://localhost:5173/checkout",
  ipnUrl: process.env.MOMO_IPN_URL || "http://localhost:5001/api/orders/momo-ipn",
  requestType: "captureWallet", // hoặc payWithATM, payWithCC
};

/**
 * Tạo yêu cầu thanh toán MoMo
 * @param {Object} order - Thông tin đơn hàng (orderCode, totalAmount, customerInfo)
 * @returns {Object} - { payUrl, deeplink, qrCodeUrl } hoặc lỗi
 */
export const createMomoPayment = async (order) => {
  try {
    const orderId = order.orderCode + "_" + Date.now();
    const requestId = orderId;
    const amount = order.totalAmount;
    const orderInfo = `Thanh toán đơn hàng ${order.orderCode} - Giftnity`;
    const extraData = ""; // Base64 encoded JSON nếu cần

    // Tạo chữ ký HMAC SHA256
    // Theo docs MoMo v2:
    // rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData +
    //                "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo +
    //                "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl +
    //                "&requestId=" + requestId + "&requestType=" + requestType
    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${MOMO_CONFIG.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${MOMO_CONFIG.partnerCode}`,
      `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${MOMO_CONFIG.requestType}`,
    ].join("&");

    const signature = crypto
      .createHmac("sha256", MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest("hex");

    // Tạo request body
    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      extraData: extraData,
      requestType: MOMO_CONFIG.requestType,
      signature: signature,
      lang: "vi",
    };

    console.log("🔐 MoMo Request:", JSON.stringify(requestBody, null, 2));

    // Gọi API MoMo
    const response = await axios.post(MOMO_CONFIG.endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📥 MoMo Response:", JSON.stringify(response.data, null, 2));

    if (response.data.resultCode === 0) {
      return {
        success: true,
        payUrl: response.data.payUrl,
        deeplink: response.data.deeplink,
        qrCodeUrl: response.data.qrCodeUrl,
        orderId: orderId,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Lỗi tạo thanh toán MoMo",
        resultCode: response.data.resultCode,
      };
    }
  } catch (error) {
    console.error("❌ MoMo API Error:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Xác thực chữ ký từ MoMo IPN callback
 */
export const verifyMomoSignature = (data) => {
  const rawSignature = [
    `accessKey=${MOMO_CONFIG.accessKey}`,
    `amount=${data.amount}`,
    `extraData=${data.extraData}`,
    `message=${data.message}`,
    `orderId=${data.orderId}`,
    `orderInfo=${data.orderInfo}`,
    `orderType=${data.orderType}`,
    `partnerCode=${data.partnerCode}`,
    `payType=${data.payType}`,
    `requestId=${data.requestId}`,
    `responseTime=${data.responseTime}`,
    `resultCode=${data.resultCode}`,
    `transId=${data.transId}`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  return signature === data.signature;
};

export default {
  createMomoPayment,
  verifyMomoSignature,
};
